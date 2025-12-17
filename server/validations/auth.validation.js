const Joi = require('joi');

const loginUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const registerUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    passwrod: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      .required(),
    name: Joi.string().min(2).max(50).required(),
  }),
};

module.exports = {
  loginUser,
  registerUser,
};
