const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const menuitemRouter = require('./menuitem.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')




module.exports = menuRouter;
