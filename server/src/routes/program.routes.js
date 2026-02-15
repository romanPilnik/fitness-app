const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const userProgramController = require('../controllers/userProgram.controller');
const { validate } = require('../middlewares/validate.ts');
const programValidation = require('../validations/program.validation.ts');

const userProgramRouter = express.Router();

userProgramRouter.get(
  '/',
  verifyToken,
  validate(programValidation.getPrograms),
  userProgramController.getPrograms,
);

userProgramRouter.get('/active', verifyToken, userProgramController.getActiveProgram);

userProgramRouter.get(
  '/:id',
  verifyToken,
  validate(programValidation.getProgramById),
  userProgramController.getProgramById,
);

userProgramRouter.post(
  '/from-template',
  verifyToken,
  validate(programValidation.createFromTemplate),
  userProgramController.createFromTemplate,
);

userProgramRouter.post(
  '/custom',
  verifyToken,
  validate(programValidation.createCustomProgram),
  userProgramController.createCustomProgram,
);

userProgramRouter.patch(
  '/:id',
  verifyToken,
  validate(programValidation.updateProgramById),
  userProgramController.updateProgramById,
);

userProgramRouter.delete(
  '/:id',
  verifyToken,
  validate(programValidation.deleteProgramById),
  userProgramController.deleteProgramById,
);

module.exports = userProgramRouter;
