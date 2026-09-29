import { useState, useEffect } from 'react'

const STORAGE_KEY = 'reading-list-books'
const MAX_TITLE = 60

const STATUSES = ['Want to Read', 'Reading', 'Finished']

const STATUS_KEYS = {
  'Want to Read': 'want',
  'Reading': 'reading',
  'Finished': 'finished',
}

const FILTERS = ['All', ...STATUSES]

function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [books, setBooks] = useState(loadBooks)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  }, [books])

  const addBook = (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    if (trimmed.length > MAX_TITLE) {
      setMessage('Book title must be 60 characters or fewer.')
      return
    }

    const exists = books.some(
      (b) => b.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) {
      setMessage('This book is already in your reading list.')
      return
    }

    setBooks([{ id: Date.now(), title: trimmed, status: 'Want to Read' }, ...books])
    setTitle('')
    setMessage('')
  }

  const changeStatus = (id, status) => {
    setBooks(books.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const deleteBook = (id) => {
    setBooks(books.filter((b) => b.id !== id))
  }

  const visible = filter === 'All' ? books : books.filter((b) => b.status === filter)

  return (
    <div className="app">
      <header className="header">
        <h1>Reading List</h1>
        <p>Track books you want to read, are reading, and have finished.</p>
      </header>

      <form className="add-form card" onSubmit={addBook}>
        <input
          type="text"
          placeholder="Add a book title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Book title"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      {message && <div className="form-message">{message}</div>}

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty card">
          <div className="empty-icon">📚</div>
          <p>
            {books.length === 0
              ? 'Your reading list is empty. Add your first book.'
              : 'No books match this filter.'}
          </p>
        </div>
      ) : (
        <div className="books">
          {visible.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <span className={`status-badge status-${STATUS_KEYS[book.status]}`}>
                  {book.status}
                </span>
              </div>
              <div className="book-actions">
                <select
                  className="select"
                  value={book.status}
                  onChange={(e) => changeStatus(book.id, e.target.value)}
                  aria-label="Reading status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="delete-btn" onClick={() => deleteBook(book.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
