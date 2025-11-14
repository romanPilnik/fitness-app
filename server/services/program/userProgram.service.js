const userProgramModel = require('../../models/UserProgram');
const {
  parsePaginationParams,
  calculatePagination,
} = require('../../utils/pagination');

const getUserPrograms = async (options = {}) => {
  const allowedStatuses = ['active', 'paused', 'completed'];

  if (options.status && !allowedStatuses.includes(options.status)) {
    const error = new Error('Invalid status');
    error.status = 400;
    throw error;
  }

  const { page, limit, skip } = parsePaginationParams(options);

  const programs = await userProgramModel
    .find(options)
    .skip(skip)
    .limit(limit)
    .select('-__v')
    .lean();

  const count = await userProgramModel.countDocuments(options);
  const pagination = calculatePagination(count, page, limit);

  return {
    programs,
    count,
    pagination,
  };
};

module.exports = {
  getUserPrograms,
};
