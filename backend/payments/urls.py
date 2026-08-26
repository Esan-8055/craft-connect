from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.PaymentViewSet, basename="payment")

urlpatterns = [
    path("create-order/", views.create_order, name="create-order"),
    path("verify-payment/", views.verify_payment, name="verify-payment"),
    path("", include(router.urls)),
]
