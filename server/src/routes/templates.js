import express from 'express';
import mongoose from 'mongoose';
import TrainingFile from '../models/TrainingFile.js';
import Template from '../models/Template.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

const ensureFile = async (userId, fileId) => {
  if (!mongoose.isValidObjectId(fileId)) return null;
  return TrainingFile.findOne({ _id: fileId, userId });
};

const mapTemplateWithNames = async (templateDocs) => {
  const allIds = templateDocs.flatMap((t) => t.exercises.map((e) => e.exerciseUserLibraryId));
  const uniqueIds = [...new Set(allIds.map((id) => id.toString()))];

  const libs = uniqueIds.length
    ? await ExerciseUserLibrary.find({ _id: { $in: uniqueIds } }).select('name')
    : [];

  const libById = new Map(libs.map((l) => [l._id.toString(), l.name]));

  return templateDocs.map((template) => ({
    _id: template._id,
    userId: template.userId,
    trainingFileId: template.trainingFileId,
    name: template.name,
    exercises: template.exercises.map((e) => ({
      _id: e._id,
      exerciseUserLibraryId: e.exerciseUserLibraryId,
      name: libById.get(e.exerciseUserLibraryId.toString()) || 'Unknown exercise',
    })),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }));
};

const normalizeTemplateExercises = async (userId, exercisesInput = []) => {
  if (!Array.isArray(exercisesInput)) return [];

  const normalized = [];

  for (const item of exercisesInput) {
    if (!item) continue;

    let libraryId = null;

    if (typeof item === 'string') {
      const name = item.trim();
      if (!name) continue;

      let lib = await ExerciseUserLibrary.findOne({ userId, name });
      if (!lib) lib = await ExerciseUserLibrary.create({ userId, name });
      libraryId = lib._id;
    } else if (item.exerciseUserLibraryId && mongoose.isValidObjectId(item.exerciseUserLibraryId)) {
      libraryId = item.exerciseUserLibraryId;
    } else if (item.name && typeof item.name === 'string') {
      const name = item.name.trim();
      if (!name) continue;

      let lib = await ExerciseUserLibrary.findOne({ userId, name });
      if (!lib) lib = await ExerciseUserLibrary.create({ userId, name });
      libraryId = lib._id;
    }

    if (!libraryId) continue;

    if (!normalized.some((e) => e.exerciseUserLibraryId.toString() === libraryId.toString())) {
      normalized.push({ exerciseUserLibraryId: libraryId });
    }
  }

  return normalized;
};

router.get('/', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const templates = await Template.find({ userId: req.userId, trainingFileId: req.params.fileId }).sort({ createdAt: 1 });
    const mapped = await mapTemplateWithNames(templates);

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, exercises } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Имя шаблона обязательно' });

    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const normalizedExercises = await normalizeTemplateExercises(req.userId, exercises);

    const template = await Template.create({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      name: name.trim(),
      exercises: normalizedExercises,
    });

    const [mapped] = await mapTemplateWithNames([template]);
    res.status(201).json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Шаблон с таким названием уже существует' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:templateId', async (req, res) => {
  try {
    const { name, exercises } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Имя шаблона обязательно' });

    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const template = await Template.findOne({
      _id: req.params.templateId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
    });

    if (!template) return res.status(404).json({ message: 'Шаблон не найден' });

    const normalizedExercises = await normalizeTemplateExercises(req.userId, exercises);

    template.name = name.trim();
    template.exercises = normalizedExercises;
    await template.save();

    const [mapped] = await mapTemplateWithNames([template]);
    res.json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Шаблон с таким названием уже существует' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:templateId', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const deleted = await Template.findOneAndDelete({
      _id: req.params.templateId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
    });

    if (!deleted) return res.status(404).json({ message: 'Шаблон не найден' });

    res.status(200).json({ message: 'Шаблон удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
