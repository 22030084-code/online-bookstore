import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import initialBooks from "../data/books";

import {
  addBook as addBookRequest,
  createOrder as createOrderRequest,
  deleteBook as deleteBookRequest,
  getBooks,
  getMyOrders,
  loginUser,
  signupUser,
} from "../api";

const StoreContext = createContext(null);

const CART_KEY = "bookstore_cart";
const USER_KEY = "bookstore_user";
const TOKEN_KEY = "bookstore_token";
const DEMO_BOOKS_KEY = "bookstore_demo_books";
const DEMO_ORDERS_KEY = "bookstore_demo_orders";

function readStorage(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);

    return savedValue
      ? JSON.parse(savedValue)
      : fallback;
  } catch {
    return fallback;
  }
}

function isNetworkError(error) {
  const message = error?.message?.toLowerCase() || "";

  return (
    error instanceof TypeError ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed")
  );
}

function formatBook(book) {
  return {
    ...book,
    price: Number(book.price),
    rating: Number(book.rating),
    stock: Number(book.stock),
    emoji: book.image_url || book.emoji || "📖",
  };
}

export function StoreProvider({ children }) {
  const [books, setBooks] = useState([]);

  const [cart, setCart] = useState(() =>
    readStorage(CART_KEY, [])
  );

  const [user, setUser] = useState(() =>
    readStorage(USER_KEY, null)
  );

  const [orders, setOrders] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  function saveCart(nextCart) {
    setCart(nextCart);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextCart)
    );
  }

  function saveUser(nextUser, token = "demo-token") {
    setUser(nextUser);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(nextUser)
    );

    localStorage.setItem(TOKEN_KEY, token);
  }

  function saveDemoBooks(nextBooks) {
    const formattedBooks = nextBooks.map(formatBook);

    setBooks(formattedBooks);

    localStorage.setItem(
      DEMO_BOOKS_KEY,
      JSON.stringify(formattedBooks)
    );
  }

  function getDemoBooks() {
    const savedBooks = readStorage(
      DEMO_BOOKS_KEY,
      initialBooks
    );

    return savedBooks.map(formatBook);
  }

  async function loadBooks() {
    try {
      setBooksLoading(true);

      const data = await getBooks();

      const formattedBooks = data.books.map(formatBook);

      setBooks(formattedBooks);
    } catch (error) {
      if (!isNetworkError(error)) {
        console.error("Unable to load books:", error);
      }

      const demoBooks = getDemoBooks();

      setBooks(demoBooks);
    } finally {
      setBooksLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function addToCart(book) {
    if (Number(book.stock) <= 0) {
      return;
    }

    const existingItem = cart.find(
      (item) => item.id === book.id
    );

    let nextCart;

    if (existingItem) {
      nextCart = cart.map((item) =>
        item.id === book.id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                Number(item.stock)
              ),
            }
          : item
      );
    } else {
      nextCart = [
        ...cart,
        {
          ...book,
          quantity: 1,
        },
      ];
    }

    saveCart(nextCart);
  }

  function updateQuantity(id, quantity) {
    const numericQuantity = Number(quantity);

    const nextCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: Math.max(
              1,
              Math.min(
                numericQuantity,
                Number(item.stock)
              )
            ),
          }
        : item
    );

    saveCart(nextCart);
  }

  function removeFromCart(id) {
    const nextCart = cart.filter(
      (item) => item.id !== id
    );

    saveCart(nextCart);
  }

  function clearCart() {
    saveCart([]);
  }

  async function login(email, password) {
    try {
      const data = await loginUser({
        email,
        password,
      });

      const loggedInUser = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      };

      saveUser(loggedInUser, data.token);

      return loggedInUser;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      if (!email || !password) {
        throw new Error(
          "Email and password are required"
        );
      }

      if (password.length < 6) {
        throw new Error(
          "Password must contain at least 6 characters"
        );
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const adminEmails = [
        "admin@bookstore.com",
        "test@bookstore.com",
      ];

      const demoUser = {
        id: Date.now(),

        name:
          normalizedEmail === "admin@bookstore.com"
            ? "Administrator"
            : normalizedEmail
                .split("@")[0]
                .replace(/[._-]/g, " "),

        email: normalizedEmail,

        role: adminEmails.includes(normalizedEmail)
          ? "admin"
          : "customer",
      };

      saveUser(demoUser);

      return demoUser;
    }
  }

  async function signup(name, email, password) {
    try {
      const data = await signupUser({
        fullName: name,
        email,
        password,
      });

      const registeredUser = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      };

      saveUser(registeredUser, data.token);

      return registeredUser;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      if (!name || !email || !password) {
        throw new Error(
          "Please complete all fields"
        );
      }

      if (password.length < 6) {
        throw new Error(
          "Password must contain at least 6 characters"
        );
      }

      const demoUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "customer",
      };

      saveUser(demoUser);

      return demoUser;
    }
  }

  function logout() {
    setUser(null);
    setOrders([]);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function addBook(bookData) {
    try {
      const data = await addBookRequest({
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        description: bookData.description,
        price: Number(bookData.price),
        rating: Number(bookData.rating),
        stock: Number(bookData.stock),
        imageUrl: bookData.emoji || null,
      });

      await loadBooks();

      return data.book;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const newBook = formatBook({
        id: Date.now(),
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        category: bookData.category,
        description: bookData.description.trim(),
        price: Number(bookData.price),
        rating: Number(bookData.rating),
        stock: Number(bookData.stock),
        emoji: bookData.emoji || "📖",
      });

      const nextBooks = [
        newBook,
        ...books,
      ];

      saveDemoBooks(nextBooks);

      return newBook;
    }
  }

  async function deleteBook(id) {
    try {
      await deleteBookRequest(id);
      await loadBooks();
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const nextBooks = books.filter(
        (book) => book.id !== id
      );

      saveDemoBooks(nextBooks);
    }
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );

    const shipping =
      subtotal === 0 || subtotal >= 50
        ? 0
        : 5;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [cart]);

  async function placeOrder(customerData) {
    const items = cart.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
    }));

    try {
      const data = await createOrderRequest({
        fullName: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        city: customerData.city,
        address: customerData.address,
        paymentMethod: "Cash on Delivery",
        items,
      });

      clearCart();
      await loadBooks();

      return data.order;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const demoOrder = {
        id: Date.now()
          .toString()
          .slice(-6),

        user_email: user?.email,

        full_name: customerData.name,

        email: customerData.email,

        phone: customerData.phone,

        city: customerData.city,

        address: customerData.address,

        payment_method: "Cash on Delivery",

        total_amount: totals.total,

        status: "Processing",

        created_at: new Date().toISOString(),

        items: cart.map((item) => ({
          id: item.id,
          book_id: item.id,
          title: item.title,
          author: item.author,
          quantity: item.quantity,
          price: Number(item.price),
          image_url: item.emoji || "📖",
        })),
      };

      const savedOrders = readStorage(
        DEMO_ORDERS_KEY,
        []
      );

      localStorage.setItem(
        DEMO_ORDERS_KEY,
        JSON.stringify([
          demoOrder,
          ...savedOrders,
        ])
      );

      const updatedBooks = books.map((book) => {
        const cartItem = cart.find(
          (item) => item.id === book.id
        );

        if (!cartItem) {
          return book;
        }

        return {
          ...book,
          stock: Math.max(
            0,
            Number(book.stock) -
              Number(cartItem.quantity)
          ),
        };
      });

      saveDemoBooks(updatedBooks);
      clearCart();

      return {
        id: demoOrder.id,
        totalAmount: totals.total,
        status: "Processing",
      };
    }
  }

  async function loadMyOrders() {
    try {
      const data = await getMyOrders();

      setOrders(data.orders);

      return data.orders;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const savedOrders = readStorage(
        DEMO_ORDERS_KEY,
        []
      );

      const userOrders = savedOrders.filter(
        (order) =>
          !order.user_email ||
          order.user_email === user?.email
      );

      setOrders(userOrders);

      return userOrders;
    }
  }

  const value = {
    books,
    booksLoading,
    cart,
    user,
    orders,

    ...totals,

    loadBooks,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    login,
    signup,
    logout,

    addBook,
    deleteBook,

    placeOrder,
    loadMyOrders,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return context;
}