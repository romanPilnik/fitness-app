const exerciseService = require("../services/exercise/exercise.service");

/**
 * Exercise Controller
 * Handles HTTP requests and responses for exercise operations
 */

const getExercises = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.muscle) filters.primaryMuscle = req.query.muscle;
    if (req.query.equipment) filters.equipment = req.query.equipment;
    if (req.query.category) filters.category = req.query.category;

    const result = await exerciseService.getExercises(filters, req.query);

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.exercises,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const createExercise = async (req, res, next) => {
  try {
    const newExercise = await exerciseService.createExercise(req.body);

    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: newExercise,
    });
  } catch (error) {
    if (error.type === "DUPLICATE_ERROR") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }
    next(error);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    const updatedExercise = await exerciseService.updateExercise(
      req.params.id,
      req.body
    );

    if (!updatedExercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedExercise,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const deletedExercise = await exerciseService.deleteExercise(req.params.id);

    if (!deletedExercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }
    res.status(204).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
