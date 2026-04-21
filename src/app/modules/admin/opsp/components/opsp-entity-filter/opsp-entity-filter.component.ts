import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FollowupService } from 'app/modules/admin/services/followup.service';
import { OpspEntityContextService } from 'app/modules/admin/services/opsp-entity-context.service';
import { getSessionCompanyId, getSessionLevelUser } from 'app/core/auth/auth-session';

interface OpspEntityOption {
  id: number | string;
  name: string;
}

@Component({
  selector: 'app-opsp-entity-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opsp-entity-filter.component.html',
})
export class OpspEntityFilterComponent {
  readonly idCompany = getSessionCompanyId();
  entidades: OpspEntityOption[] = [];
  selectedEntidad: number | string | null = null;

  constructor(
    private readonly followupService: FollowupService,
    private readonly opspEntityContextService: OpspEntityContextService
  ) {}

  get isAdmin(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  async ngOnInit(): Promise<void> {
    if (!this.isAdmin) {
      return;
    }

    this.selectedEntidad = this.opspEntityContextService.getCurrentEntityId();

    try {
      const response = await this.followupService.getEntitiesByCompany(this.idCompany);
      const rows = Array.isArray(response?.data) ? response.data : [];
      this.entidades = rows
        .map((item: any) => ({
          id: item?.id_entity ?? item?.id ?? item?.value,
          name: item?.name_entity ?? item?.name ?? item?.label ?? item?.id_entity,
        }))
        .filter((item: OpspEntityOption) => item.id != null && item.name != null);

      if (!this.entidades.some((item) => String(item.id) === String(this.selectedEntidad))) {
        this.selectedEntidad = this.entidades[0]?.id ?? this.selectedEntidad;
        this.opspEntityContextService.setSelectedEntityId(this.selectedEntidad);
      }
    } catch (error) {
      console.error('Error cargando entidades OPSP:', error);
    }
  }

  onEntidadChange(): void {
    this.opspEntityContextService.setSelectedEntityId(this.selectedEntidad);
  }
}
