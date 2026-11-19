import { Router } from 'express';
import multer from 'multer';
import * as admin from '../controllers/adminController';
import * as catalog from '../controllers/catalogController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createExerciseSchema, updateExerciseSchema, createProgramSchema, updateProgramSchema } from '../validators/catalog';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image|video)\//.test(file.mimetype);
    cb(null, allowed);
  },
});

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', admin.dashboard);
router.get('/users', admin.users);
router.patch('/users/:id/status', admin.setUserDisabled);

router.get('/exercises', catalog.listExercises);
router.post('/exercises', validate(createExerciseSchema), admin.createExercise);
router.patch('/exercises/:id', validate(updateExerciseSchema), admin.updateExercise);
router.delete('/exercises/:id', admin.deleteExercise);

router.get('/programs', catalog.listPrograms);
router.post('/programs', validate(createProgramSchema), admin.createProgram);
router.patch('/programs/:id', validate(updateProgramSchema), admin.updateProgram);
router.delete('/programs/:id', admin.deleteProgram);

router.post('/uploads', upload.single('file'), admin.uploadContent);

export default router;
