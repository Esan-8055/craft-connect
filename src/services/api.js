/**
 * Craft Connect — Optimized High-Performance API Service Layer
 * - In-memory caching for GET requests (Instant 0ms UI loads)
 * - Strict 2.5-second network timeout with AbortController
 * - Automatic cache invalidation on mutations
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const DEFAULT_TIMEOUT_MS = 2500;

// Simple in-memory cache
const apiCache = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds TTL

export const clearApiCache = () => apiCache.clear();

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
  clearApiCache();
};

// ─── Generic fetch wrapper with AbortController ─────────────────────────────
const apiFetch = async (endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getAccessToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Handle 401 — try token refresh
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${getAccessToken()}`;
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeoutMs);
        const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
          signal: retryController.signal,
        });
        clearTimeout(retryTimeoutId);
        return handleResponse(retryResponse);
      } else {
        clearTokens();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    return handleResponse(response);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("Network request timed out");
    }
    throw err;
  }
};

const handleResponse = async (response) => {
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
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: getRefreshToken() }),
      signal: controller.signal,
    });
    clearTimeout(tId);
    if (!response.ok) return false;
    const data = await response.json();
    localStorage.setItem("cc_access_token", data.access);
    return true;
  } catch {
    return false;
  }
};

// ─── API methods with In-Memory Caching ─────────────────────────────────────
export const apiGet = async (endpoint, useCache = true) => {
  const cacheKey = endpoint;
  const now = Date.now();

  if (useCache && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const data = await apiFetch(endpoint, { method: "GET" });
    if (useCache && data) {
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  } catch (err) {
    if (apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey).data;
    }
    throw err;
  }
};

export const apiPost = async (endpoint, body) => {
  clearApiCache();
  return apiFetch(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  }, 15000); // 15 seconds for mutations
};

export const apiPut = async (endpoint, body) => {
  clearApiCache();
  return apiFetch(endpoint, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  }, 15000);
};

export const apiPatch = async (endpoint, body) => {
  clearApiCache();
  return apiFetch(endpoint, {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body),
  }, 15000);
};

export const apiDelete = async (endpoint) => {
  clearApiCache();
  return apiFetch(endpoint, { method: "DELETE" }, 15000);
};

// ─── Auth APIs ──────────────────────────────────────────────────────────────
export const loginAPI = (username, password) =>
  apiPost("/accounts/login/", { username, password });

export const registerAPI = (userData) =>
  apiPost("/accounts/register/", userData);

export const getProfile = () => apiGet("/accounts/profile/", false);

// ─── Product APIs ───────────────────────────────────────────────────────────
export const getPublishedProducts = () => apiGet("/products/");
export const getMyProducts = () => apiGet("/products/my-products/", false);
export const createProduct = (formData) => apiPost("/products/", formData);
export const publishProduct = (id) => apiPost(`/products/${id}/publish/`);
export const unpublishProduct = (id) => apiPost(`/products/${id}/unpublish/`);
export const deleteProduct = (id) => apiDelete(`/products/${id}/`);

// ─── Course APIs ────────────────────────────────────────────────────────────
export const getPublishedCourses = () => apiGet("/courses/");
export const getMyCourses = () => apiGet("/courses/my-courses/", false);
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



