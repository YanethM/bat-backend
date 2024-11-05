const express = require("express");
const router = express.Router();
const tagsController = require("../controllers/TagsController");

router.post("/", tagsController.createTag);
router.get("/", tagsController.getTags);
router.get("/:id", tagsController.getTagById);
router.patch("/:id", tagsController.updateTag);
router.delete("/:id", tagsController.deleteTag);

module.exports = router;