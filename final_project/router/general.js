const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: "User registered successfully"
    });
});

// Internal routes for Axios
public_users.get('/api/books', function (req, res) {
    res.status(200).json(books);
});

public_users.get('/api/books/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({ message: "Book not found" });
});

public_users.get('/api/books/author/:author', function (req, res) {
    const author = req.params.author;
    let result = {};

    for (let isbn in books) {
        if (books[isbn].author === author) {
            result[isbn] = books[isbn];
        }
    }

    return res.status(200).json(result);
});

public_users.get('/api/books/title/:title', function (req, res) {
    const title = req.params.title;
    let result = {};

    for (let isbn in books) {
        if (books[isbn].title === title) {
            result[isbn] = books[isbn];
        }
    }

    return res.status(200).json(result);
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/api/books');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(
            `http://localhost:5000/api/books/isbn/${isbn}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(404).json({
            message: "Book not found"
        });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const response = await axios.get(
            `http://localhost:5000/api/books/author/${encodeURIComponent(author)}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(404).json({
            message: "Books not found"
        });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const response = await axios.get(
            `http://localhost:5000/api/books/title/${encodeURIComponent(title)}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(404).json({
            message: "Books not found"
        });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

module.exports.general = public_users;