const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    }); //ID was passed when generating the token hence, it can be accessed
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ Error: 'Please Authenticate' });
  }
};
module.exports = auth;
