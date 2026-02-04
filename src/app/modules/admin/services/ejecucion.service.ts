import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';

export const ApiRoutes = {
  // Face
  formatFace: '/api/format-face',
  formatFaceVisible: '/api/format-face/visible',

  // Pace
  formatPace: '/api/format-pace',

  // WWW
  formatWww: '/api/format-www',
  formatWwwVisible: '/api/format-www/visible',

  // Execution surveys
  surveyAnswers: '/api/execution/survey-answers',
  surveyCampaign: '/api/execution/survey-campaign',
  surveyCampaignActiveByUser: '/api/execution/survey-campaign/active/by-user',
};

@Injectable({ providedIn: 'root' })
export class EjecucionService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ---------------- Face ----------------
  createFace(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.formatFace}`, data)
    );
  }

  getFaceVisible(params: {
    id_company: string;
    requester_user_id: string;
    id_entity?: string;
  }): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatFaceVisible}`, {
        params,
      })
    );
  }

  getFaceById(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatFace}/${id}`)
    );
  }

  updateFace(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}${ApiRoutes.formatFace}/${id}`, data)
    );
  }

  deleteFace(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}${ApiRoutes.formatFace}/${id}`)
    );
  }

  // ---------------- Pace ----------------
  createPace(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.formatPace}`, data)
    );
  }

  getPaceVisible(params: {
    id_company: string;
    requester_user_id: string;
    id_entity?: string;
  }): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatPace}`, { params })
    );
  }

  getPaceById(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatPace}/${id}`)
    );
  }

  updatePace(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}${ApiRoutes.formatPace}/${id}`, data)
    );
  }

  deletePace(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}${ApiRoutes.formatPace}/${id}`)
    );
  }

  // ---------------- WWW ----------------
  createWww(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.formatWww}`, data)
    );
  }

  getWwwByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.formatWww}?id_company=${idCompany}`
      )
    );
  }

  getWwwVisible(params: {
    id_company: string;
    requester_user_id: string;
    preset?: string;
    statuses?: string;
    team_scope?: string;
    id_entity?: string;
  }): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatWwwVisible}`, { params })
    );
  }

  getWwwById(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.formatWww}/${id}`)
    );
  }

  updateWww(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}${ApiRoutes.formatWww}/${id}`, data)
    );
  }

  deleteWww(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}${ApiRoutes.formatWww}/${id}`)
    );
  }

  // ---------------- Execution - Survey Answers ----------------
  createSurveyAnswer(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.surveyAnswers}`, data)
    );
  }

  getSurveyAnswersByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.surveyAnswers}?id_company=${idCompany}`
      )
    );
  }

  getSurveyAnswerById(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.surveyAnswers}/${id}`)
    );
  }

  // ---------------- Execution - Survey Campaign ----------------
  createSurveyCampaign(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}${ApiRoutes.surveyCampaign}`, data)
    );
  }

  getSurveyCampaignsByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.surveyCampaign}?id_company=${idCompany}`
      )
    );
  }

  getSurveyCampaignById(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}${ApiRoutes.surveyCampaign}/${id}`)
    );
  }

  updateSurveyCampaign(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}${ApiRoutes.surveyCampaign}/${id}`, data)
    );
  }

  getActiveSurveyCampaignByUser(userId: number | string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}${ApiRoutes.surveyCampaignActiveByUser}?user_id=${userId}`
      )
    );
  }
}
