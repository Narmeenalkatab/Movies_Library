"use strict";

//NEEDED DATA
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;
const movieData = require("./data.json");
app.use(cors());

//METHODS

app.get("/", homeHandler);
app.get("/favorite", favoriteHandler);

//HANDLER FUNCTIONS

function homeHandler(req, res) {
  let objM = new HomeConstrctor(
    movieData.title,
    movieData.poster_path,
    movieData.overview
  );
  res.send(objM);
}

function favoriteHandler(req, res) {
  res.send("Welcome to Favorite Page");
}

//CONSTRCTOR FUNCTIONS

function HomeConstrctor(title, poster_path, overview) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
}

//HNDLING ERRORS MIDDLEWARE FUNCTION

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err,
  });
});

//PORT LISTENER
app.listen(PORT, () => {
  console.log(`App is listening`);
});
