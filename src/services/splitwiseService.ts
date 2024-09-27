// src/services/userService.ts

import { AxiosHelper } from '../utils/AxiosHelper';

export class UserService {
  conector: AxiosHelper;
  constructor() {
    this.conector = new AxiosHelper({
      baseUrl: 'https://secure.splitwise.com/api/v3.0',
      token: process.env.SPLITWISE_KEY,
      successKey: '',
      serviceName: 'SPLITWISE',
    });
  }

  async getGroups() {
    try {
      const groups = await this.conector.request({
        url: '/get_groups',
        method: 'get',
      });
      return groups;
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      throw new Error(`Error fetching groups: ${error.message}`);
    }
  }
}
