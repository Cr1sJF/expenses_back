// src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService as SplitwiseService } from '../services/splitwiseService';

export class SplitwiseController {
  private splitwiseService: SplitwiseService;

  constructor() {
    this.splitwiseService = new SplitwiseService();
  }

  getGroups = async (req: Request, res: Response): Promise<any> => {
    const users = await this.splitwiseService.getGroups();
    res.json(users.getResponse());
  };
}
