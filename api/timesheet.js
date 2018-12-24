const express = require('express');
const timesheetRouter = express.Router( {mergeParams: true} );
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//created middleware function to grab timesheet based off ID to use in other functions
timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
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

//grab all timesheets based off an employee ID
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

//Helper function to validate the values in the req
const validateTimesheet = (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  const employeeId = req.params.employeeId;
  if (!newTimesheet.hours || !newTimesheet.rate || !newTimesheet.date || !employeeId ) {
    return res.status(400).send();
  }
  next();
}

//create new timesheet
timesheetRouter.post('/', validateTimesheet, (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  const employeeId = req.params.employeeId;
  db.run(`INSERT INTO Timesheet (employee_id, hours, rate, date)
  VALUES ($employeeId, $hours, $rate, $date)`,
  {
    $employeeId : employeeId,
    $hours : newTimesheet.hours,
    $rate : newTimesheet.rate,
    $date : newTimesheet.date
  },
  function(err) {
    if (err) {
      next(err)
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
      if (!timesheet) {
        res.status(500).send()
      }
      res.status(201).json( {timesheet : timesheet} );
    });
  });
});


//update an existing timesheet
timesheetRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  const updateTimesheet = req.body.timesheet;
  const timesheetId = req.params.timesheetId;
  db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date
    WHERE id = $timesheetId `,
    {
      $timesheetId : timesheetId,
      $hours : updateTimesheet.hours,
      $rate : updateTimesheet.rate,
      $date : updateTimesheet.date
    },
    function(err) {
      if(err) {
        next(err)
      }
      db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, timesheet) => {
        if (!timesheet) {
          res.status(500).send();
        }
        res.status(200).json( {timesheet : timesheet} );
      });
    });
});


//delete a timesheet
timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  db.run(`DELETE FROM Timesheet WHERE id = $timesheetId`,
    {
      $timesheetId : timesheetId
    },
    function (err) {
      if (err) {
        next(err)
      } else {
        res.status(204).send();
      }
    });
});



module.exports = timesheetRouter;
