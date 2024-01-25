import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const API_url = "https://covers.openlibrary.org/b/isbn/";
const password = "VeryStrongPassword";

const db = new pg.Client({
  user: "", // Insert your postgreSQL hostname
  host: "localhost",
  database: "", // Insert the name of the database
  password: "", // Insert your postgreSQL password
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Retrieve all books from the database sorted in either title, ranks or last read.
async function retrieveBooks(sortBy) {
  try {
    let books = {};
    if (sortBy === "title") {
      sortBy = "books." + sortBy;
      // sortOrder = "ASC";
      books = await db.query(
        "SELECT books.id, books.title, books.author, books.isbn, book_notes.rating, book_notes.last_read, book_notes.notes FROM books INNER JOIN book_notes ON books.id = book_notes.book_id ORDER BY $1 ASC;",
        [sortBy]
      );
    } else {
      sortBy = "book_notes." + sortBy;
      // sortOrder = "DESC";
      books = await db.query(
        "SELECT books.id, books.title, books.author, books.isbn, book_notes.rating, book_notes.last_read, book_notes.notes FROM books INNER JOIN book_notes ON books.id = book_notes.book_id ORDER BY $1 DESC;",
        [sortBy]
      );
    }
    console.log(books.rows);
    return books.rows;
  } catch (error) {
    console.log(error);
  }
}

// To modify the date to the desired format of YYYY-MM-DD
async function modDate(books) {
  for (let i = 0; i < books.length; i++) {
    books[i].last_read = books[i].last_read.toISOString().slice(0, 10);
  }
  return books;
}

async function addCoverLink(books) {
  for (let i = 0; i < books.length; i++) {
    books[i].coverLink = API_url + books[i].isbn + "-M.jpg";
  }
  return books;
}

app.get("/", async (req, res) => {
  try {
    const booksRead = await retrieveBooks("last_read");
    let books = await modDate(booksRead);
    books = await addCoverLink(books);
    res.render("index.ejs", { books: books });
  } catch (error) {
    console.log(error);
  }
});

app.get("/sort/:sortBy", async (req, res) => {
  //   console.log(req.params);
  try {
    const booksRead = await retrieveBooks(req.params.sortBy);
    let books = await modDate(booksRead);
    books = await addCoverLink(books);
    res.render("index.ejs", { books: books });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.get("/checkPass", async (req, res) => {
  //   console.log("checkPass");
  res.render("checkPass.ejs");
});

app.post("/add", async (req, res) => {
  //   console.log(req.body);
  if (req.body.password !== password) {
    res.render("index.ejs", { error: "Unvalid password." });
  } else {
    res.render("addNewBook.ejs");
    res.redirect("/");
  }
});

app.post("/addNewBook", async (req, res) => {
  //   console.log(req.body);
  try {
    const id = await db.query(
      "INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) RETURNING id",
      [req.body.title, req.body.author, req.body.isbn]
    );
    await db.query(
      "INSERT INTO book_notes (book_id, rating, last_read, notes) VALUES ($1, $2, $3, $4)",
      [id.rows[0].id, req.body.rating, req.body.last_read, req.body.notes]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// patch
app.get("/edit/:id", async (req, res) => {
  //   console.log(req.params);
  try {
    let chosenBook = await db.query(
      "SELECT books.id, books.title, books.author, books.isbn, book_notes.rating, book_notes.last_read, book_notes.notes FROM books INNER JOIN book_notes ON books.id = book_notes.book_id WHERE books.id = $1",
      [req.params.id]
    );
    //     console.log(chosenBook.rows);
    res.render("editBook.ejs", { book: chosenBook.rows[0] });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.post("/editBook", async (req, res) => {
  console.log(req.body);
  try {
    await db.query("UPDATE books SET title = $1 WHERE id = $2", [
      req.body.title,
      req.body.id,
    ]);
    await db.query("UPDATE books SET author = $1 WHERE id = $2", [
      req.body.author,
      req.body.id,
    ]);
    await db.query("UPDATE books SET isbn = $1 WHERE id = $2", [
      req.body.isbn,
      req.body.id,
    ]);
    await db.query("UPDATE book_notes SET rating = $1 WHERE book_id = $2", [
      req.body.rating,
      req.body.id,
    ]);
    await db.query("UPDATE book_notes SET last_read = $1 WHERE book_id = $2", [
      req.body.last_read,
      req.body.id,
    ]);
    await db.query("UPDATE book_notes SET notes = $1 WHERE book_id = $2", [
      req.body.notes,
      req.body.id,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// delete
app.get("/delete/:id", async (req, res) => {
  try {
    //     console.log(req.params.id);
    await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    await db.query("DELETE FROM book_notes WHERE book_id = $1", [
      req.params.id,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
