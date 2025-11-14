const userProgramService = require(`../services/program/userProgram.service`);

const getUserPrograms = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userPrograms = await userProgramService.getUserPrograms(userId);
    res.status(200).json(userPrograms);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPrograms,
};
