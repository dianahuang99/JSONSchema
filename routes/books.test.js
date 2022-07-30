// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { create } = require("../models/book");
const Book = require("../models/book");

let testBook;

beforeEach(async () => {
  const bookData = {
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017,
  };

  const result = await create(bookData);

  testBook = result;
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", () => {
  test("Get a list of books", async () => {
    const res = await request(app).get("/books");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [testBook],
    });
  });
});

describe("GET /books/:isbn", () => {
  test("Gets a single book", async () => {
    const res = await request(app).get(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: testBook });
  });
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/books/dfasdf`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /books", () => {
  test("Creates a single book", async () => {
    const newBook = {
      isbn: "069345234",
      amazon_url: "http://a.co/eobPtX2",
      author: "Diana Huang",
      language: "english",
      pages: 2311,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2022,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      book: newBook,
    });
  });

  test("Creates a single book with wrong type author", async () => {
    const newBook = {
      isbn: "069345234",
      amazon_url: "http://a.co/eobPtX2",
      author: 345,
      language: "english",
      pages: 2311,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2022,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(400);
  });

  test("Creates a single book with left out fields", async () => {
    const newBook = {
      isbn: "069345234",
      amazon_url: "http://a.co/eobPtX2",
      pages: 2311,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2022,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", () => {
  const updatedBook = {
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Updated Name",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017,
  };
  test("Updates a single book", async () => {
    const res = await request(app)
      .put(`/books/${testBook.isbn}`)
      .send(updatedBook);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: updatedBook,
    });
  });
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).put(`/books/0`).send(updatedBook);
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", () => {
  test("Deletes a single book", async () => {
    const res = await request(app).delete(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});
