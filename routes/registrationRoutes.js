// routes/registration.js
const express = require("express");
const Registration = require("../models/registrationModel");
const Event = require("../models/eventModel");
const User = require("../models/userModel");
const { authenticateToken, authorizeRoles } = require("../middlewares/authMiddlewares");
const registrationController = require('../controllers/registrationController');
const router = express.Router();

// Đăng ký tham gia event
router.post("/", authenticateToken, authorizeRoles("student"), registrationController.registerEvent);

// Hủy đăng ký
router.delete("/:id", authenticateToken, authorizeRoles("student"), registrationController.cancelRegistration);

// Lấy danh sách đăng ký của student hiện tại
router.get("/my-registrations", authenticateToken, authorizeRoles("student"), registrationController.getMyRegistrations);

// Admin: Lấy tất cả đăng ký
router.get("/listRegistrations", authenticateToken, authorizeRoles("admin"), registrationController.getAllRegistrations);

// Admin: Lấy đăng ký theo khoảng thời gian
router.get("/getRegistrationsByDate", authenticateToken, authorizeRoles("admin"), registrationController.getRegistrationsByDate);

module.exports = router;
