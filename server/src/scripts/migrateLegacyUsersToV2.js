import fs from 'fs';
import path from 'path';
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';

const parseArgs = (argv) => {
  const options = {
    dryRun: false,
    cleanup: false,
    overwrite: false,
    userId: null,
    email: null,
    limit: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--cleanup') options.cleanup = true;
    else if (arg === '--overwrite') options.overwrite = true;
    else if (arg === '--user-id') {
      options.userId = argv[i + 1] || null;
      i += 1;
    } else if (arg === '--email') {
      options.email = argv[i + 1] || null;
      i += 1;
    } else if (arg === '--limit') {
      options.limit = Number(argv[i + 1] || 0) || null;
      i += 1;
    }
  }

  return options;
};

const normalizeName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const toUtcStartDate = (value) => {
  if (!value) return null;
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const dateKey = raw.includes('T') ? raw.split('T')[0] : raw;
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeWeights = (weights) => {
  if (!Array.isArray(weights)) return [];

  return weights
    .map((weightItem) => {
      const weightValue = Number(weightItem?.weight);
      if (!Number.isFinite(weightValue) || weightValue < 0) return null;

      const sets = Array.isArray(weightItem?.sets)
        ? weightItem.sets
            .map((setValue) => {
              if (setValue && typeof setValue === 'object') {
                const reps = Number(setValue.reps);
                return Number.isFinite(reps) && reps >= 0 ? reps : null;
              }
              const reps = Number(setValue);
              return Number.isFinite(reps) && reps >= 0 ? reps : null;
            })
            .filter((reps) => reps !== null)
        : [];

      return {
        weight: weightValue,
        sets,
      };
    })
    .filter(Boolean);
};

const loadEnv = () => {
  const cwd = process.cwd();
  const envCandidates = [
    path.join(cwd, '.env.development'),
    path.join(cwd, '.env'),
  ];

  for (const candidate of envCandidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return candidate;
    }
  }

  dotenv.config();
  return 'default dotenv resolution';
};

dns.setServers(['8.8.8.8', '8.8.4.4']);

const getLegacyUsers = async (options) => {
  const usersCollection = mongoose.connection.db.collection('users');
  const query = {
    trainingfiles: { $exists: true, $type: 'array', $ne: [] },
  };

  if (options.userId) {
    if (!mongoose.isValidObjectId(options.userId)) {
      throw new Error(`Invalid --user-id: ${options.userId}`);
    }
    query._id = new mongoose.Types.ObjectId(options.userId);
  }

  if (options.email) {
    query.email = String(options.email).trim().toLowerCase();
  }

  const cursor = usersCollection.find(query);
  if (options.limit && options.limit > 0) {
    cursor.limit(options.limit);
  }

  return cursor.toArray();
};

const buildTrainingOrderMap = (user) => {
  const map = new Map();
  const orderSource = Array.isArray(user.trainingOrder) ? user.trainingOrder : [];

  orderSource.forEach((idValue, index) => {
    const key = String(idValue || '');
    if (key) map.set(key, index);
  });

  return map;
};

const findOrCreateLibraryExercise = async ({ userId, exerciseName, cache, dryRun }) => {
  const normalized = normalizeName(exerciseName);
  if (!normalized) return { exercise: null, created: false };

  const cacheKey = normalized.toLowerCase();
  if (cache.has(cacheKey)) {
    return { exercise: cache.get(cacheKey), created: false };
  }

  const existing = await ExerciseUserLibrary.findOne({
    userId,
    name: { $regex: `^${escapeRegex(normalized)}$`, $options: 'i' },
  });

  if (existing) {
    cache.set(cacheKey, existing);
    return { exercise: existing, created: false };
  }

  if (dryRun) {
    const virtual = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      name: normalized,
    };
    cache.set(cacheKey, virtual);
    return { exercise: virtual, created: true };
  }

  try {
    const created = await ExerciseUserLibrary.create({
      userId,
      name: normalized,
    });
    cache.set(cacheKey, created);
    return { exercise: created, created: true };
  } catch (err) {
    if (err?.code === 11000) {
      const duplicate = await ExerciseUserLibrary.findOne({
        userId,
        name: { $regex: `^${escapeRegex(normalized)}$`, $options: 'i' },
      });
      if (duplicate) {
        cache.set(cacheKey, duplicate);
        return { exercise: duplicate, created: false };
      }
    }
    throw err;
  }
};

const migrateUser = async (legacyUser, options) => {
  const stats = {
    trainingFiles: 0,
    trainingDates: 0,
    libraryExercises: 0,
    exerciseEntries: 0,
    templates: 0,
    skippedEntries: 0,
  };

  const userId = legacyUser._id;
  const trainingfiles = Array.isArray(legacyUser.trainingfiles) ? legacyUser.trainingfiles : [];
  const orderMap = buildTrainingOrderMap(legacyUser);
  const libraryCache = new Map();

  for (let fileIndex = 0; fileIndex < trainingfiles.length; fileIndex += 1) {
    const oldFile = trainingfiles[fileIndex];
    const fileName = normalizeName(oldFile?.name);
    if (!fileName) continue;

    const fileOrder = orderMap.get(String(oldFile?._id || '')) ?? fileIndex;

    let trainingFileDoc = await TrainingFile.findOne({ userId, name: fileName });
    if (!trainingFileDoc) {
      if (!options.dryRun) {
        trainingFileDoc = await TrainingFile.create({
          userId,
          name: fileName,
          order: fileOrder,
        });
      } else {
        trainingFileDoc = {
          _id: new mongoose.Types.ObjectId(),
          userId,
          name: fileName,
          order: fileOrder,
        };
      }
      stats.trainingFiles += 1;
    } else if (!options.dryRun && trainingFileDoc.order !== fileOrder) {
      trainingFileDoc.order = fileOrder;
      await trainingFileDoc.save();
    }

    const oldDates = Array.isArray(oldFile?.dates) ? oldFile.dates : [];
    for (const oldDate of oldDates) {
      const utcDate = toUtcStartDate(oldDate?.date);
      if (!utcDate) continue;

      let trainingDateDoc = await TrainingDate.findOne({
        userId,
        trainingFileId: trainingFileDoc._id,
        date: utcDate,
      });

      if (!trainingDateDoc) {
        if (!options.dryRun) {
          trainingDateDoc = await TrainingDate.create({
            userId,
            trainingFileId: trainingFileDoc._id,
            date: utcDate,
          });
        } else {
          trainingDateDoc = {
            _id: new mongoose.Types.ObjectId(),
            userId,
            trainingFileId: trainingFileDoc._id,
            date: utcDate,
          };
        }
        stats.trainingDates += 1;
      }

      const oldExercises = Array.isArray(oldDate?.exercises) ? oldDate.exercises : [];
      for (const oldExercise of oldExercises) {
        const { exercise: libraryExercise, created } = await findOrCreateLibraryExercise({
          userId,
          exerciseName: oldExercise?.name,
          cache: libraryCache,
          dryRun: options.dryRun,
        });
        if (!libraryExercise) continue;

        if (created) stats.libraryExercises += 1;

        const normalizedWeights = normalizeWeights(oldExercise?.weights);
        const entryQuery = {
          userId,
          trainingFileId: trainingFileDoc._id,
          trainingDateId: trainingDateDoc._id,
          exerciseUserLibraryId: libraryExercise._id,
        };

        if (options.dryRun) {
          stats.exerciseEntries += 1;
          continue;
        }

        const existingEntry = await ExerciseEntry.findOne(entryQuery);
        if (existingEntry && !options.overwrite) {
          stats.skippedEntries += 1;
          continue;
        }

        if (existingEntry && options.overwrite) {
          existingEntry.weights = normalizedWeights;
          await existingEntry.save();
          stats.exerciseEntries += 1;
          continue;
        }

        await ExerciseEntry.create({
          ...entryQuery,
          weights: normalizedWeights,
        });
        stats.exerciseEntries += 1;
      }
    }

    const oldTemplates = Array.isArray(oldFile?.templates) ? oldFile.templates : [];
    for (const oldTemplate of oldTemplates) {
      const templateName = normalizeName(oldTemplate?.name);
      if (!templateName) continue;

      const oldTemplateExercises = Array.isArray(oldTemplate?.exercises) ? oldTemplate.exercises : [];
      const templateExercises = [];
      const dedupe = new Set();

      for (const templateExercise of oldTemplateExercises) {
        const { exercise: libraryExercise, created } = await findOrCreateLibraryExercise({
          userId,
          exerciseName: templateExercise?.name,
          cache: libraryCache,
          dryRun: options.dryRun,
        });
        if (!libraryExercise) continue;
        if (created) stats.libraryExercises += 1;

        const key = String(libraryExercise._id);
        if (dedupe.has(key)) continue;
        dedupe.add(key);
        templateExercises.push({
          exerciseUserLibraryId: libraryExercise._id,
        });
      }

      if (!options.dryRun) {
        const existingTemplate = await Template.findOne({
          userId,
          trainingFileId: trainingFileDoc._id,
          name: templateName,
        });

        if (existingTemplate) {
          if (options.overwrite) {
            existingTemplate.exercises = templateExercises;
            await existingTemplate.save();
          }
        } else {
          await Template.create({
            userId,
            trainingFileId: trainingFileDoc._id,
            name: templateName,
            exercises: templateExercises,
          });
          stats.templates += 1;
        }
      } else {
        stats.templates += 1;
      }
    }
  }

  if (options.cleanup && !options.dryRun) {
    await mongoose.connection.db.collection('users').updateOne(
      { _id: userId },
      { $unset: { trainingfiles: '', trainingOrder: '' } }
    );
  }

  return stats;
};

const main = async () => {
  const options = parseArgs(process.argv);
  const envLoadedFrom = loadEnv();
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Check your .env/.env.development');
  }

  console.log(`[migrate] env loaded from: ${envLoadedFrom}`);
  console.log(`[migrate] dryRun=${options.dryRun}, cleanup=${options.cleanup}, overwrite=${options.overwrite}`);
  if (options.userId) console.log(`[migrate] userId filter: ${options.userId}`);
  if (options.email) console.log(`[migrate] email filter: ${options.email}`);

  await mongoose.connect(mongoUri);
  console.log('[migrate] connected to MongoDB');

  try {
    const legacyUsers = await getLegacyUsers(options);
    if (!legacyUsers.length) {
      console.log('[migrate] no legacy users found');
      return;
    }

    console.log(`[migrate] users to process: ${legacyUsers.length}`);

    const total = {
      users: legacyUsers.length,
      trainingFiles: 0,
      trainingDates: 0,
      libraryExercises: 0,
      exerciseEntries: 0,
      templates: 0,
      skippedEntries: 0,
    };

    for (const legacyUser of legacyUsers) {
      const authUser = await User.findById(legacyUser._id).select('_id email');
      if (!authUser) {
        console.log(`[migrate] skip unknown user: ${legacyUser._id}`);
        continue;
      }

      console.log(`[migrate] processing user ${authUser.email} (${authUser._id})`);
      const userStats = await migrateUser(legacyUser, options);

      total.trainingFiles += userStats.trainingFiles;
      total.trainingDates += userStats.trainingDates;
      total.libraryExercises += userStats.libraryExercises;
      total.exerciseEntries += userStats.exerciseEntries;
      total.templates += userStats.templates;
      total.skippedEntries += userStats.skippedEntries;

      console.log(
        `[migrate] user done: files=${userStats.trainingFiles}, dates=${userStats.trainingDates}, ` +
          `library=${userStats.libraryExercises}, entries=${userStats.exerciseEntries}, ` +
          `templates=${userStats.templates}, skippedEntries=${userStats.skippedEntries}`
      );
    }

    console.log('[migrate] complete');
    console.log(JSON.stringify(total, null, 2));
  } finally {
    await mongoose.disconnect();
    console.log('[migrate] disconnected');
  }
};

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exitCode = 1;
});
