import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const ApiRoutes = {
  formatVisions: '/api/format-visions',
  formatStratas: '/api/format-stratas',
  formatFdt: '/api/format-fdt',
  formatFactorX: '/api/format-factorx',
  formatBrandPromises: '/api/format-brand-promises',
  formatProfitPerX: '/api/format-profit-perx',
  formatCentralClients: '/api/format-central-clients',
  formatGoals: '/api/format-goals',
  formatFlywheel: '/api/format-flywheel',
  formatCoreValues: '/api/format-core-values',
  formatPurposes: '/api/format-purposes',
  formatCompetencies: '/api/format-competencies',
  formatKpiBalances: '/api/format-kpi-balances',
  formatTerritories: '/api/format-territories',
  formatCultures: '/api/format-cultures',
  formatBhag: '/api/format-bhag',
  winGame: '/api/win-game',
  playersA: '/api/players-a',
};

@Injectable({
  providedIn: 'root'
})
export class OpspService {
  private readonly baseUrl = 'https://wvm8wh9w-3000.use2.devtunnels.ms';

  constructor(private http: HttpClient) { }

  // Format BHAG
  getAllBhags(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatBhag}`));
  }

  getBhagByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatBhag}?id_company=${id}`));
  }

  createBhag(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatBhag}`, data));
  }

  updateBhag(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatBhag}/${id}`, data));
  }

  deleteBhag(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatBhag}/${id}`));
  }

  // Format Visions
  getAllVisions(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatVisions}`));
  }

  getVisionByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatVisions}?id_company=${id}`));
  }

  createVision(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatVisions}`, data));
  }

  updateVision(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatVisions}/${id}`, data));
  }

  deleteVision(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatVisions}/${id}`));
  }

  // Format Stratas
  getAllStratas(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatStratas}`));
  }

  getStrataByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatStratas}?id_company=${id}`));
  }

  createStrata(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatStratas}`, data));
  }

  updateStrata(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatStratas}/${id}`, data));
  }

  deleteStrata(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatStratas}/${id}`));
  }

  // Format FDT
  getAllFdt(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFdt}`));
  }

  getFdtByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFdt}?id_company=${id}`));
  }

  createFdt(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatFdt}`, data));
  }

  updateFdt(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatFdt}/${id}`, data));
  }

  deleteFdt(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatFdt}/${id}`));
  }

  // Format Factor X
  getAllFactorX(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFactorX}`));
  }

  getFactorXByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFactorX}?id_company=${id}`));
  }

  createFactorX(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatFactorX}`, data));
  }

  updateFactorX(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatFactorX}/${id}`, data));
  }

  deleteFactorX(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatFactorX}/${id}`));
  }

  // Format Brand Promises
  getAllBrandPromises(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatBrandPromises}`));
  }

  getBrandPromisesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatBrandPromises}?id_company=${id}`));
  }

  createBrandPromise(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatBrandPromises}`, data));
  }

  updateBrandPromise(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatBrandPromises}/${id}`, data));
  }

  deleteBrandPromise(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatBrandPromises}/${id}`));
  }

  // Format Profit Per X
  getAllProfitPerX(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatProfitPerX}`));
  }

  getProfitPerXByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatProfitPerX}?id_company=${id}`));
  }

  createProfitPerX(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatProfitPerX}`, data));
  }

  updateProfitPerX(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatProfitPerX}/${id}`, data));
  }

  deleteProfitPerX(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatProfitPerX}/${id}`));
  }

  // Format Central Clients
  getAllCentralClients(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCentralClients}`));
  }

  getCentralClientsByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCentralClients}?id_company=${id}`));
  }

  createCentralClient(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatCentralClients}`, data));
  }

  updateCentralClient(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatCentralClients}/${id}`, data));
  }

  deleteCentralClient(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatCentralClients}/${id}`));
  }

  // Format Goals
  getAllGoals(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatGoals}`));
  }

  getGoalsByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatGoals}?id_company=${id}`));
  }

  createGoal(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatGoals}`, data));
  }

  updateGoal(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatGoals}/${id}`, data));
  }

  deleteGoal(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatGoals}/${id}`));
  }

  // Format Flywheel
  getAllFlywheels(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFlywheel}`));
  }

  getFlywheelByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatFlywheel}?id_company=${id}`));
  }

  createFlywheel(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatFlywheel}`, data));
  }

  updateFlywheel(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatFlywheel}/${id}`, data));
  }

  deleteFlywheel(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatFlywheel}/${id}`));
  }

  // Format Core Values
  getAllCoreValues(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCoreValues}`));
  }

  getCoreValuesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCoreValues}?id_company=${id}`));
  }

  createCoreValue(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatCoreValues}`, data));
  }

  updateCoreValue(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatCoreValues}/${id}`, data));
  }

  deleteCoreValue(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatCoreValues}/${id}`));
  }

  // Format Purposes
  getAllPurposes(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatPurposes}`));
  }

  getPurposeByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatPurposes}?id_company=${id}`));
  }

  createPurpose(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatPurposes}`, data));
  }

  updatePurpose(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatPurposes}/${id}`, data));
  }

  deletePurpose(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatPurposes}/${id}`));
  }

  // Format Competencies
  getAllCompetencies(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCompetencies}`));
  }

  getCompetenciesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCompetencies}?id_company=${id}`));
  }

  createCompetency(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatCompetencies}`, data));
  }

  updateCompetency(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatCompetencies}/${id}`, data));
  }

  deleteCompetency(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatCompetencies}/${id}`));
  }

  // Format KPI Balances
  getAllKpiBalances(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatKpiBalances}`));
  }

  getKpiBalancesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatKpiBalances}?id_company=${id}`));
  }

  createKpiBalance(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatKpiBalances}`, data));
  }

  updateKpiBalance(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatKpiBalances}/${id}`, data));
  }

  deleteKpiBalance(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatKpiBalances}/${id}`));
  }

  // Format Territories
  getAllTerritories(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatTerritories}`));
  }

  getTerritoriesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatTerritories}?id_company=${id}`));
  }

  createTerritory(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatTerritories}`, data));
  }

  updateTerritory(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatTerritories}/${id}`, data));
  }

  deleteTerritory(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatTerritories}/${id}`));
  }

  // Format Cultures
  getAllCultures(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCultures}`));
  }

  getCulturesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.formatCultures}?id_company=${id}`));
  }

  createCulture(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.formatCultures}`, data));
  }

  updateCulture(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.formatCultures}/${id}`, data));
  }

  deleteCulture(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.formatCultures}/${id}`));
  }

  // Win The Game
  getAllWinGames(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.winGame}`));
  }

  getWinGamesByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.winGame}?id_company=${id}`));
  }

  createWinGame(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.winGame}`, data));
  }

  updateWinGame(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.winGame}/${id}`, data));
  }

  deleteWinGame(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.winGame}/${id}`));
  }

  // Players A
  getAllPlayersA(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.playersA}`));
  }

  getPlayersAByCompany(id: any): Promise<any> {
    return firstValueFrom(this.http.get(`${this.baseUrl}${ApiRoutes.playersA}?id_company=${id}`));
  }

  createPlayerA(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}${ApiRoutes.playersA}`, data));
  }

  updatePlayerA(id: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}${ApiRoutes.playersA}/${id}`, data));
  }

  deletePlayerA(id: any): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}${ApiRoutes.playersA}/${id}`));
  }
}