const Joi = require('joi');

// PATCH /api/users/me
const updateUser = {
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(50).trim(),

      preferences: Joi.object({
        units: Joi.string().valid('metric', 'imperial'),
        weekStartsOn: Joi.number().integer().min(0).max(6),
      }),
    })
    .min(1),
};

// POST /api/users/change-password
const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      .required(),
  }),
};

module.exports = {
  updateUser,
  changePassword,
};
