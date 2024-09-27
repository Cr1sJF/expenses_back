// src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService as SplitwiseService } from '../services/splitwiseService';

export class SplitwiseController {
  private splitwiseService: SplitwiseService;

  constructor() {
    this.splitwiseService = new SplitwiseService();
  }

  getGroups = async (req: Request, res: Response): Promise<any> => {
    const groups = await this.splitwiseService.getGroups();
    res.json(groups);
  };

  getGroup = async (req: Request, res: Response): Promise<any> => {
    const group = await this.splitwiseService.getGroup(req.params.id);
    res.json(group);
  };

  getCategories = async (req: Request, res: Response): Promise<any> => {
    const categories = await this.splitwiseService.getCategories();
    res.json(categories);
  };

  getMembers = async (req: Request, res: Response): Promise<any> => {
    const members = await this.splitwiseService.getMembers(req.params.id);
    res.json(members);
  };
}
