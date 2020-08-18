var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require("clear");
const { inherits } = require("util");

// Connection code
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "top_songsdb",
});

// Arrays defined
var choicesArr = [
  {
    type: "list",
    message: "What do you want to do today? ",
    name: "options",
    choices: [
      "Find songs by artist",
      "Find all artists who appear more than once",
      "Find data within a specific range",
      "Search for a specific song",
      "exit",
    ],
  },
];

var specificArtistSearchArray = [
  {
    type: "input",
    message: "Specify the Artist you wish to search for: ",
    name: "specificArtist",
  },
];

var specificSongSearchArray = [
  {
    type: "input",
    message: "Specify the Song you wish to search for: ",
    name: "specificSong",
  },
];

var rangeSearchStartArray = [
  {
    type: "input",
    message: "Specify the starting Position: ",
    name: "rangeStart",
  },
];

var rangeSearchEndArray = [
  {
    type: "input",
    message: "Specify the ending Position: ",
    name: "rangeEnd",
  },
];

// Variables defined
var tableName = "top5000";

// SQL queries defined
var artistSearchQuery = `Select artist, position, song, year from ${tableName} where ?`;
var songSearchQuery = `Select artist, position, song, year from ${tableName} where ?`;
var multiSearchQuery = `Select artist, count(*) from ${tableName} group by artist having count(*) >1`;
var rangeSearchQuery = `Select position, song, year from ${tableName} where position between ? and ?`;

// Connect
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id: " + connection.threadId);
  initSearch();
});

function initSearch() {
  inquirer.prompt(choicesArr).then(function (response) {
    var optionNum = choicesArr[0].choices.indexOf(response.options);

    switch (optionNum) {
      case 0:
        artistSearch();
        break;
      case 1:
        multiSearch();
        break;
      case 2:
        rangeSearch();
        break;
      case 3:
        songSearch();
        break;
      case 4:
        exitSearch();
        break;
    }
  });
}

function artistSearch() {
  clear();
  inquirer.prompt(specificArtistSearchArray).then((response) => {
    connection.query(
      artistSearchQuery,
      { artist: response.specificArtist },
      (err, res) => {
        if (err) throw err;
        for (let ctr = 0; ctr < res.length; ctr++) {
          console.log(
            `Artist: ${res[ctr].artist}, Position: ${res[ctr].position}, Year: ${res[ctr].year}.`
          );
        }
        initSearch();
      }
    );
  });
}

function songSearch() {
  clear();
  inquirer.prompt(specificSongSearchArray).then((response) => {
    connection.query(
      songSearchQuery,
      { song: response.specificSong },
      (err, res) => {
        if (err) throw err;
        for (let ctr = 0; ctr < res.length; ctr++) {
          console.log(
            `Artist: ${res[ctr].artist}, Song: ${res[ctr].song}, Position: ${res[ctr].position}, Year: ${res[ctr].year}.`
          );
        }
        initSearch();
      }
    );
  });
}

function multiSearch() {
  clear();
  connection.query(multiSearchQuery, (err, res) => {
    if (err) throw err;
    for (let ctr = 0; ctr < res.length; ctr++) {
      console.log(`Artist ${res[ctr].artist} appeared more than 1 time.`);
    }
    initSearch();
  });
  // });
}

function rangeSearch() {
  clear();
  inquirer.prompt(rangeSearchStartArray).then((response1) => {
    inquirer.prompt(rangeSearchEndArray).then((response2) => {
      console.log(response1.rangeStart, response2.rangeEnd);
      connection.query(
        rangeSearchQuery,
        { position: response1.rangeStart, position: response2.rangeEnd },
        (err, res) => {
          if (err) throw err;
          for (let ctr = 0; ctr < res.length; ctr++) {
            console.log(
              `Artist: ${res[ctr].artist}, Position: ${res[ctr].position}, Year: ${res[ctr].year}.`
            );
          }
          initSearch();
        }
      );
    });
  });
}

function exitSearch() {
  connection.end();
  console.log("Thank you for using Music Search application.");
}
