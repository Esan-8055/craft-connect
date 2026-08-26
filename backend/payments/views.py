import time
import razorpay
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    """
    Payments API.
    - Authenticated users: create payments, view own payments.
    - Admins: view all payments.
    """

    serializer_class = PaymentSerializer
    filterset_fields = ["status", "method"]
    ordering_fields = ["created_at", "amount"]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        payment = serializer.save(user=self.request.user, status="completed")
        if payment.order:
            payment.order.status = "processing"
            payment.order.save(update_fields=["status"])
        
        # Publish event to Aiven Kafka
        try:
            from craft_connect.kafka_producer import publish_kafka_event
            publish_kafka_event(
                topic="payment-events",
                event_type="PAYMENT_COMPLETED",
                payload={
                    "payment_id": payment.id,
                    "transaction_id": str(payment.transaction_id),
                    "user_id": payment.user.id,
                    "order_id": payment.order.id if payment.order else None,
                    "amount": str(payment.amount),
                    "method": payment.method,
                    "upi_id": payment.upi_id,
                    "status": payment.status
                }
            )
        except Exception as e:
            print(f"[KAFKA] Non-blocking event dispatch warning: {e}")


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    STEP 1: BACKEND - Create Order
    Endpoint: POST /api/create-order or /api/payments/create-order/
    Request: { amount (in paise or rupees), currency, receipt }
    Return: { order_id, amount, currency, key_id }
    """
    try:
        raw_amount = request.data.get('amount')
        if raw_amount is None:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            num_amount = float(raw_amount)
        except (ValueError, TypeError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert to paise if amount is in rupees (minimum amount is 100 paise = ₹1)
        if request.data.get('in_paise', False) or (num_amount >= 100 and num_amount % 1 == 0 and num_amount > 5000):
            amount_in_paise = int(num_amount)
        else:
            amount_in_paise = int(round(num_amount * 100))

        if amount_in_paise < 100:
            return Response({"error": "Minimum amount must be at least 100 paise (₹1)"}, status=status.HTTP_400_BAD_REQUEST)

        currency = request.data.get('currency', 'INR')
        receipt = request.data.get('receipt', f"rcpt_{int(time.time())}")

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_TUR8r68CSqlefv')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'rQ9fke7j3KC3qz3uT0ben1H3')

        client = razorpay.Client(auth=(key_id, key_secret))
        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": receipt
        }
        
        razorpay_order = client.order.create(data=order_data)
        
        return Response({
            "order_id": razorpay_order.get("id"),
            "amount": razorpay_order.get("amount"),
            "currency": razorpay_order.get("currency"),
            "key_id": key_id
        }, status=status.HTTP_200_OK)

    except razorpay.errors.RazorpayError as e:
        return Response({"error": f"Razorpay API Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({"error": f"Failed to create order: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_payment(request):
    """
    STEP 3: BACKEND - Verify Signature
    Endpoint: POST /api/verify-payment or /api/payments/verify-payment/
    Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    Return: success only if signatures match.
    """
    payment_id = request.data.get('razorpay_payment_id')
    order_id = request.data.get('razorpay_order_id')
    signature = request.data.get('razorpay_signature')

    if not payment_id or not order_id or not signature:
        return Response({
            "status": "error",
            "message": "Missing required parameters: razorpay_payment_id, razorpay_order_id, and razorpay_signature are required"
        }, status=status.HTTP_400_BAD_REQUEST)

    key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_TUR8r68CSqlefv')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'rQ9fke7j3KC3qz3uT0ben1H3')

    client = razorpay.Client(auth=(key_id, key_secret))

    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
        
        return Response({
            "status": "success",
            "message": "Payment verified successfully",
            "payment_id": payment_id,
            "order_id": order_id
        }, status=status.HTTP_200_OK)

    except razorpay.errors.SignatureVerificationError:
        return Response({
            "status": "error",
            "message": "Signature verification failed. Invalid razorpay_signature."
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Verification error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
