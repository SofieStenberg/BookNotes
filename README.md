# BookNotes
A website you can store information about books you have read.
I used the database postgreSQL to store the information and the tables I used looks lika the following;

```
CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	isbn TEXT NOT NULL,
	UNIQUE (title, author)
);
```
```
CREATE TABLE book_notes (
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES books(id),
	rating INT NOT NULL,
	last_read DATE NOT NULL,
	notes TEXT,
	UNIQUE (book_id)
);
```

To install all requirements: `npm i`.
To run the website: ``nodemon index.js`.
