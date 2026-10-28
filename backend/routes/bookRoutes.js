const express = require("express");
const router = express.Router();

const Book = require("../models/Book");

// Lấy danh sách và tìm kiếm sách
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";

    const books = await Book.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: "Loi lay danh sach sach"
    });
  }
});

// Xem chi tiết sách
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({
      message: "ID sach khong hop le"
    });
  }
});

// Thêm sách
router.post("/", async (req, res) => {
  try {
    const book = new Book(req.body);

    await book.save();

    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma sach da ton tai"
      });
    }

    res.status(400).json({
      message: "Du lieu sach khong hop le"
    });
  }
});

// Cập nhật sách
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma sach da ton tai"
      });
    }

    res.status(400).json({
      message: "Cap nhat that bai"
    });
  }
});

// Xóa sách
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(
      req.params.id
    );

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json({
      message: "Xoa sach thanh cong"
    });
  } catch (error) {
    res.status(400).json({
      message: "ID sach khong hop le"
    });
  }
});

module.exports = router;