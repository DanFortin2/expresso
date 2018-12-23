const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheet.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')




module.exports = employeeRouter;
