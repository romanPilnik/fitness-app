const jwt = require('jsonwebtoken');

const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = {
  generateAuthToken,
};
