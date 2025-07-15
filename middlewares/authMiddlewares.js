const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    // Lấy token từ header hoặc cookie
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token && req.cookies) {
        token = req.cookies.token;
    }
    if (!token) return res.status(403).send('Forbidden');

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).send('Forbidden');
        req.user = user;
        next();
    });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    // console.log('User in authorizeRoles:', req.user);
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
