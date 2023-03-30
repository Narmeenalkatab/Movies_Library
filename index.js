"use strict";

//NEEDED DATA
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;
const movieData = require("./data.json");
app.use(cors());
const axios = require("axios");
const apiKey = process.env.APIkey;
//lab13
const userName = process.env.username;
const password = process.env.password;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const url = `postgres://${userName}:${password}@localhost:5432/moviesdb`;
const { Client } = require("pg");
const client = new Client(url);


//METHODS

app.get("/", homeHandler);
app.get("/favorite", favoriteHandler);
//lab12
app.get("/trending", trendingHandler);
app.get("/search", searchHandler);
app.get("/upComing", upComing);
app.get("/nowPlaying", nowPlaying);
//Lab13
app.post("/addMovie", addMovieHandler);
app.get("/getMovies", getMoviesHandeler);
//lab14
app.put("/UPDATE/:id", upadteMovie);
app.delete("/DELETE/:id", deleteMovie);
app.get("/getMovies2/:id", getMovie);

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

function trendingHandler(req,res){
    let trendUrl=`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(trendUrl).then((result) =>{
        let trendData = result.data.results.map((i)=>{
            return new Trend(i.id, i.title, i.release_date, i.poster_path, i.overview);
    })
            res.send(trendData);
    })
    .catch((error)=>{
        console.log(error);
    })
    }

function searchHandler(req, res) {
  let movieName = req.query.name;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieName}`;
  axios
    .get(url)
    .then((result) => {
      let response = result.data.results;
      res.json(response);
    })
    .catch((error) => {
      console.log(error);
    });
}
function nowPlaying(req, res) {
  let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`;
  axios
    .get(url)
    .then((result) => {
      res.json(result.data.results);
    })
    .catch((error) => {
      console.log(error);
    });
}

function upComing(req, res) {
  let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=e${apiKey}&language=en-US`;
  axios
    .get(url)
    .then((result) => {
      res.json(result.data.results);
    })
    .catch((error) => {
      console.log(error);
    });
}
//lab13

function addMovieHandler(req, res) {
  console.log(req.body);

  let { title, overview, imag } = req.body;

  let sql = `INSERT INTO moviesTable (title,overview,imag) VALUES($1,$2,$3) RETURNING *`;
  let values = [title, overview, imag];
  client
    .query(sql, values)
    .then((result) => {
      console.log(result);
      res.status(201).json(result.rows);
    })
    .catch();
}
function getMoviesHandeler(req, res) {

  let sql = `SELECT * FROM moviesTable`;
  client
    .query(sql)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((err) => {
      error500(err);
    });
}


//lab14
function upadteMovie(req, res) {
  let id = req.params.id;
  let comments = req.body.comments;
  let sql = `UPDATE moviesTable SET comments = $1 WHERE id = $2 RETURNING *;`;
  let values = [comments, id];
  client
    .query(sql, values)
    .then((result) => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

function deleteMovie(req, res) {
  let id = req.params.id;
  let sql = `DELETE FROM moviesTable WHERE id = $1;`;
  let value = [id];
  client
    .query(sql, value)
    .then((result) => {
      res.status(204).send("deleted");
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}

function getMovie(req, res) {
  let id = req.params.id;
  let sql = `SELECT * FROM moviesTable WHERE id = $1;`;
  let value = [id];
  client
    .query(sql, value)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((error) => {
      errorHandler(error, req, res);
    });
}



//CONSTRCTOR FUNCTIONS

function HomeConstrctor(title, poster_path, overview) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
}

function Trend(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
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





//lab13 creatdb

// connect to db
//PORT LISTENER
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening `);
  });
});




// client.connect().then(() => {
//   app.listen(PORT, () => {
//     console.log(`App listening `);
//   });
// });

// app.listen(PORT, () => {
//   console.log(`App listening `);
// });