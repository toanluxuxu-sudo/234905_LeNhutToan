
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

export async function getBooks(search = '') {
  const response = await api.get('/api/books', {
    params: search ? { search } : {},
  })
  return response.data
}

export async function addBook(book) {
  const response = await api.post('/api/books', book)
  return response.data
}

export async function updateBook(id, book) {
  const response = await api.put(`/api/books/${encodeURIComponent(id)}`, book)
  return response.data
}

export async function deleteBook(id) {
  const response = await api.delete(`/api/books/${encodeURIComponent(id)}`)
  return response.data
}

export default api
