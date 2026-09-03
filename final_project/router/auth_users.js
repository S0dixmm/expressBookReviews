const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {

    for (let user of users) {
        if (user.username === username) {
            return true;
        }
    }

    return false;
}

const authenticatedUser = (username, password) => {

    for (let user of users) {
        if (user.username === username && user.password === password) {
            return true;
        }
    }

    return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (authenticatedUser(username, password)) {

        const token = jwt.sign(
            { username: username },
            "secret_key",
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token
        });
    }

    return res.status(401).json({
        message: "Invalid username or password"
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    const username = req.user.username;

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const username = req.user.username;

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully"
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
