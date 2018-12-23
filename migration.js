const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');


//create employee table
db.serialize(() => {
  db.run(`drop table if exists Employee`, error => {
    if(error) {
      throw error;
    }
  });
  db.run(`
    CREATE TABLE Employee (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      wage INTEGER NOT NULL,
      is_current_employee INTEGER NOT NULL DEFAULT 1
    )`);
});

//create timesheet table
db.serialize(() => {
  db.run(`drop table if exists Timesheet`, error => {
    if(error) {
      throw error;
    }
  });
  db.run(`
    CREATE TABLE Timesheet (
      id INTEGER PRIMARY KEY,
      hours INTEGER NOT NULL,
      rate INTEGER NOT NULL,
      date INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      FOREIGN KEY(employee_id) REFERENCES Employee(id)
    )`);
});



//create menu table
db.serialize(() => {
  db.run(`drop table if exists Menu`, error => {
    if(error) {
      throw error;
    }
  });
  db.run(`
    CREATE TABLE Menu (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL
    )`);
});



//create menuitem table
db.serialize(() => {
  db.run(`drop table if exists MenuItem`, error => {
    if(error) {
      throw error;
    }
  });
  db.run(`
    CREATE TABLE MenuItem (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      inventory INTEGER NOT NULL,
      price INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      FOREIGN KEY(menu_id) REFERENCES Menu(id)
    )`);
});
