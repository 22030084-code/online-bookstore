const express = require("express");
const pool = require("../db");

const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT
        id,
        title,
        author,
        category,
        description,
        price,
        rating,
        stock,
        image_url,
        created_at
      FROM books
      WHERE 1 = 1
    `;

    const values = [];

    if (search) {
      query += `
        AND (
          title LIKE ?
          OR author LIKE ?
        )
      `;

      const searchValue = `%${search}%`;
      values.push(searchValue, searchValue);
    }

    if (category && category !== "All") {
      query += " AND category = ?";
      values.push(category);
    }

    query += " ORDER BY created_at DESC";

    const [books] = await pool.query(query, values);

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("Get books error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve books",
    });
  }
});

// Get one book
router.get("/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);

    if (!Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const [books] = await pool.query(
      `
        SELECT
          id,
          title,
          author,
          category,
          description,
          price,
          rating,
          stock,
          image_url,
          created_at
        FROM books
        WHERE id = ?
      `,
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      book: books[0],
    });
  } catch (error) {
    console.error("Get book error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve the book",
    });
  }
});

// Add a book — admin only
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        author,
        category,
        description = "",
        price,
        rating = 0,
        stock = 0,
        imageUrl = null,
      } = req.body;

      if (!title || !author || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Title, author, category, and price are required",
        });
      }

      const numericPrice = Number(price);
      const numericRating = Number(rating);
      const numericStock = Number(stock);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0 ||
        Number.isNaN(numericRating) ||
        numericRating < 0 ||
        numericRating > 5 ||
        !Number.isInteger(numericStock) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price, rating, or stock value is invalid",
        });
      }

      const [result] = await pool.query(
        `
          INSERT INTO books (
            title,
            author,
            category,
            description,
            price,
            rating,
            stock,
            image_url
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          title.trim(),
          author.trim(),
          category.trim(),
          description.trim(),
          numericPrice,
          numericRating,
          numericStock,
          imageUrl || null,
        ]
      );

      const [createdBooks] = await pool.query(
        "SELECT * FROM books WHERE id = ?",
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: "Book added successfully",
        book: createdBooks[0],
      });
    } catch (error) {
      console.error("Add book error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to add the book",
      });
    }
  }
);

// Update a book — admin only
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const bookId = Number(req.params.id);

      const {
        title,
        author,
        category,
        description = "",
        price,
        rating = 0,
        stock = 0,
        imageUrl = null,
      } = req.body;

      if (!Number.isInteger(bookId) || bookId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
      }

      if (!title || !author || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Title, author, category, and price are required",
        });
      }

      const numericPrice = Number(price);
      const numericRating = Number(rating);
      const numericStock = Number(stock);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0 ||
        Number.isNaN(numericRating) ||
        numericRating < 0 ||
        numericRating > 5 ||
        !Number.isInteger(numericStock) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price, rating, or stock value is invalid",
        });
      }

      const [result] = await pool.query(
        `
          UPDATE books
          SET
            title = ?,
            author = ?,
            category = ?,
            description = ?,
            price = ?,
            rating = ?,
            stock = ?,
            image_url = ?
          WHERE id = ?
        `,
        [
          title.trim(),
          author.trim(),
          category.trim(),
          description.trim(),
          numericPrice,
          numericRating,
          numericStock,
          imageUrl || null,
          bookId,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      const [updatedBooks] = await pool.query(
        "SELECT * FROM books WHERE id = ?",
        [bookId]
      );

      res.json({
        success: true,
        message: "Book updated successfully",
        book: updatedBooks[0],
      });
    } catch (error) {
      console.error("Update book error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update the book",
      });
    }
  }
);

// Delete a book — admin only
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const bookId = Number(req.params.id);

      if (!Number.isInteger(bookId) || bookId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
      }

      const [result] = await pool.query(
        "DELETE FROM books WHERE id = ?",
        [bookId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.json({
        success: true,
        message: "Book deleted successfully",
      });
    } catch (error) {
      console.error("Delete book error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to delete the book",
      });
    }
  }
);

module.exports = router;