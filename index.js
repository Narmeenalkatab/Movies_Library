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
//METHODS

app.get("/", homeHandler);
app.get("/favorite", favoriteHandler);
//lab12
app.get("/trending", trendingHandler);
app.get("/search", searchHandler);
app.get("/upComing", upComing);
app.get("/nowPlaying", nowPlaying);



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

//PORT LISTENER
app.listen(PORT, () => {
  console.log(`App is listening`);
});
