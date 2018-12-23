const express = require('express');
const timesheetRouter = express.Router( {mergeParams: true} );
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

timesheetRouter.param('timesheetId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = $timesheetId`,
  {
    $timesheetId : timesheetId
  }, (err, timesheet) => {
    if(err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      return res.status(404).send();
    }
  });
});

//grab all employess that are currently employed
timesheetRouter.get('/', (req, res, next) => {
  const employeeId = req.params.employeeId;
  console.log(employeeId);
  db.all(`SELECT * FROM Timesheet WHERE employee_id = $employeeId`,
    {
      $employeeId : employeeId
    },
    (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json( {timesheets: timesheets} );
    }
  });
});


module.exports = timesheetRouter;
