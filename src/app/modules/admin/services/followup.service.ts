// followup.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getSessionEntityId } from 'app/core/auth/auth-session';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class FollowupService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private withEntityQuery(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}id_entity=${getSessionEntityId()}`;
  }

  // ----------- Priority Weeks -----------
  createPriorityWeek(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.priorityWeeks}`, data));
  }
  getAllPriorityWeeks(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.priorityWeeks}`));
  }
  getPriorityWeekById(id: number | string, id_user: number | string): Promise<any> {
    return firstValueFrom(this.http.get(this.withEntityQuery(`${this.baseUrl}${ApiRoutes.priorityWeeks}?id_company=${id}&id_user=${id_user}`)));
  }
  getPriorityWeekByGroupView(id: number | string, id_user: number | string): Promise<any> {
    return firstValueFrom(this.http.get(this.withEntityQuery(`${this.baseUrl}${ApiRoutes.priorityWeeks}/group-view?id_company=${id}&id_user=${id_user}`)));
  }
  updatePriorityWeek(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.priorityWeeks}/${id}`, data));
  }
  deletePriorityWeek(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.priorityWeeks}/${id}`));
  }
  getPriorityWeeksFiltered(
    idCompany: number | string,
    idEntity: number | string,
    team: string,
    week: number | string,
    createdBy: number | string
  ): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.priorityWeeks}/group/${idCompany}/${idEntity}/${team}/${week}/${createdBy}`
      )
    );
  }

  getPriorityWeeksFilteredAdmin(
    idCompany: number | string,
    idEntity: number | string,
    team: string,
    week: number | string
  ): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.priorityWeeks}/group-admin/${idCompany}/${idEntity}/${team}/${week}`
      )
    );
  }

  getPriorityWeeksMultiUsers(
    idCompany: number | string,
    idEntity: number | string,
    userIds: Array<number | string>
  ): Promise<any> {
    const ids = userIds.map(x => String(x)).filter(Boolean).join(',');
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.priorityWeeksMultiUsers}?id_company=${idCompany}&id_entity=${idEntity}&id_users=${encodeURIComponent(ids)}`
      )
    );
  }

  // ----------- Start Weeks -----------
  createStartWeek(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.startWeeks}`, data));
  }
  getAllStartWeeks(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.startWeeks}`));
  }
  getStartWeekById(id: number | string, id_entity: number | string, team: string): Promise<any> {
    return firstValueFrom(this.http.get(this.withEntityQuery(`${this.baseUrl}${ApiRoutes.startWeeks}?id_company=${id}&team=${team}`)));
  }
  updateStartWeek(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.startWeeks}/${id}`, data));
  }
  deleteStartWeek(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.startWeeks}/${id}`));
  }

  // ----------- Group Control -----------
  createGroupControl(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.groupControl}`, data));
  }
  getAllGroupControls(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.groupControl}`));
  }
  getGroupControlById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.groupControl}?id_company=${id}`));
  }
  updateGroupControl(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.groupControl}/${id}`, data));
  }
  deleteGroupControl(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.groupControl}/${id}`));
  }

  // ----------- Team Viewer -----------
  getEntitiesByCompany(companyId: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerEntities}/${companyId}`));
  }
  getTeamMembersByEntity(userId: number | string, entityId: number | string, companyId: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerTeamMembersByEntity}/${userId}/${entityId}/${companyId}`)
    );
  }
  getTeamMembersByTeam(teamId: number | string, entityId: number | string, companyId: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerTeamMembersByTeam}/${teamId}/${entityId}/${companyId}`)
    );
  }
  getTeamMembersByTeamDashboard(teamId: number | string, entityId: number | string, companyId: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerTeamMembersByTeamDashboard}/${teamId}/${entityId}/${companyId}`)
    );
  }
  getUserById(userId: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerUser}/${userId}`));
  }

  // ----------- Consistent Actions -----------
  createConsistentAction(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.consistentActions}`, data));
  }
  getAllConsistentActions(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.consistentActions}`));
  }
  getConsistentActionById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`));
  }
  updateConsistentAction(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`, data));
  }
  deleteConsistentAction(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`));
  }
}

export const ApiRoutes = {
  priorityWeeks: '/api/priority-weeks',
  priorityWeeksMultiUsers: '/api/priority-weeks/multi-users',
  startWeeks: '/api/start-weeks',
  groupControl: '/api/group-control',
  teamViewerEntities: '/api/team-viewer/entities',
  teamViewerTeamMembersByEntity: '/api/team-viewer/team-members-by-entity',
  teamViewerTeamMembersByTeam: '/api/team-viewer/team-members-by-team',
  teamViewerTeamMembersByTeamDashboard: '/api/team-viewer/team-members-by-team-dashboard',
  teamViewerUser: '/api/team-viewer/user',
  consistentActions: '/api/consistent-actions',
};

