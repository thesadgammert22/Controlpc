const bcrypt = require('bcrypt');

// Hardcoded credentials (username: "admin", password: "12345")
const USERS = {
    admin: bcrypt.hashSync('12345', 10) // Hashing the password
};

const authMiddleware = (req, res, next) => {
    const { username, password } = req.body;
    if (USERS[username] && bcrypt.compareSync(password, USERS[username])) {
        next(); // Proceed to the iframe page
    } else {
        res.status(401).send('Unauthorized');
    }
};

module.exports = authMiddleware;
