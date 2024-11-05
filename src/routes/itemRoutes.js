const express = require("express");
const router = express.Router();

const itemController = require("../controllers/ItemController");

router.post("/", itemController.createItem);
router.get("/", itemController.getItems);
router.get("/:id", itemController.getItemById);
router.patch("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;