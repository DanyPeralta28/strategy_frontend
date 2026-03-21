import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getPermissionsByUser(idUser: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.permissions}/${idUser}`)
    );
  }

  saveIndividualPermissions(data: {
    id_user: number | string;
    created_by: number | string;
    permissions: Array<{
      id_submodule: number;
      can_view: boolean;
      can_edit: boolean;
    }>;
  }): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.permissionsIndividual}`, data)
    );
  }

  saveMassivePermissions(data: {
    users: Array<number | string>;
    created_by: number | string;
    permissions: Array<{
      id_submodule: number;
      can_view: boolean;
      can_edit: boolean;
    }>;
  }): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.permissionsMassive}`, data)
    );
  }

  updateUserDashboardStatus(data: {
    id_user: number | string;
    status_dashboard: 0 | 1;
  }): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.baseUrl}${ApiRoutes.usersStatusDashboard}`, data)
    );
  }

  updateUserDashboardColor(data: {
    id_user: number | string;
    color: string;
  }): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.baseUrl}${ApiRoutes.usersColor}`, data)
    );
  }
}

export const ApiRoutes = {
  permissions: '/api/permissions',
  permissionsIndividual: '/api/permissions/individual',
  permissionsMassive: '/api/permissions/massive',
  usersStatusDashboard: '/api/users/status-dashboard',
  usersColor: '/api/users/color',
};
