CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	isbn TEXT NOT NULL,
	UNIQUE (title, author)
);

CREATE TABLE book_notes (
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES books(id),
	rating INT NOT NULL,
	last_read DATE NOT NULL,
	notes TEXT,
	UNIQUE (book_id)
);