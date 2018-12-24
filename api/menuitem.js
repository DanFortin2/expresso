const express = require('express');
const menuItemRouter = express.Router( {mergeParams: true} );
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//created middleware function to grab menu items based off ID to use in other functions
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

//grab all timesheets based off an Menu ID
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

//Helper function to validate the values in the req
const validateMenuItems = (req, res, next) => {
  const newMenuItems = req.body.menuItem;
  const menuId = req.params.menuId;
  if (!newMenuItems.name || !newMenuItems.description || !newMenuItems.inventory ||
    !newMenuItems.price || !menuId ) {
    return res.status(400).send();
  }
  next();
}


//create new Menu Items
menuItemRouter.post('/', validateMenuItems, (req, res, next) => {
  const newMenuItems = req.body.menuItem;
  const menuId = req.params.menuId;
  db.run(`INSERT INTO MenuItem (menu_id, name, description, inventory, price)
  VALUES ($menuId, $name, $description, $inventory, $price)`,
  {
    $menuId : menuId,
    $name : newMenuItems.name,
    $description : newMenuItems.description,
    $inventory : newMenuItems.inventory,
    $price :  newMenuItems.price
  },
  function(err) {
    if (err) {
      next(err);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
      if(!menuItem) {
        res.status(500).send()
      }
      res.status(201).json( {menuItem : menuItem} );
    });
  });
});


//update menu items by ID
menuItemRouter.put('/:menuItemId', validateMenuItems, (req, res, next) => {
  const updateMenuItems = req.body.menuItem;
  const menuItemId = req.params.menuItemId;
  db.run(`UPDATE MenuItem SET name = $name, description = $description,
    inventory = $inventory, price = $price WHERE id = $menItemId`,
  {
    $menItemId : menuItemId,
    $name : updateMenuItems.name,
    $description : updateMenuItems.description,
    $inventory : updateMenuItems.inventory,
    $price : updateMenuItems.price
  },
  function(err) {
    if(err) {
      next(err);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, menuItem) => {
      if (!menuItem) {
        res.status(500).send();
      }
      res.status(200).json( {menuItem : menuItem} );
    });
  });
});


//Delete item by Id
menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  db.run(`DELETE FROM MenuItem WHERE id = $menuItemId`,
  {
    $menuItemId : menuItemId
  },
  function(err) {
    if(err) {
      next(err);
    } else {
      res.status(204).send();
    }
  });
});


module.exports = menuItemRouter;
