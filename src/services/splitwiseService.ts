// src/services/userService.ts

import { IApiResponse } from '../types';
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
      const groups = await this.conector.request<any>({
        url: '/get_groups',
        method: 'get',
      });

      let response = groups.getResponse();

      if (response.success) {
        response.data = response.data.groups.map((g: any) => {
          return {
            id: g.id,
            name: g.name,
          };
        });
      }
      return response;
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      throw new Error(`Error fetching groups: ${error.message}`);
    }
  }

  async getGroup(groupId: string): Promise<IApiResponse<any>> {
    try {
      const group = await this.conector.request({
        url: '/get_group/' + groupId,
        method: 'get',
      });
      return group.getResponse();
    } catch (error: any) {
      console.error('Error fetching group:', error);
      throw new Error(`Error fetching group: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const categories = await this.conector.request<any>({
        url: '/get_categories',
        method: 'get',
      });

      let response = categories.getResponse();
      if (response.success) {
        response.data = response.data.categories.map((c: any) => {
          return {
            id: c.id,
            name: c.name,
          };
        });
      }

      return response;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  async getMembers(groupId: string): Promise<IApiResponse<any>> {
    try {
      const group = await this.getGroup(groupId);

      if (!group.success) {
        throw new Error('Group not found');
      }

      return {
        success: true,
        data: group.data.group.members.map((i: any) => {
          return {
            label: i.first_name,
            value: i.id,
          };
        }),
      };
    } catch (error: any) {
      console.error('Error fetching members:', error);
      throw new Error(`Error fetching members: ${error.message}`);
    }
  }
}
