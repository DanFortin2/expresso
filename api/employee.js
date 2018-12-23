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


//Helper function to validate the values in the req
const validateEmployee = (req, res, next) => {
  const newEmployee = req.body.employee;
  if (!newEmployee.name || !newEmployee.position || !newEmployee.wage ) {
    return res.status(400).send();
  }
  next();
}


//create new employee

employeeRouter.post('/', validateEmployee, (req, res, next) => {
  const newEmployee = req.body.employee;
  db.run(`INSERT INTO Employee (name, position, wage) values ($name, $position, $wage)`,
  {
    $name : newEmployee.name,
    $position : newEmployee.position,
    $wage : newEmployee.wage
  },
  function(err) {
    if(err) {
      return res.status(500).send();
    }
    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
      if (!employee) {
        res.status(500).send();
      }
      res.status(201).send( {employee : employee} );
    });
  });
});


//{ employee: { name: 'New Employee', position: 'Position', wage: 30 } }




module.exports = employeeRouter;
