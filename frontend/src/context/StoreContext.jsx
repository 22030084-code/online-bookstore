import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

function readStorage(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);

    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState(() =>
    readStorage("bookstore_cart", [])
  );

  const [user, setUser] = useState(() =>
    readStorage("bookstore_user", null)
  );

  const [orders, setOrders] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  function saveCart(nextCart) {
    setCart(nextCart);

    localStorage.setItem(
      "bookstore_cart",
      JSON.stringify(nextCart)
    );
  }

  function saveUser(nextUser, token) {
    setUser(nextUser);

    localStorage.setItem(
      "bookstore_user",
      JSON.stringify(nextUser)
    );

    if (token) {
      localStorage.setItem("bookstore_token", token);
    }
  }

  async function loadBooks() {
    try {
      setBooksLoading(true);

      const data = await getBooks();

      const formattedBooks = data.books.map((book) => ({
        ...book,
        price: Number(book.price),
        rating: Number(book.rating),
        stock: Number(book.stock),
        emoji: book.image_url || "📖",
      }));

      setBooks(formattedBooks);
    } catch (error) {
      console.error("Unable to load books:", error);
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function addToCart(book) {
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
                item.stock
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
              Math.min(numericQuantity, item.stock)
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
  }

  async function signup(name, email, password) {
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
  }

  function logout() {
    setUser(null);
    setOrders([]);

    localStorage.removeItem("bookstore_user");
    localStorage.removeItem("bookstore_token");
  }

  async function addBook(bookData) {
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
  }

  async function deleteBook(id) {
    await deleteBookRequest(id);
    await loadBooks();
  }

  async function placeOrder(customerData) {
    const items = cart.map((item) => ({
      bookId: item.id,
      quantity: item.quantity,
    }));

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
  }

  async function loadMyOrders() {
    const data = await getMyOrders();

    setOrders(data.orders);

    return data.orders;
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) =>
        sum + Number(item.price) * item.quantity,
      0
    );

    const shipping =
      subtotal === 0 || subtotal >= 50 ? 0 : 5;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [cart]);

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