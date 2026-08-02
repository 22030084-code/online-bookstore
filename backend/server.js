require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db");
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const ordersRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Bookstore API is running",
  });
});

// Test server and database
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      status: "Server and database are working",
    });
  } catch (error) {
    console.error("Database health error:", error);

    res.status(500).json({
      success: false,
      status: "Server is working, but database connection failed",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/orders", ordersRoutes);

// Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bookstore server running on http://localhost:${PORT}`);
});