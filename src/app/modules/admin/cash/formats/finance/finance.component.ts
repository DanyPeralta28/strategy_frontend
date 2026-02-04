import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CashService } from '../../../services/cash.service'; // <-- ajusta la ruta
import { environment } from 'environments/environment';

interface FundingItem {
  title: string;
  checks: string[];
  selected: boolean[];
  score: number | null;
}

interface FinancingAttribute {
  descripcion: string;
  lider: string;
  trimestre: string;
}

@Component({
  selector: 'app-finance',
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent implements OnInit {
  // Contexto (ajusta según tu app)
  id_company = environment.defaultCompanyId;
  created_by = environment.defaultCreatedBy;

  fundingItems: FundingItem[] = [
    {
      title: 'Equipo Ejecutivo',
      checks: ['Historial de éxito', 'Experiencia relevante', 'Aprendizaje continuo'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Modelo de Negocio',
      checks: ['Ingresos recurrentes', 'Ventaja competitiva identificada', 'Crecimiento del Mercado y base de clientes'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Valores Fundamentales y Plan Operativo',
      checks: ['Propósito/Visión/Valores', 'Plan Estratégico en Una Página', '“Checklist” del Dominio de los Hábitos de Rockefeller'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Experiencia en el campo específico (Industria y Nicho)',
      checks: ['Panorama competitivo', 'Liderazgo industrial'],
      selected: [false, false],
      score: null
    },
    {
      title: 'Estrategia de Salida y Plan',
      checks: ['Adquisiciones potenciales identificadas', 'Valoraciones y factores multiplicadores investigados'],
      selected: [false, false],
      score: null
    },
    {
      title: 'Mantener su “Casa” en Orden',
      checks: ['Estructura de capitalización clara y documentada', 'Mantenimiento de registros y acuerdos', 'Estados de resultados depurados y verificados'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Ejecución Consistente del Plan de Crecimiento',
      checks: ['Resultados trimestrales predecibles', 'Incremento de ingresos y ganancias', 'Utilidades o beneficios trimestre tras trimestre'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Proteger los Activos del Negocio',
      checks: ['Derechos sobre patentes, marcas registradas, y derechos de autor', 'Reconocimiento del Liderazgo de pensamiento', 'Producto o servicio únicos'],
      selected: [false, false, false],
      score: null
    }
  ];

  attributes: FinancingAttribute[] = [{ descripcion: '', lider: '', trimestre: '' }];

  private existingFinancesId: number | null = null;
  loading = false;

  constructor(private cashService: CashService) { }

  async ngOnInit(): Promise<void> {
    await this.loadFinances();
  }

  private async loadFinances(): Promise<void> {
    this.loading = true;
    try {
      const resp = await this.cashService.getAllFinancesByCompany(this.id_company);
      const row = resp?.data?.[0];
      if (!row) return;

      this.existingFinancesId = row.id;

      // ---- SIEMPRE partimos de los 8 defaults
      const defaults = this.getDefaultFundingItems();

      if (Array.isArray(row.evaluations_list) && row.evaluations_list.length) {
        // Mezclamos cada posición con el default correspondiente
        this.fundingItems = defaults.map((def, idx) => {
          const src = row.evaluations_list[idx] || {};
          const checks = Array.isArray(src.checks) && src.checks.length
            ? src.checks.map((c: any) => String(c ?? ''))
            : def.checks;

          // selected del backend (si existe) o array de falsos del tamaño de checks
          const selected = Array.isArray(src.selected)
            ? checks.map((_, i) => !!src.selected[i])
            : checks.map(() => false);

          const score = Number.isFinite(Number(src.score)) ? Number(src.score) : null;

          return {
            title: String(src.title ?? def.title),
            checks,
            selected,
            score,
          } as FundingItem;
        });
      } else {
        // Si no viene nada, deja los defaults completos
        this.fundingItems = defaults;
      }

      // attributes: deja al menos 1 fila vacía
      if (Array.isArray(row.attributes_list) && row.attributes_list.length) {
        this.attributes = row.attributes_list.map((a: any) => ({
          descripcion: String(a?.descripcion ?? ''),
          lider: String(a?.lider ?? ''),
          trimestre: String(a?.trimestre ?? '')
        }));
      }
      if (!this.attributes.length) {
        this.attributes = [{ descripcion: '', lider: '', trimestre: '' }];
      }
    } catch (err) {
      console.error('Error cargando Financiamiento:', err);
    } finally {
      this.loading = false;
    }
  }

  // Devuelve SIEMPRE los 8 ítems por defecto
  private getDefaultFundingItems(): FundingItem[] {
    return [
      {
        title: 'Equipo Ejecutivo',
        checks: ['Historial de éxito', 'Experiencia relevante', 'Aprendizaje continuo'],
        selected: [false, false, false],
        score: null
      },
      {
        title: 'Modelo de Negocio',
        checks: ['Ingresos recurrentes', 'Ventaja competitiva identificada', 'Crecimiento del Mercado y base de clientes'],
        selected: [false, false, false],
        score: null
      },
      {
        title: 'Valores Fundamentales y Plan Operativo',
        checks: ['Propósito/Visión/Valores', 'Plan Estratégico en Una Página', '“Checklist” del Dominio de los Hábitos de Rockefeller'],
        selected: [false, false, false],
        score: null
      },
      {
        title: 'Experiencia en el campo específico (Industria y Nicho)',
        checks: ['Panorama competitivo', 'Liderazgo industrial'],
        selected: [false, false],
        score: null
      },
      {
        title: 'Estrategia de Salida y Plan',
        checks: ['Adquisiciones potenciales identificadas', 'Valoraciones y factores multiplicadores investigados'],
        selected: [false, false],
        score: null
      },
      {
        title: 'Mantener su “Casa” en Orden',
        checks: ['Estructura de capitalización clara y documentada', 'Mantenimiento de registros y acuerdos', 'Estados de resultados depurados y verificados'],
        selected: [false, false, false],
        score: null
      },
      {
        title: 'Ejecución Consistente del Plan de Crecimiento',
        checks: ['Resultados trimestrales predecibles', 'Incremento de ingresos y ganancias', 'Utilidades o beneficios trimestre tras trimestre'],
        selected: [false, false, false],
        score: null
      },
      {
        title: 'Proteger los Activos del Negocio',
        checks: ['Derechos sobre patentes, marcas registradas, y derechos de autor', 'Reconocimiento del Liderazgo de pensamiento', 'Producto o servicio únicos'],
        selected: [false, false, false],
        score: null
      }
    ];
  }

  addAttribute() {
    this.attributes.push({ descripcion: '', lider: '', trimestre: '' });
  }

  removeAttribute(index: number) {
    if (this.attributes.length > 1) {
      this.attributes.splice(index, 1);
    }
  }

  // ===== Guardar (POST/PUT) con SweetAlert2 =====
  async save(): Promise<void> {
    // Validaciones básicas (opcionales, puedes quitar si no las querés)
    const atributosIncompletos = this.attributes.some(a => !a.descripcion?.trim() || !a.lider?.trim() || !a.trimestre);
    const puntajesInvalidos = this.fundingItems.some(it => it.score === null || it.score < 1 || it.score > 10);
    if (atributosIncompletos || puntajesInvalidos) {
      await Swal.fire({
        icon: 'warning',
        title: 'Campos inválidos',
        text: atributosIncompletos
          ? 'Completa descripción, líder y trimestre en cada atributo.'
          : 'El puntaje debe ser un número entre 1 y 10.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const evaluations_list = this.fundingItems.map(it => ({
      title: it.title,
      checks: it.checks,
      selected: it.selected,
      score: it.score
    }));

    const attributes_list = this.attributes.map(a => ({
      descripcion: a.descripcion,
      lider: a.lider,
      trimestre: a.trimestre
    }));

    const createDto = {
      id_company: this.id_company,
      evaluations_list,
      attributes_list,
      status: 1,
      created_by: this.created_by
    };

    const updateDto = {
      evaluations_list,
      attributes_list,
      status: 1,
      created_by: this.created_by
    };

    this.loading = true;
    try {
      if (this.existingFinancesId != null) {
        await this.cashService.updateFinances(this.existingFinancesId, updateDto);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El formato Financiamiento se actualizó correctamente.',
          confirmButtonColor: '#003660'
        });
      } else {
        const res = await this.cashService.createFinances(createDto);
        const newId = res?.data?.id ?? res?.id;
        if (newId != null) this.existingFinancesId = Number(newId);

        await Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El formato Financiamiento se guardó correctamente.',
          confirmButtonColor: '#003660'
        });
      }

      console.log('Financiamiento guardado correctamente');
    } catch (err) {
      console.error('Error guardando Financiamiento:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el formato. Intenta nuevamente.',
        confirmButtonColor: '#003660'
      });
    } finally {
      this.loading = false;
    }
  }
}



