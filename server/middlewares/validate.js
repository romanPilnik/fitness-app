const Joi = require('joi');
const pick = require('../utils/pick');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    const validationError = new Error('Validation failed');
    validationError.statusCode = 400;
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = errors;

    throw validationError;
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
