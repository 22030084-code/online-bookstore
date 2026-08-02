const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("bookstore_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Authentication
export function signupUser(userData) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(userData) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Books
export function getBooks() {
  return apiRequest("/books");
}

export function getBookById(bookId) {
  return apiRequest(`/books/${bookId}`);
}

export function addBook(bookData) {
  return apiRequest("/books", {
    method: "POST",
    body: JSON.stringify(bookData),
  });
}

export function updateBook(bookId, bookData) {
  return apiRequest(`/books/${bookId}`, {
    method: "PUT",
    body: JSON.stringify(bookData),
  });
}

export function deleteBook(bookId) {
  return apiRequest(`/books/${bookId}`, {
    method: "DELETE",
  });
}

// Orders
export function createOrder(orderData) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export function getMyOrders() {
  return apiRequest("/orders/my-orders");
}

export function getAllOrders() {
  return apiRequest("/orders/admin/all");
}

export function updateOrderStatus(orderId, status) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}