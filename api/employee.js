const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheet.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


//middleware to grab the proper employee based off the ID
employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = $employeeId`,
  {
    $employeeId : employeeId
  }, (err, employee) => {
    if(err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      return res.status(404).send();
    }
  });
});


//grab all employess that are currently employed
employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json( {employees: employees} );
    }
  });
});


//Grab a specific employee by ID
employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json( { employee : req.employee } );
});


module.exports = employeeRouter;
