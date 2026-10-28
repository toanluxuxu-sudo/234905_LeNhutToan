
import { useEffect, useState } from 'react'
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
} from './api'
import './App.css'

const emptyForm = {
  bookId: '',
  title: '',
  author: '',
  category: '',
  publisher: '',
  publishYear: '',
  isbn: '',
  quantity: 1,
  description: '',
}

function App() {
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Lấy dữ liệu sách từ backend
  async function loadBooks(searchText = search) {
    try {
      setLoading(true)
      setError('')

      const data = await getBooks(searchText)

      // Hỗ trợ backend trả về mảng hoặc { books: [...] }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.books)
          ? data.books
          : []

      setBooks(list)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Không thể tải danh sách sách. Hãy kiểm tra backend và API URL.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks('')
  }, [])

  // Cập nhật các trường trong biểu mẫu
  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // Thêm mới hoặc cập nhật sách
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.bookId.trim() || !form.title.trim() || !form.author.trim()) {
      setError('Vui lòng nhập Mã sách, Tên sách và Tác giả.')
      return
    }

    const payload = {
      ...form,
      bookId: form.bookId.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      publisher: form.publisher.trim(),
      publishYear: form.publishYear
        ? Number(form.publishYear)
        : null,
      isbn: form.isbn.trim(),
      quantity: Number(form.quantity) || 0,
      description: form.description.trim(),
    }

    try {
      setSaving(true)

      if (editingId !== null) {
        await updateBook(editingId, payload)
        setMessage('Cập nhật sách thành công!')
      } else {
        await addBook(payload)
        setMessage('Thêm sách thành công!')
      }

      setForm({ ...emptyForm })
      setEditingId(null)
      await loadBooks()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Không thể lưu sách. Hãy kiểm tra API backend.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Đưa thông tin sách lên biểu mẫu để chỉnh sửa
  function handleEdit(book) {
    const id = book.bookId ?? book._id

    setEditingId(id)
    setForm({
      bookId: book.bookId ?? '',
      title: book.title ?? '',
      author: book.author ?? '',
      category: book.category ?? '',
      publisher: book.publisher ?? '',
      publishYear: book.publishYear ?? '',
      isbn: book.isbn ?? '',
      quantity: book.quantity ?? 1,
      description: book.description ?? '',
    })

    setError('')
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Xóa sách
  async function handleDelete(book) {
    const id = book.bookId ?? book._id

    if (!window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteBook(id)
      setMessage('Xóa sách thành công!')
      await loadBooks()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Không thể xóa sách. Hãy kiểm tra API backend.'
      )
    }
  }

  // Hủy chỉnh sửa
  function handleCancel() {
    setForm({ ...emptyForm })
    setEditingId(null)
    setError('')
    setMessage('')
  }

  // Tìm kiếm theo backend
  async function handleSearch(event) {
    event.preventDefault()
    await loadBooks(search.trim())
  }

  // Xuất danh sách sách thành file CSV
  function handleExport() {
    const headers = [
      'Mã sách',
      'Tên sách',
      'Tác giả',
      'Thể loại',
      'Nhà xuất bản',
      'Năm xuất bản',
      'ISBN',
      'Số lượng',
      'Mô tả',
    ]

    const rows = books.map((book) => [
      book.bookId,
      book.title,
      book.author,
      book.category,
      book.publisher,
      book.publishYear,
      book.isbn,
      book.quantity,
      book.description,
    ])

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n')

    // BOM giúp Excel hiển thị tiếng Việt đúng
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'danh-sach-sach.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>QUẢN LÝ SÁCH</h1>
            <p>Hệ thống quản lý sách sử dụng React, Node.js và MongoDB</p>
          </div>

          <div className="book-count">
            <span>Tổng số sách</span>
            <strong>{books.length}</strong>
          </div>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId !== null ? 'Cập nhật sách' : 'Thêm sách mới'}</h2>
              <p>Nhập thông tin sách vào biểu mẫu bên dưới.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bookId">Mã sách *</label>
                <input
                  id="bookId"
                  name="bookId"
                  value={form.bookId}
                  onChange={handleChange}
                  placeholder="VD: S001"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Tên sách *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sách"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Tác giả *</label>
                <input
                  id="author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Nhập tên tác giả"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Thể loại</label>
                <input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="VD: Công nghệ thông tin"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisher">Nhà xuất bản</label>
                <input
                  id="publisher"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="Nhập nhà xuất bản"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publishYear">Năm xuất bản</label>
                <input
                  id="publishYear"
                  name="publishYear"
                  type="number"
                  min="0"
                  value={form.publishYear}
                  onChange={handleChange}
                  placeholder="VD: 2025"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="Nhập mã ISBN"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Số lượng</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả sách..."
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Đang lưu...'
                  : editingId !== null
                    ? 'Cập nhật sách'
                    : 'Thêm sách'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="list-heading">
            <div>
              <h2>Danh sách sách</h2>
              <p>Tra cứu và quản lý dữ liệu sách trong hệ thống.</p>
            </div>

            <button
              type="button"
              className="btn btn-export"
              onClick={handleExport}
              disabled={books.length === 0}
            >
              Xuất CSV
            </button>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã sách, tên sách hoặc tác giả..."
              aria-label="Tìm kiếm sách"
            />

            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('')
                loadBooks('')
              }}
            >
              Làm mới
            </button>
          </form>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã sách</th>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th>Thể loại</th>
                  <th>Nhà xuất bản</th>
                  <th>Năm XB</th>
                  <th>Số lượng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="table-message">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="table-message">
                      Chưa có dữ liệu sách.
                    </td>
                  </tr>
                ) : (
                  books.map((book, index) => (
                    <tr key={book._id ?? book.bookId ?? index}>
                      <td>{index + 1}</td>
                      <td>{book.bookId}</td>
                      <td className="book-title">{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category || '—'}</td>
                      <td>{book.publisher || '—'}</td>
                      <td>{book.publishYear || '—'}</td>
                      <td>{book.quantity ?? 0}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-edit"
                            onClick={() => handleEdit(book)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn btn-delete"
                            onClick={() => handleDelete(book)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Đang hiển thị {books.length} sách
          </div>
        </section>
      </main>

      <footer className="app-footer">
        Hệ thống quản lý sách · React + Node.js + MongoDB
      </footer>
    </div>
  )
}

export default App
