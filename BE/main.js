const { Client } = require("pg");
const express = require("express");

const app = express();
app.use(express.json());

const connection = new Client({
  host: "localhost",
  user: "postgres",
  port: 5433,
  password: "1234",
  database: "Digital_Wardrobe_Database",
});

connection.connect().then(() => console.log("Connected to DB"));
