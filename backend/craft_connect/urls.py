"""
Root URL configuration for craft_connect project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from payments.views import create_order, verify_payment

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/create-order", create_order, name="api-create-order-no-slash"),
    path("api/create-order/", create_order, name="api-create-order"),
    path("api/verify-payment", verify_payment, name="api-verify-payment-no-slash"),
    path("api/verify-payment/", verify_payment, name="api-verify-payment"),
    path("api/accounts/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/subscriptions/", include("subscriptions.urls")),
    path("api/recommendations/", include("recommendations.urls")),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
