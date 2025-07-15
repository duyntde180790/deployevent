const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const User = require('../models/userModel');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddlewares');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Thêm middleware cookieParser cho app (nên thêm ở server.js, nhưng tạm thời thêm ở đây nếu chưa có)
router.use(cookieParser());

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Register Event page (student)
router.get('/register-event', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const events = await Event.find();
        // Đếm số lượng đăng ký cho từng event
        const eventList = await Promise.all(events.map(async (event) => {
            const registered = await Registration.countDocuments({ eventId: event._id });
            return { ...event.toObject(), registered };
        }));
        res.render('registerEvent', { events: eventList, message: req.query.message });
    } catch (error) {
        res.render('registerEvent', { events: [], message: error.message });
    }
});

// Cancel Registration page (student)
router.get('/cancel-registration/:id', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('eventId');
        if (!registration) return res.status(404).send('Registration not found');
        res.render('cancelRegistration', { registrationId: registration._id, eventName: registration.eventId.name });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Admin: List Registrations
router.get('/admin/list-registrations', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('eventId')
            .populate('studentId', 'username')
            .sort({ registrationDate: -1 });
        res.render('listRegistrations', { registrations });
    } catch (error) {
        res.render('listRegistrations', { registrations: [], error: error.message });
    }
});

// Admin: Search Registrations by Date
router.get('/admin/search-registrations', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    // Nếu chưa có query, chỉ render form
    if (!req.query.start || !req.query.end) {
        return res.render('searchRegistrations', { registrations: undefined });
    }
    try {
        const { start, end } = req.query;
        const registrations = await Registration.find({
            registrationDate: { $gte: new Date(start), $lte: new Date(end) }
        })
        .populate('eventId')
        .populate('studentId', 'username')
        .sort({ registrationDate: -1 });
        res.render('searchRegistrations', { registrations });
    } catch (error) {
        res.render('searchRegistrations', { registrations: [], error: error.message });
    }
});

// Admin: Tạo sự kiện mới
router.get('/admin/create-event', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.render('createEvent', { message: req.query.message });
});

router.post('/admin/create-event', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { name, description, date, endDate, location, maxCapacity } = req.body;
        const event = new Event({ name, description, date, endDate, location, maxCapacity });
        await event.save();
        res.redirect('/admin/create-event?message=Event created successfully');
    } catch (error) {
        res.render('createEvent', { message: 'Error: ' + error.message });
    }
});

// Xử lý đăng nhập qua form web
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.render('login', { error: 'Username does not exist' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render('login', { error: 'Wrong password' });
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        // Lưu token vào cookie
        res.cookie('token', token, { httpOnly: true });
        // Chuyển hướng theo role
        if (user.role === 'admin') {
            return res.redirect('/admin/list-registrations');
        } else {
            return res.redirect('/register-event');
        }
    } catch (error) {
        res.render('login', { error: 'Login failed: ' + error.message });
    }
});

// Xem danh sách sự kiện đã đăng ký (student)
router.get('/my-registrations', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const registrations = await Registration.find({ studentId: req.user.id })
            .populate('eventId')
            .sort({ registrationDate: -1 });
        res.render('myRegistrations', { registrations, message: req.query.message });
    } catch (error) {
        res.render('myRegistrations', { registrations: [], message: 'Error: ' + error.message });
    }
});

// Hủy đăng ký từ giao diện web (student)
router.post('/cancel-registration/:id', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.redirect('/my-registrations?message=Registration not found');
        }
        if (registration.studentId.toString() !== req.user.id) {
            return res.redirect('/my-registrations?message=Not authorized to cancel this registration');
        }
        await registration.deleteOne();
        res.redirect('/my-registrations?message=Unregistered successfully');
    } catch (error) {
        res.redirect('/my-registrations?message=Error: ' + error.message);
    }
});

// Đăng ký sự kiện qua form web (student)
router.post('/register-event', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const { eventId } = req.body;
        const studentId = req.user.id;
        const event = await Event.findById(eventId);
        if (!event) return res.redirect('/register-event?message=Event not found');
        const existingRegistration = await Registration.findOne({ studentId, eventId });
        if (existingRegistration) {
            return res.redirect('/register-event?message=You have already registered for this event');
        }
        const count = await Registration.countDocuments({ eventId });
        if (count >= event.maxCapacity) {
            return res.redirect('/register-event?message=Event full');
        }
        const registration = new Registration({ studentId, eventId });
        await registration.save();
        res.redirect('/register-event?message=Registered successfully');
    } catch (error) {
        res.redirect('/register-event?message=Error: ' + error.message);
    }
});

// Đăng xuất
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Student: Xem chi tiết sự kiện
router.get('/event/:id', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.render('eventDetail', { event: null, registered: 0, message: 'Event not found' });
        const registered = await Registration.countDocuments({ eventId: event._id });
        res.render('eventDetail', { event, registered, message: req.query.message });
    } catch (error) {
        res.render('eventDetail', { event: null, registered: 0, message: 'Error: ' + error.message });
    }
});

module.exports = router; 