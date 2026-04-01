import express from 'express';
import mongoose from 'mongoose';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import ExerciseUserLibrary, {
  normalizeMuscleGroup,
} from '../models/ExerciseUserLibrary.js';
import UserMuscleGroup from '../models/UserMuscleGroup.js';
import { authMiddleware } from '../middleware/auth.js';
import { DEFAULT_MUSCLE_GROUPS } from '../utils/muscleGroups.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

const normalizeDateString = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const str = String(value);
  return str.includes('T') ? str.split('T')[0] : str;
};

const toDateStartUtc = (dateLike) => {
  const normalized = normalizeDateString(dateLike);
  const dt = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const findTrainingDate = async (userId, fileId, date) => {
  const dt = toDateStartUtc(date);
  if (!dt) return null;

  return TrainingDate.findOne({
    userId,
    trainingFileId: fileId,
    date: dt,
  });
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureUserMuscleGroup = async (userId, rawGroupName) => {
  const normalizedGroup = normalizeMuscleGroup(rawGroupName);

  if (!normalizedGroup) {
    return normalizeMuscleGroup();
  }

  if (
    DEFAULT_MUSCLE_GROUPS.some(
      (group) => group.toLowerCase() === normalizedGroup.toLowerCase()
    )
  ) {
    return normalizeMuscleGroup(normalizedGroup, DEFAULT_MUSCLE_GROUPS);
  }

  const existing = await UserMuscleGroup.findOne({
    userId,
    name: { $regex: `^${escapeRegex(normalizedGroup)}$`, $options: 'i' },
  });

  if (existing) return existing.name;

  try {
    const created = await UserMuscleGroup.create({
      userId,
      name: normalizedGroup,
    });

    return created.name;
  } catch (err) {
    if (err?.code === 11000) {
      const duplicate = await UserMuscleGroup.findOne({
        userId,
        name: { $regex: `^${escapeRegex(normalizedGroup)}$`, $options: 'i' },
      });

      return duplicate?.name || normalizedGroup;
    }

    throw err;
  }
};

const compareExerciseEntries = (a, b) => {
  const hasAOrder = Number.isFinite(a.order);
  const hasBOrder = Number.isFinite(b.order);

  if (hasAOrder && hasBOrder && a.order !== b.order) {
    return a.order - b.order;
  }

  if (hasAOrder !== hasBOrder) {
    return hasAOrder ? -1 : 1;
  }

  const aCreatedAt = new Date(a.createdAt || 0).getTime();
  const bCreatedAt = new Date(b.createdAt || 0).getTime();

  if (aCreatedAt !== bCreatedAt) {
    return aCreatedAt - bCreatedAt;
  }

  return String(a._id).localeCompare(String(b._id));
};

const normalizeExerciseEntryOrder = async (entries) => {
  const orderedEntries = [...entries].sort(compareExerciseEntries);
  const needsNormalization = orderedEntries.some((entry, index) => entry.order !== index);

  if (!needsNormalization || orderedEntries.length === 0) {
    return orderedEntries;
  }

  await ExerciseEntry.bulkWrite(
    orderedEntries.map((entry, index) => ({
      updateOne: {
        filter: { _id: entry._id },
        update: { $set: { order: index } },
      },
    }))
  );

  orderedEntries.forEach((entry, index) => {
    entry.order = index;
  });

  return orderedEntries;
};

const mapEntriesToExercises = async (entries) => {
  const libraryIds = entries.map((e) => e.exerciseUserLibraryId.toString());
  const uniqueIds = [...new Set(libraryIds)];
  const libs = uniqueIds.length
    ? await ExerciseUserLibrary.find({ _id: { $in: uniqueIds } }).select('name muscleGroup')
    : [];

  const libraryById = new Map(
    libs.map((l) => [
      l._id.toString(),
      {
        name: l.name,
        muscleGroup: normalizeMuscleGroup(l.muscleGroup),
      },
    ])
  );

  return entries.map((entry) => {
    const libraryExercise = libraryById.get(entry.exerciseUserLibraryId.toString());

    return {
      _id: entry._id,
      exerciseUserLibraryId: entry.exerciseUserLibraryId,
      name: libraryExercise?.name || 'Unknown exercise',
      muscleGroup: libraryExercise?.muscleGroup || normalizeMuscleGroup(),
      order: Number.isFinite(entry.order) ? entry.order : 0,
      weights: entry.weights || [],
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  });
};

const ensureFile = async (userId, fileId) => {
  if (!mongoose.isValidObjectId(fileId)) return null;
  return TrainingFile.findOne({ _id: fileId, userId });
};

router.get('/', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    const orderedEntries = await normalizeExerciseEntryOrder(entries);
    const exercises = await mapEntriesToExercises(orderedEntries);
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, exerciseUserLibraryId } = req.body;
    if ((!name || !name.trim()) && !exerciseUserLibraryId) {
      return res.status(400).json({ message: 'Имя упражнения обязательно' });
    }

    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    let libraryExercise = null;

    if (exerciseUserLibraryId && mongoose.isValidObjectId(exerciseUserLibraryId)) {
      libraryExercise = await ExerciseUserLibrary.findOne({
        _id: exerciseUserLibraryId,
        userId: req.userId,
      });
      if (!libraryExercise) {
        return res.status(404).json({ message: 'Упражнение из библиотеки не найдено' });
      }
    } else {
      const normalizedName = name.trim();
      const escaped = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      libraryExercise = await ExerciseUserLibrary.findOne({
        userId: req.userId,
        name: { $regex: `^${escaped}$`, $options: 'i' },
      });

      if (!libraryExercise) {
        libraryExercise = await ExerciseUserLibrary.create({
          userId: req.userId,
          name: normalizedName,
        });
      }
    }

    const existing = await ExerciseEntry.findOne({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: libraryExercise._id,
    });

    if (existing) {
      const [mapped] = await mapEntriesToExercises([existing]);
      return res.status(200).json(mapped);
    }

    const currentEntries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });
    const orderedEntries = await normalizeExerciseEntryOrder(currentEntries);

    const entry = await ExerciseEntry.create({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: libraryExercise._id,
      order: orderedEntries.length,
      weights: [],
    });

    const [mapped] = await mapEntriesToExercises([entry]);
    res.status(201).json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Это упражнение уже добавлено на выбранную дату' });
    }
    res.status(500).json({ message: 'Ошибка добавления упражнения' });
  }
});

router.post('/apply-template', async (req, res) => {
  try {
    const { exercises: templateExercises } = req.body;
    const { fileId, date } = req.params;

    if (!Array.isArray(templateExercises)) {
      return res.status(400).json({ message: 'Неверный формат упражнений в шаблоне' });
    }

    const file = await ensureFile(req.userId, fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, fileId, date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const currentEntries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: fileId,
      trainingDateId: dateEntry._id,
    });
    const orderedEntries = await normalizeExerciseEntryOrder(currentEntries);
    let nextOrder = orderedEntries.length;
    const createdOrFound = [];

    for (const exercise of templateExercises) {
      if (!exercise) continue;

      let libraryExercise = null;

      if (exercise.exerciseUserLibraryId && mongoose.isValidObjectId(exercise.exerciseUserLibraryId)) {
        libraryExercise = await ExerciseUserLibrary.findOne({
          _id: exercise.exerciseUserLibraryId,
          userId: req.userId,
        });
      } else if (exercise.name && typeof exercise.name === 'string') {
        const normalizedName = exercise.name.trim();
        if (!normalizedName) continue;

        libraryExercise = await ExerciseUserLibrary.findOne({ userId: req.userId, name: normalizedName });
        if (!libraryExercise) {
          libraryExercise = await ExerciseUserLibrary.create({ userId: req.userId, name: normalizedName });
        }
      }

      if (!libraryExercise) continue;

      let entry = await ExerciseEntry.findOne({
        userId: req.userId,
        trainingFileId: fileId,
        trainingDateId: dateEntry._id,
        exerciseUserLibraryId: libraryExercise._id,
      });

      if (!entry) {
        entry = await ExerciseEntry.create({
          userId: req.userId,
          trainingFileId: fileId,
          trainingDateId: dateEntry._id,
          exerciseUserLibraryId: libraryExercise._id,
          order: nextOrder,
          weights: [],
        });

        nextOrder += 1;
      }

      createdOrFound.push(entry);
    }

    const mapped = await mapEntriesToExercises(createdOrFound);
    res.status(201).json(mapped);
  } catch (err) {
    res.status(500).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

router.post('/reorder', async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: 'Order must be a non-empty array of exercise ids' });
    }

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });
    const orderedEntries = await normalizeExerciseEntryOrder(entries);
    const existingIds = orderedEntries.map((entry) => String(entry._id));
    const requestedIds = order.map((id) => String(id));
    const requestedIdSet = new Set(requestedIds);

    const isInvalidOrder =
      existingIds.length !== requestedIds.length ||
      requestedIdSet.size !== requestedIds.length ||
      existingIds.some((id) => !requestedIdSet.has(id));

    if (isInvalidOrder) {
      return res.status(400).json({ message: 'Order must include all exercises exactly once' });
    }

    await ExerciseEntry.bulkWrite(
      requestedIds.map((id, index) => ({
        updateOne: {
          filter: {
            _id: id,
            userId: req.userId,
            trainingFileId: req.params.fileId,
            trainingDateId: dateEntry._id,
          },
          update: { $set: { order: index } },
        },
      }))
    );

    const entryById = new Map(orderedEntries.map((entry) => [String(entry._id), entry]));
    const reorderedEntries = requestedIds
      .map((id, index) => {
        const entry = entryById.get(id);
        if (entry) entry.order = index;
        return entry;
      })
      .filter(Boolean);

    const exercises = await mapEntriesToExercises(reorderedEntries);
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:exerciseId', async (req, res) => {
  try {
    const { name, muscleGroup } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Имя упражнения обязательно' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entry = await ExerciseEntry.findOne({
      _id: req.params.exerciseId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    if (!entry) return res.status(404).json({ message: 'Упражнение не найдено' });

    const normalizedName = name.trim();
    const escaped = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let targetLibrary = await ExerciseUserLibrary.findOne({
      userId: req.userId,
      name: { $regex: `^${escaped}$`, $options: 'i' },
    });

    if (!targetLibrary) {
      targetLibrary = await ExerciseUserLibrary.create({
        userId: req.userId,
        name: normalizedName,
        muscleGroup: await ensureUserMuscleGroup(req.userId, muscleGroup),
      });
    } else if (muscleGroup !== undefined) {
      targetLibrary.muscleGroup = await ensureUserMuscleGroup(req.userId, muscleGroup);
      await targetLibrary.save();
    }

    const duplicateEntry = await ExerciseEntry.findOne({
      _id: { $ne: entry._id },
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: targetLibrary._id,
    });

    if (duplicateEntry) {
      return res.status(409).json({
        message: 'Упражнение с таким названием уже есть в этой дате',
      });
    }

    entry.exerciseUserLibraryId = targetLibrary._id;
    await entry.save();

    const [mapped] = await mapEntriesToExercises([entry]);
    res.json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: 'Упражнение с таким названием уже есть в этой дате',
      });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:exerciseId', async (req, res) => {
  try {
    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const deleted = await ExerciseEntry.findOneAndDelete({
      _id: req.params.exerciseId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    if (!deleted) return res.status(404).json({ message: 'Упражнение не найдено' });

    res.status(200).json({ message: 'Упражнение успешно удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка на сервере при удалении упражнения' });
  }
});

router.get('/test-apply-template', (req, res) => {
  res.json({
    message: 'Apply template endpoint is accessible',
    params: req.params,
    timestamp: new Date().toISOString(),
  });
});

export default router;
