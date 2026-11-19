import { Router } from 'express';
import * as users from '../controllers/userController';
import * as catalog from '../controllers/catalogController';
import * as workouts from '../controllers/workoutController';
import * as progress from '../controllers/progressController';
import * as misc from '../controllers/miscController';
import { validate } from '../middleware/validate';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth';
import { updateMeSchema } from '../validators/auth';
import { onboardingSchema, updateProfileSchema, createGoalSchema, updateGoalSchema, measurementSchema } from '../validators/profile';
import {
  exerciseQuerySchema,
  createExerciseSchema,
  updateExerciseSchema,
  programQuerySchema,
  createProgramSchema,
  updateProgramSchema,
} from '../validators/catalog';
import {
  startWorkoutSchema,
  addSetSchema,
  updateSetSchema,
  updateSessionExerciseSchema,
  historyQuerySchema,
  completeWorkoutSchema,
} from '../validators/workout';

const router = Router();

/* ---------------------------------- Users --------------------------------- */
router.get('/users/me', requireAuth, users.getMe);
router.patch('/users/me', requireAuth, validate(updateMeSchema), users.updateMe);
router.delete('/users/me', requireAuth, users.deleteMe);

/* --------------------------------- Profile -------------------------------- */
router.get('/profile', requireAuth, users.getProfile);
router.post('/profile/onboarding', requireAuth, validate(onboardingSchema), users.saveOnboarding);
router.put('/profile', requireAuth, validate(updateProfileSchema), users.updateProfile);

/* ---------------------------------- Goals --------------------------------- */
router.get('/profile/goals', requireAuth, users.listGoals);
router.post('/profile/goals', requireAuth, validate(createGoalSchema), users.createGoal);
router.patch('/profile/goals/:id', requireAuth, validate(updateGoalSchema), users.updateGoal);
router.delete('/profile/goals/:id', requireAuth, users.deleteGoal);

/* -------------------------------- Exercises ------------------------------- */
router.get('/exercises', validate(exerciseQuerySchema, 'query'), optionalAuth, catalog.listExercises);
router.get('/exercises/:id', optionalAuth, catalog.getExercise);
router.post('/exercises', requireAuth, requireAdmin, validate(createExerciseSchema), catalog.createExercise);
router.patch('/exercises/:id', requireAuth, requireAdmin, validate(updateExerciseSchema), catalog.updateExercise);
router.delete('/exercises/:id', requireAuth, requireAdmin, catalog.deleteExercise);

/* -------------------------------- Programs -------------------------------- */
router.get('/programs', validate(programQuerySchema, 'query'), optionalAuth, catalog.listPrograms);
router.get('/programs/:id', optionalAuth, catalog.getProgram);
router.post('/programs', requireAuth, requireAdmin, validate(createProgramSchema), catalog.createProgram);
router.patch('/programs/:id', requireAuth, requireAdmin, validate(updateProgramSchema), catalog.updateProgram);
router.delete('/programs/:id', requireAuth, requireAdmin, catalog.deleteProgram);

/* -------------------------------- Workouts -------------------------------- */
router.post('/workouts/start', requireAuth, validate(startWorkoutSchema), workouts.startWorkout);
router.get('/workouts/active', requireAuth, workouts.getActive);
router.get('/workouts/history', requireAuth, validate(historyQuerySchema, 'query'), workouts.history);
router.get('/workouts/:id', requireAuth, workouts.getSession);
router.post('/workouts/:id/sets', requireAuth, validate(addSetSchema), workouts.addSet);
router.patch('/workouts/:id/sets/:exerciseId/:setNumber', requireAuth, validate(updateSetSchema), workouts.updateSet);
router.delete('/workouts/:id/sets/:exerciseId/:setNumber', requireAuth, workouts.deleteSet);
router.patch('/workouts/:id/exercises/:exerciseId', requireAuth, validate(updateSessionExerciseSchema), workouts.updateExerciseEntry);
router.post('/workouts/:id/complete', requireAuth, validate(completeWorkoutSchema), workouts.completeWorkout);
router.post('/workouts/:id/abandon', requireAuth, workouts.abandonWorkout);

/* -------------------------------- Progress -------------------------------- */
router.get('/progress/overview', requireAuth, progress.overview);
router.get('/progress/weight', requireAuth, progress.weightHistory);
router.post('/progress/weight', requireAuth, validate(measurementSchema), progress.addWeight);
router.get('/progress/measurements', requireAuth, progress.getMeasurements);
router.post('/progress/measurements', requireAuth, validate(measurementSchema), progress.addMeasurement);
router.get('/progress/records', requireAuth, progress.records);
router.get('/progress/activity', requireAuth, progress.activitySeries);

/* -------------------------------- Favorites -------------------------------- */
router.get('/favorites', requireAuth, misc.listFavorites);
router.post('/favorites', requireAuth, misc.addFavorite);
router.delete('/favorites/:id', requireAuth, misc.removeFavorite);

/* ------------------------------ Notifications ----------------------------- */
router.get('/notifications', requireAuth, misc.listNotifications);
router.patch('/notifications/read-all', requireAuth, misc.markAllRead);
router.patch('/notifications/:id/read', requireAuth, misc.markNotificationRead);
router.post('/notifications/devices', requireAuth, misc.registerDevice);
router.delete('/notifications/devices', requireAuth, misc.unregisterDevice);

export default router;
