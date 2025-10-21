const express = require("express");
const upload = require("../middleware/upload");

const {
  getUserDataFirst,
  logoutUser,
  editUser,
  changePassword,
} = require("../controllers/userController");





const router = express.Router();

// To get user data on initial page load.
router.get("/", getUserDataFirst);

// Logout
router.get("/logout", logoutUser);

// Edit User profile
router.post("/edit-profile", upload.single("profileImgURL"), editUser);

// Change User Password
router.post("/change-password", changePassword);



module.exports = router;
