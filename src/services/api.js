/**
 * Craft Connect — API Service Layer
 * Central helper for all backend communication with JWT auth.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ─── Token helpers ──────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("cc_access_token");
export const getRefreshToken = () => localStorage.getItem("cc_refresh_token");

export const setTokens = (access, refresh) => {
  localStorage.setItem("cc_access_token", access);
  localStorage.setItem("cc_refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("cc_access_token");
  localStorage.removeItem("cc_refresh_token");
  localStorage.removeItem("cc_user");
};

// ─── Generic fetch wrapper ──────────────────────────────────────────────────
const apiFetch = async (endpoint, options = {}) => {
  const token = getAccessToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON bodies (not FormData)
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — try token refresh
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return handleResponse(retryResponse);
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  return handleResponse(response);
};

const handleResponse = async (response) => {
  // Handle 204 No Content (e.g. DELETE responses)
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    let errorMsg = data?.detail || data?.non_field_errors?.[0];
    if (!errorMsg && data && typeof data === 'object') {
      errorMsg = Object.entries(data)
        .map(([k, v]) => `${k.replace('_', ' ')}: ${Array.isArray(v) ? v.join(' ') : v}`)
        .join(' • ');
    }
    throw new Error(errorMsg || `Request failed (${response.status})`);
  }
  return data;
};

const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: getRefreshToken() }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    localStorage.setItem("cc_access_token", data.access);
    return true;
  } catch {
    return false;
  }
};

// ─── API methods ────────────────────────────────────────────────────────────
export const apiGet = (endpoint) => apiFetch(endpoint, { method: "GET" });

export const apiPost = (endpoint, body) =>
  apiFetch(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPut = (endpoint, body) =>
  apiFetch(endpoint, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPatch = (endpoint, body) =>
  apiFetch(endpoint, {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiDelete = (endpoint) =>
  apiFetch(endpoint, { method: "DELETE" });

// ─── Auth APIs ──────────────────────────────────────────────────────────────
export const loginAPI = (username, password) =>
  apiPost("/accounts/login/", { username, password });

export const registerAPI = (userData) =>
  apiPost("/accounts/register/", userData);

export const getProfile = () => apiGet("/accounts/profile/");

// ─── Product APIs ───────────────────────────────────────────────────────────
export const getPublishedProducts = () => apiGet("/products/");
export const getMyProducts = () => apiGet("/products/my-products/");
export const createProduct = (formData) => apiPost("/products/", formData);
export const publishProduct = (id) => apiPost(`/products/${id}/publish/`);
export const unpublishProduct = (id) => apiPost(`/products/${id}/unpublish/`);
export const deleteProduct = (id) => apiDelete(`/products/${id}/`);

// ─── Course APIs ────────────────────────────────────────────────────────────
export const getPublishedCourses = () => apiGet("/courses/");
export const getMyCourses = () => apiGet("/courses/my-courses/");
export const createCourse = (formData) => apiPost("/courses/", formData);
export const publishCourse = (id) => apiPost(`/courses/${id}/publish/`);
export const unpublishCourse = (id) => apiPost(`/courses/${id}/unpublish/`);
export const deleteCourse = (id) => apiDelete(`/courses/${id}/`);

// ─── Order APIs ─────────────────────────────────────────────────────────────
export const createOrderAPI = (orderData) => apiPost("/orders/", orderData);
export const getOrdersAPI = () => apiGet("/orders/");
export const getOrderDetailAPI = (id) => apiGet(`/orders/${id}/`);

// ─── Payment APIs ───────────────────────────────────────────────────────────
export const createPaymentAPI = (paymentData) => apiPost("/payments/", paymentData);
export const getPaymentsAPI = () => apiGet("/payments/");

// ─── Razorpay Payment Gateway APIs ───────────────────────────────────────────
export const createRazorpayOrderAPI = (data) => apiPost("/create-order/", data);
export const verifyRazorpayPaymentAPI = (data) => apiPost("/verify-payment/", data);


