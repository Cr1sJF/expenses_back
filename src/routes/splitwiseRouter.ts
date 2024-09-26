// src/routes/userRoutes.ts
import { Router } from 'express';
import { SplitwiseController } from '../controllers/splitwiseController';

const router = Router();
const userController = new SplitwiseController();

router.get('/groups', userController.getGroups);

export default router;
