const ProgramTemplate = require('../../models/ProgramTemplate');
const { parsePaginationParams, calculatePagination } = require('../../utils/pagination');

/**
 * Get program templates with optional filters and pagination
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options including pagination
 * @returns {Promise<{templates: Array, count: number, pagination: Object}>}
 */
const getProgramTemplates = async (filters = {}, options = {}) => {
  const queryFilters = {
    isActive: true,
    ...filters,
  };

  const { page, limit, skip } = parsePaginationParams(options);
  const textFilter = options.q ? { $text: { $search: options.q } } : {};
  const query = { ...queryFilters, ...textFilter };

  const findQuery = ProgramTemplate.find(query)
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const countQuery = ProgramTemplate.countDocuments(query);

  const [templates, count] = await Promise.all([findQuery.exec(), countQuery.exec()]);
  const pagination = calculatePagination(count, page, limit);

  return {
    templates,
    count,
    pagination,
  };
};

/**
 * Get a program template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>}
 */
const getProgramTemplateById = async (id) => {
  const template = await ProgramTemplate.findById(id).select('-__v').lean();
  if (!template) {
    const error = new Error('Program template not found');
    error.statusCode = 404;
    throw error;
  }
  return template;
};

/**
 * Create a new program template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>}
 */
const createProgramTemplate = async (templateData) => {
  const existing = await ProgramTemplate.findOne({
    name: templateData.name,
    isActive: true,
  }).lean();

  if (existing) {
    const error = new Error('Template with this name already exists');
    error.statusCode = 409;
    throw error;
  }
  const template = new ProgramTemplate(templateData);
  const saved = await template.save();

  return saved;
};

/**
 * Update a program template
 * @param {string} id - Template ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
const updateProgramTemplate = async (id, updateData) => {
  const allowedUpdates = [
    'name',
    'description',
    'difficulty',
    'goals',
    'workouts',
    'periodization',
    'daysPerWeek',
    'splitType',
  ];

  const updates = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  const template = await ProgramTemplate.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .select('-__v')
    .lean();

  if (!template) {
    const error = new Error('Program template not found');
    error.statusCode = 404;
    throw error;
  }

  return template;
};

/**
 * Delete a program template (soft delete)
 * @param {string} id - Template ID
 * @returns {Promise<Object>}
 */
const deleteProgramTemplate = async (id) => {
  const template = await ProgramTemplate.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true },
  )
    .select('-__v')
    .lean();

  if (!template) {
    const error = new Error('Program template not found');
    error.statusCode = 404;
    throw error;
  }

  return template;
};

module.exports = {
  getProgramTemplates,
  getProgramTemplateById,
  createProgramTemplate,
  updateProgramTemplate,
  deleteProgramTemplate,
};
