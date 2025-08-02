import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowupService {
  private readonly baseUrl = 'https://wvm8wh9w-3000.use2.devtunnels.ms';

  constructor(private http: HttpClient) { }

  // ----------- Priority Weeks -----------
  createPriorityWeek(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${ApiRoutes.priorityWeeks}`, data);
  }
  getAllPriorityWeeks(): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.priorityWeeks}`);
  }
  getPriorityWeekById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.priorityWeeks}/${id}`);
  }
  updatePriorityWeek(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${ApiRoutes.priorityWeeks}/${id}`, data);
  }
  deletePriorityWeek(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ApiRoutes.priorityWeeks}/${id}`);
  }
  getPriorityWeeksFiltered(idCompany: number, idEntity: number, team: string, week: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.priorityWeeks}/group/${idCompany}/${idEntity}/${team}/${week}`);
  }

  // ----------- Start Weeks -----------
  createStartWeek(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${ApiRoutes.startWeeks}`, data);
  }
  getAllStartWeeks(): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.startWeeks}`);
  }
  getStartWeekById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.startWeeks}/${id}`);
  }
  updateStartWeek(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${ApiRoutes.startWeeks}/${id}`, data);
  }
  deleteStartWeek(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ApiRoutes.startWeeks}/${id}`);
  }

  // ----------- Group Control -----------
  createGroupControl(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${ApiRoutes.groupControl}`, data);
  }
  getAllGroupControls(): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.groupControl}`);
  }
  getGroupControlById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.groupControl}/${id}`);
  }
  updateGroupControl(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${ApiRoutes.groupControl}/${id}`, data);
  }
  deleteGroupControl(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ApiRoutes.groupControl}/${id}`);
  }

  // ----------- Team Viewer -----------
  getEntitiesByCompany(companyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerEntities}/${companyId}`);
  }
  getTeamMembersByEntity(userId: number, entityId: number, companyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerTeamMembersByEntity}/${userId}/${entityId}/${companyId}`);
  }
  getTeamMembersByTeam(teamId: number, entityId: number, companyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerTeamMembersByTeam}/${teamId}/${entityId}/${companyId}`);
  }
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.teamViewerUser}/${userId}`);
  }

  // ----------- Consistent Actions -----------
  createConsistentAction(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${ApiRoutes.consistentActions}`, data);
  }
  getAllConsistentActions(): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.consistentActions}`);
  }
  getConsistentActionById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`);
  }
  updateConsistentAction(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`, data);
  }
  deleteConsistentAction(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ApiRoutes.consistentActions}/${id}`);
  }
}

export const ApiRoutes = {
  priorityWeeks: '/api/priority-weeks',
  startWeeks: '/api/start-weeks',
  groupControl: '/api/group-control',
  teamViewerEntities: '/api/team-viewer/entities',
  teamViewerTeamMembersByEntity: '/api/team-viewer/team-members-by-entity',
  teamViewerTeamMembersByTeam: '/api/team-viewer/team-members-by-team',
  teamViewerUser: '/api/team-viewer/user',
  consistentActions: '/api/consistent-actions',
};