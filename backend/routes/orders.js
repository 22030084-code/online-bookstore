const express = require("express");
const pool = require("../db");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new order
router.post("/", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      fullName,
      email,
      phone,
      city,
      address,
      paymentMethod = "Cash on Delivery",
      items,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !city ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer information and order items are required",
      });
    }

    await connection.beginTransaction();

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const bookId = Number(item.bookId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(bookId) ||
        bookId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid book ID or quantity",
        });
      }

      const [books] = await connection.query(
        `
          SELECT id, title, price, stock
          FROM books
          WHERE id = ?
          FOR UPDATE
        `,
        [bookId]
      );

      if (books.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: `Book with ID ${bookId} was not found`,
        });
      }

      const book = books[0];

      if (book.stock < quantity) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${book.title}`,
        });
      }

      const price = Number(book.price);

      totalAmount += price * quantity;

      orderItems.push({
        bookId,
        quantity,
        price,
      });
    }

    const [orderResult] = await connection.query(
      `
        INSERT INTO orders (
          user_id,
          full_name,
          email,
          phone,
          city,
          address,
          payment_method,
          total_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        city.trim(),
        address.trim(),
        paymentMethod,
        totalAmount,
      ]
    );

    for (const item of orderItems) {
      await connection.query(
        `
          INSERT INTO order_items (
            order_id,
            book_id,
            quantity,
            price
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          item.bookId,
          item.quantity,
          item.price,
        ]
      );

      await connection.query(
        `
          UPDATE books
          SET stock = stock - ?
          WHERE id = ?
        `,
        [item.quantity, item.bookId]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: orderResult.insertId,
        totalAmount: Number(totalAmount.toFixed(2)),
        status: "Processing",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to place the order",
    });
  } finally {
    connection.release();
  }
});

// Get logged-in user's orders
router.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `
        SELECT
          id,
          full_name,
          email,
          phone,
          city,
          address,
          payment_method,
          total_amount,
          status,
          created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `
          SELECT
            order_items.id,
            order_items.book_id,
            order_items.quantity,
            order_items.price,
            books.title,
            books.author,
            books.image_url
          FROM order_items
          INNER JOIN books
            ON books.id = order_items.book_id
          WHERE order_items.order_id = ?
        `,
        [order.id]
      );

      order.items = items;
    }

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve orders",
    });
  }
});

// Get all orders — admin only
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [orders] = await pool.query(`
        SELECT
          orders.id,
          orders.user_id,
          orders.full_name,
          orders.email,
          orders.phone,
          orders.city,
          orders.address,
          orders.payment_method,
          orders.total_amount,
          orders.status,
          orders.created_at
        FROM orders
        ORDER BY orders.created_at DESC
      `);

      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error("Get all orders error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to retrieve orders",
      });
    }
  }
);

// Update order status — admin only
router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "Processing",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const [result] = await pool.query(
        `
          UPDATE orders
          SET status = ?
          WHERE id = ?
        `,
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Update order status error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update order status",
      });
    }
  }
);

module.exports = router;