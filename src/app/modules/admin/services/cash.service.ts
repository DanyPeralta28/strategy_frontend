import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const ApiRoutes = {
  cashFormatIel: '/api/cash-format-iel',
  cashFormatOptcash: '/api/cash-format-optcash',
  cashFormatValue: '/api/cash-format-value',
  cashFormatFinances: '/api/cash-format-finances',
};

@Injectable({ providedIn: 'root' })
export class CashService {
  private readonly baseUrl = 'https://l9kpxb5b-3000.use2.devtunnels.ms';

  constructor(private http: HttpClient) {}

  // ========= IEL =========
  createIel(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.cashFormatIel}`, data));
  }
  getAllIelByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatIel}?id_company=${idCompany}`));
  }
  getIelById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatIel}/${id}`));
  }
  updateIel(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.cashFormatIel}/${id}`, data));
  }
  deleteIel(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.cashFormatIel}/${id}`));
  }

  // ========= Optcash =========
  createOptcash(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.cashFormatOptcash}`, data));
  }
  getAllOptcashByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatOptcash}?id_company=${idCompany}`));
  }
  getOptcashById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatOptcash}/${id}`));
  }
  updateOptcash(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.cashFormatOptcash}/${id}`, data));
  }
  deleteOptcash(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.cashFormatOptcash}/${id}`));
  }

  // ========= Value =========
  createValue(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.cashFormatValue}`, data));
  }
  getAllValueByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatValue}?id_company=${idCompany}`));
  }
  getValueById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatValue}/${id}`));
  }
  updateValue(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.cashFormatValue}/${id}`, data));
  }
  deleteValue(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.cashFormatValue}/${id}`));
  }

  // ========= Finances =========
  createFinances(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.cashFormatFinances}`, data));
  }
  getAllFinancesByCompany(idCompany: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatFinances}?id_company=${idCompany}`));
  }
  getFinancesById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.cashFormatFinances}/${id}`));
  }
  updateFinances(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.cashFormatFinances}/${id}`, data));
  }
  deleteFinances(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.cashFormatFinances}/${id}`));
  }
}
