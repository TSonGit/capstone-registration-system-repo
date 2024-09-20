const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

module.exports = db;
