const programTemplateService = require("../services/template/programTemplate.service");
const { sendSuccess } = require("../utils/response");

const getProgramTemplates = async (req, res) => {
  const allowedFilters = [
    "splitType",
    "createdBy",
    "difficulty",
    "daysPerWeek",
  ];
  const filters = {};

  allowedFilters.forEach((key) => {
    if (req.query[key]) {
      filters[key] = req.query[key];
    }
  });

  const result = await programTemplateService.getProgramTemplates(
    filters,
    req.query,
  );

  return sendSuccess(
    res,
    result,
    200,
    "Program templates retrieved successfully",
  );
};

const getProgramTemplateById = async (req, res) => {
  const template = await programTemplateService.getProgramTemplateById(
    req.params.id,
  );
  return sendSuccess(
    res,
    template,
    200,
    "Program template retrieved successfully",
  );
};

const createProgramTemplate = async (req, res) => {
  const template = await programTemplateService.createProgramTemplate(req.body);
  return sendSuccess(
    res,
    template,
    "Program template created successfully",
    201,
  );
};

const updateProgramTemplate = async (req, res) => {
  const template = await programTemplateService.updateProgramTemplate(
    req.params.id,
    req.body,
  );
  return sendSuccess(
    res,
    template,
    200,
    "Program template updated successfully",
  );
};

const deleteProgramTemplate = async (req, res) => {
  await programTemplateService.deleteProgramTemplate(req.params.id);
  return sendSuccess(res, null, 204);
};

module.exports = {
  getProgramTemplates,
  getProgramTemplateById,
  createProgramTemplate,
  updateProgramTemplate,
  deleteProgramTemplate,
};
