const ProgramTemplate = require("../../models/ProgramTemplate");
const { parsePaginationParams, calculatePagination } = require("../../utils/pagination");

/**
 * Program Template Service
 * Handles all business logic for program template operations
 * 
 * TODO/Improvements:
 * 1. Template Validation & Processing:
 *    - Validate exercise combinations and ordering
 *    - Check for balanced muscle group targeting
 *    - Verify progression patterns
 *    - Validate rest periods and session durations
 *    - Add equipment availability checks
 * 
 * 2. Template Enhancement:
 *    - Auto-generate warmup/cooldown routines
 *    - Calculate estimated workout durations
 *    - Generate difficulty ratings based on volume/intensity
 *    - Add alternative exercise suggestions
 *    - Support template versioning
 * 
 * 3. Business Rules:
 *    - Implement template approval workflow
 *    - Add template archiving logic
 *    - Track template usage statistics
 *    - Handle template dependencies
 *    - Manage template access levels (free/premium)
 * 
 * 4. Performance & Scaling:
 *    - Add caching layer for popular templates
 *    - Implement batch operations
 *    - Add template preloading
 *    - Support partial updates
 *    - Implement soft deletion with cleanup
 * 
 * 5. Integration Features:
 *    - Exercise substitution logic
 *    - Equipment substitution handling
 *    - Template adaptation based on user level
 *    - Integration with recommendation engine
 *    - Support for template sharing
 * 
 * 6. Analytics & Reporting:
 *    - Track template effectiveness
 *    - Monitor completion rates
 *    - Calculate user progress metrics
 *    - Generate usage reports
 *    - Track modification patterns
 * 
 * 7. Current Limitations:
 *    - No support for template variations
 *    - Missing template categorization
 *    - Limited search capabilities
 *    - No support for template scheduling
 *    - Missing progress tracking integration
 * 
 * 8. Data Consistency:
 *    - Add transaction support for complex operations
 *    - Implement optimistic locking
 *    - Add data validation hooks
 *    - Include audit logging
 *    - Handle template dependencies
 */

/**
 * Get program templates with optional filters and pagination
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options including pagination
 * @returns {Promise<{templates: Array, count: number, pagination: Object}>}
 */
const getProgramTemplates = async (filters = {}, options = {}) => {
  try {
    const queryFilters = {
      isActive: true,
      ...filters,
    };

    const { page, limit, skip } = parsePaginationParams(options);
    const textFilter = options.q ? { $text: { $search: options.q } } : {};
    const query = { ...queryFilters, ...textFilter };

    const templates = await ProgramTemplate.find(query)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const count = await ProgramTemplate.countDocuments(query);
    const pagination = calculatePagination(count, page, limit);

    return {
      templates,
      count,
      pagination,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get a program template by ID
 * @param {string} id - Template ID
 * @returns {Promise<Object>}
 */
const getProgramTemplateById = async (id) => {
  try {
    const template = await ProgramTemplate.findById(id).select("-__v");
    if (!template) {
      const error = new Error("Program template not found");
      error.statusCode = 404;
      throw error;
    }
    return template;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new program template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>}
 */
const createProgramTemplate = async (templateData) => {
  try {
    const template = new ProgramTemplate(templateData);
    await template.validate(); // Run validation before saving
    return await template.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Update a program template
 * @param {string} id - Template ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
const updateProgramTemplate = async (id, updateData) => {
  try {
    const template = await ProgramTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!template) {
      const error = new Error("Program template not found");
      error.statusCode = 404;
      throw error;
    }

    return template;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a program template (soft delete)
 * @param {string} id - Template ID
 * @returns {Promise<Object>}
 */
const deleteProgramTemplate = async (id) => {
  try {
    const template = await ProgramTemplate.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).select("-__v");

    if (!template) {
      const error = new Error("Program template not found");
      error.statusCode = 404;
      throw error;
    }

    return template;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProgramTemplates,
  getProgramTemplateById,
  createProgramTemplate,
  updateProgramTemplate,
  deleteProgramTemplate,
};
