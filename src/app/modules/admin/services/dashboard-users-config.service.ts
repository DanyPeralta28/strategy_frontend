import { Injectable } from '@angular/core';

export interface DashboardUserConfig {
  color?: string;
  hidden?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardUsersConfigService {
  private readonly storageKey = 'opsp_dashboard_users_config_v1';

  getAll(): Record<string, DashboardUserConfig> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  getByUserId(userId: number | string): DashboardUserConfig {
    const all = this.getAll();
    return all[String(userId)] || {};
  }

  setColor(userId: number | string, color: string): void {
    const all = this.getAll();
    const key = String(userId);
    all[key] = { ...(all[key] || {}), color, hidden: false };
    this.save(all);
  }

  hideUser(userId: number | string): void {
    const all = this.getAll();
    const key = String(userId);
    all[key] = { ...(all[key] || {}), hidden: true };
    this.save(all);
  }

  private save(value: Record<string, DashboardUserConfig>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }
}

