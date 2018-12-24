const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const menuItemRouter = require('./menuitem.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//port over menu item router
menuRouter.use('/:menuId/menu-items', menuItemRouter);

//middleware to grab the proper menu based off the ID
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


//grab all menus
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

//create new menu and return that menu
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

//update existing menu and return it
menuRouter.put('/:menuId', validateMenu, (req, res, next) => {
  const newMenu = req.body.menu;
  const menuId = req.params.menuId;
  db.run(`UPDATE Menu SET title = $title WHERE id = $menuId`,
  {
    $menuId : menuId,
    $title : newMenu.title
  },
  function(err) {
    if(err) {
      next(err);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, menu) => {
      if (!menu) {
        res.status(500).send();
      }
      res.status(200).json( {menu : menu} );
    });
  });
});


//Delete menu, but don't delete if menu items exist still
menuRouter.delete('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  db.get(`SELECT * FROM MenuItem WHERE menu_id = $menuId`,
  {
    $menuId : menuId
  },
  (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      res.status(400).send();
    } else {
      db.run(`DELETE FROM Menu WHERE id = ${menuId}`, (err) => {
        if (err) {
          res.status(500).send();
        }
        res.status(204).send();
      });
    }
  });
});


module.exports = menuRouter;
