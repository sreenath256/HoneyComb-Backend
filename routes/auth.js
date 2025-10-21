const express = require("express");
const upload = require("../middleware/upload");

const { signUpUser, loginUser } = require("../controllers/userController");

const router = express.Router();

// Auth
router.post("/signup", upload.single("profileImgURL"), signUpUser);
router.post("/login", loginUser);

module.exports = router;