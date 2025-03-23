const bcrypt = require('bcrypt');

const USERS = {
    admin: bcrypt.hashSync('12345', 10) // Hardcoded credentials: username 'admin', password '12345'
};

const authMiddleware = (req, res, next) => {
    const { username, password } = req.body;
    if (USERS[username] && bcrypt.compareSync(password, USERS[username])) {
        next(); // Proceed if credentials are valid
    } else {
        res.status(401).send('Unauthorized');
    }
};

module.exports = authMiddleware;
