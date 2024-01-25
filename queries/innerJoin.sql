SELECT books.title, books.author, book_notes.rating, book_notes.last_read, book_notes.notes
FROM books
INNER JOIN book_notes ON books.id = book_notes.book_id
ORDER BY book_notes.last_read ASC