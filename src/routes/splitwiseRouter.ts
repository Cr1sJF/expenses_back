// src/routes/userRoutes.ts
import { Router } from 'express';
import { SplitwiseController } from '../controllers/splitwiseController';

const router = Router();
const userController = new SplitwiseController();

router.get('/groups', userController.getGroups);

router.get('/group/:id', userController.getGroup);

router.get('/categories', userController.getCategories);

router.get('/members/:id', userController.getMembers);

export default router;
