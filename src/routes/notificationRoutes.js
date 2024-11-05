const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  deleteNotification,
  getNotificationsSender
} = require("../controllers/NotificationController");

router.post("/", createNotification);
router.get("/receiver/:userId", getNotificationsForUser);
router.get("/:userId/sender", getNotificationsSender);
router.put('/:notificationId/users/:userId/read', markNotificationAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
