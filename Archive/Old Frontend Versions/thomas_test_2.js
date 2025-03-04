const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const { timeEnd } = require('console');
const { generateKey } = require('crypto');
const app = express();

//sets EJS as template engine
app.set('view engine', 'ejs');


//path to database file
const dbPath = './DBeaver/Production/registration-sample-DB-Production.db';


//helps us know if the database will open or not 
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});


app.get('/', (req, res) => {
  const sqlQuery = `SELECT * FROM Persons`;

  //gets data from the database 
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
    
    //give the data to the ejs template "registration_frontend"
    res.render('registration_frontend', { persons: rows });
  });
});


// Route used by students to request a registration time
// In this route, the question marks mean that date and time are optional.
app.get('/request_time_thomas/:key/:date_requested?/:time_requested?', (req, res) => {
  const sqlQuery =
  `SELECT *
  FROM RegistrationList rl
  JOIN (SELECT *
    FROM Persons
    WHERE "Key/URL_Specific" = "${req.params.key}") as p
  ON rl.Professor_ID = p.Advisor AND rl."Group" = p."Group" AND rl.Student_ID = 0
  ORDER BY Date_Available, Time`
  console.log(sqlQuery);
  
  db.all(sqlQuery, [], (err, time_entries) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
  
    if (time_entries) { // If the query was successful...
        console.log(time_entries);
      
        // This asks it to render views/request_time.ejs.  It is passing the hash
        // as parameters to this script.
        res.render('request_time', {key: req.params.key, date_requested: req.params.date_requested, time_requested: req.params.time_requested, time_entries: time_entries}, );
    } else {
      res.render('invalid_key', {key: req.params.key});
    }
  });
});


// Old route for testing.
app.get('/testing_ids/:id', (req, res) => {
  const sqlQuery = `SELECT * FROM Persons WHERE "KEY/URL_Specific"="${req.params.id}"`
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error retrieving data from database');
    }
  
  // The first parameter to render connects to 'views/idtest.ejs'.
  // The second is a hash of parameters.  It is passing the 'id' from the route
  // (req.params.id) which will be named 'id' in the .ejs code.
  // The SQL query result (row 0, since it will be only one row) is being
  // passed and will be named 'result' on the .ejs side.
  res.render('idtest', { id: req.params.id, result: rows[0]});
  });
});

//  Route for advisors' page
app.get('/listTimes/', (req,res) => {
  // app.get('/listTimes/:key/:date/:availability?', (req,res) => {
  // const sqlQuery = `SELECT * FROM Persons WHERE "KEY/URL_Specific"="${req.params.key}"`
  // db.all(sqlQuery, [], (err, rows) => {
  //   if (err) {
  //     return res.status(500).send('1Error retrieving data from database');
  //   }
  //   else {
      var a = []
      // if (rows[0]) {
        for (var i = 7; i<18; i++){
          if (i < 10){
          a.push("0" + i + "00")
          a.push("0" + i + "30")
        }
        else {
          a.push(i + "00")
          a.push(i + "30")
        }
      }
      res.render('advisor', {key: req.params.key, date: req.params.date, time_entries: a});
    // }
    //   else {
    //     res.render('invalid_key', {key: req.params.key, date: req.params.date, availability: a});
    //   }
    // }

 
});



// this will start the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//no point in closing the database if it'll close on its own once we close the application.