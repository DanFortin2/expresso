const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const menuitemRouter = require('./menuitem.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


//middleware to grab the proper employee based off the ID
menuRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = $menuId`,
  {
    $menuId : menuId
  }, (err, menu) => {
    if(err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      return res.status(404).send();
    }
  });
});


//grab all employess that are currently employed
menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json( {menus: menus} );
    }
  });
});

//Grab a specific Menu by ID
menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json( { menu : req.menu } );
});


//Helper function to validate the values in the req
const validateMenu = (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    return res.status(400).send();
  }
  next();
}

//create new employee and return that employee
menuRouter.post('/', validateMenu, (req, res, next) => {
  const newMenu = req.body.menu;
  db.run(`INSERT INTO Menu (title) values ($title)`,
  {
    $title : newMenu.title
  },
  function(err) {
    if(err) {
      return res.status(500).send();
    }
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
      if (!menu) {
        res.status(500).send();
      }
      res.status(201).json( {menu : menu} );
    });
  });
});


module.exports = menuRouter;
