// src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService as SplitwiseService } from '../services/splitwiseService';

export class SplitwiseController {
  private splitwiseService: SplitwiseService;

  constructor() {
    this.splitwiseService = new SplitwiseService();
  }

  getGroups = (req: Request, res: Response): void => {
    const users = this.splitwiseService.getGroups();
    res.json(users);
  };
}
