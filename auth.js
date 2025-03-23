const bcrypt = require('bcrypt');

const USERS = {
    admin: bcrypt.hashSync('12345', 10) // Hash the password
};

const authMiddleware = (req, res, next) => {
    const { username, password } = req.body;
    if (USERS[username] && bcrypt.compareSync(password, USERS[username])) {
        next(); // Login successful
    } else {
        res.status(401).send('Unauthorized');
    }
};

module.exports = authMiddleware;
