const express = require('express');
const menuItemRouter = express.Router( {mergeParams: true} );
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//created middleware function to grab timesheet based off ID to use in other functions
menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`,
  {
    $menuItemId : menuItemId
  }, (err, menuItem) => {
    if(err) {
      next(err);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      return res.status(404).send();
    }
  });
});

//grab all timesheets based off an employee ID
menuItemRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  db.all(`SELECT * FROM MenuItem WHERE menu_id = $menuId`,
    {
      $menuId : menuId
    },
    (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json( {menuItems : menuItems} );
    }
  });
});


module.exports = menuItemRouter;
