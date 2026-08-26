import uuid
from django.conf import settings
from django.db import models


class Payment(models.Model):
    """Payment record for orders or subscriptions."""

    class Method(models.TextChoices):
        CARD = "card", "Credit/Debit Card"
        UPI = "upi", "UPI"
        NET_BANKING = "net_banking", "Net Banking"
        WALLET = "wallet", "Wallet"
        COD = "cod", "Cash on Delivery"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    subscription = models.ForeignKey(
        "subscriptions.Subscription",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(
        max_length=15,
        choices=Method.choices,
        default=Method.CARD,
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    upi_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        default=uuid.uuid4,
        editable=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.transaction_id} — {self.status}"
