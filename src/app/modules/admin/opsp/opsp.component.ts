import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../services/opsp.service';
import { environment } from 'environments/environment';

type Semaforo = 'excelente' | 'riesgo' | 'problemas' | '';
interface KpiItemUI {
    nombre: string;
    resultado: string;
    color: Semaforo;
}

interface CategoriaUI {
    nombre: string;
    kpis: KpiItemUI[];
}

interface CampoMeta {
    titulo: string;
    value: string;
}

type JuegoColor = 'verdeOscuro' | 'verde' | 'amarillo' | 'rojo';
interface JuegoItem { color: JuegoColor; descripcion: string; }

@Component({
    selector: 'opsp',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './opsp.component.html',
    styleUrls: ['./opsp.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class OpspComponent {
    id_company = environment.defaultCompanyId;
    balanceCategorias: CategoriaUI[] = [];
    valores: string[] = [];
    proposito: string = '';
    territorios: string[] = [];
    accionesConsistentes: string[] = [];
    savingAcciones = false;
    consistentActionsId: number | null = null;
    metasPlazoCampos: CampoMeta[] = [];
    metasAnualesCampos: CampoMeta[] = [];
    metaTrimestreCampos: CampoMeta[] = [];
    trimestreEtiqueta = '';
    metasTrimestrales = [
        {
            trimestre: 'Q1 2025',
        },
        {
            trimestre: 'Q2 2025',
        },
        {
            trimestre: 'Q3 2025',
        },
        {
            trimestre: 'Q4 2025',
        }
    ];
    metaTrimestreVigente = this.metasTrimestrales[0];
    trimestreVigente: string = this.metaTrimestreVigente?.trimestre || '';
    prioridadesPlazo: string[] = []; // 3–5 años
    prioridadesAnuales: { descripcion: string; quien: string }[] = [];
    prioridadesTrimestrales: { descripcion: string; quien: string }[] = [];
    trimestreTitulo = 'Trimestrales'; // solo título visual
    ganarJuego1 = [
        { color: 'verdeOscuro', descripcion: '' },
        { color: 'verde', descripcion: '' },
        { color: 'amarillo', descripcion: '' },
        { color: 'rojo', descripcion: '' }
    ];

    ganarJuego2 = [
        { color: 'verdeOscuro', descripcion: '' },
        { color: 'verde', descripcion: '' },
        { color: 'amarillo', descripcion: '' },
        { color: 'rojo', descripcion: '' }
    ];
    competenciasClave: string[] = [];
    utilidadX: string = '';
    promesasMarca: string = '';
    flywheel: string[] = [];
    factorX: string[] = [];
    estrategiaFrase: string = '';
    palabrasPropias: string = '';
    bhag: string = '';
    jugadoresA: string = '';
    jugadoresAId: number | null = null;
    fdtFortalezas: string[] = [];
    fdtDebilidades: string[] = [];
    fdtTendencias: string[] = [];
    juego = {
        fechaLimite: '',   // yyyy-MM-dd
        equipo: '',
        reglas: '',
        tablero: '',
        celebracion: '',
        premio: '',
    };
    private existingWinGameId: number | null = null;
    savingJuego = false;

    entidades: string[] = ['Empresa A', 'Empresa B', 'Empresa C'];
    equipos: string[] = ['Ventas', 'Finanzas', 'Operaciones'];
    // Filtro
    usuarios = [
        { id: 1, name: 'Carlos', checked: false },
        { id: 2, name: 'Lucía', checked: false },
        { id: 3, name: 'Andrés', checked: false },
        { id: 4, name: 'María', checked: false }
    ];

    userData = [
        {
            userId: 1,
            kpis: [
                { description: 'Ventas Q2', sv: 100, v: 90, r: 80 }
            ],
            priorities: [
                { name: 'Finalizar campaña', when: '2025-08-25' }
            ],
            ganarJuego: {
                kpis: { critical: '500', sv: '600', v: '550', a: '500', r: '450', result: '540', color: '#66CC66' },
                priorities: { critical: '3 proyectos', sv: '4', v: '3', a: '2', r: '1', result: '3', color: '#66CC66' }
            }
        },
        {
            userId: 2,
            kpis: [
                { description: 'Satisfacción Cliente', sv: 95, v: 90, r: 85 }
            ],
            priorities: [
                { name: 'Optimizar CRM', when: '2025-09-05' }
            ],
            ganarJuego: {
                kpis: { critical: '90%', sv: '95%', v: '90%', a: '85%', r: '80%', result: '89%', color: '#FFCC00' },
                priorities: { critical: '3 tareas', sv: '5', v: '4', a: '3', r: '2', result: '3', color: '#66CC66' }
            }
        },
        {
            userId: 3,
            kpis: [
                { description: 'Ventas Q2', sv: 100, v: 90, r: 80 }
            ],
            priorities: [
                { name: 'Finalizar campaña', when: '2025-08-25' }
            ],
            ganarJuego: {
                kpis: { critical: '500', sv: '600', v: '550', a: '500', r: '450', result: '540', color: '#66CC66' },
                priorities: { critical: '3 proyectos', sv: '4', v: '3', a: '2', r: '1', result: '3', color: '#66CC66' }
            }
        },
        {
            userId: 4,
            kpis: [
                { description: 'Satisfacción Cliente', sv: 95, v: 90, r: 85 }
            ],
            priorities: [
                { name: 'Optimizar CRM', when: '2025-09-05' }
            ],
            ganarJuego: {
                kpis: { critical: '90%', sv: '95%', v: '90%', a: '85%', r: '80%', result: '89%', color: '#FFCC00' },
                priorities: { critical: '3 tareas', sv: '5', v: '4', a: '3', r: '2', result: '3', color: '#66CC66' }
            }
        }
    ];

    showUserDropdown = false;

    get selectedUsers() {
        return this.usuarios.filter(u => u.checked);
    }

    get selectedUserNames(): string {
        const names = this.selectedUsers.map(u => u.name);
        return names.length ? names.join(', ') : 'Seleccionar usuarios';
    }

    getSelectedUserData(userId: number) {
        return this.userData.find(u => u.userId === userId);
    }

    selectedEntidad: string = '';
    selectedEquipo: string = '';
    selectedUsuario: string = '';

    constructor(private opsp: OpspService) {
    }

    ngOnInit() {
        this.loadKpiBalanceByCompany();
        this.loadValoresByCompany();
        this.loadPropositoByCompany();
        this.loadTerritoriosByCompany();
        this.loadAccionesConsistentes();
        this.loadMetasByCompany();
        this.loadPrioridadesVisionByCompany();
        this.loadCompetenciasClaveByCompany();
        this.loadUtilidadXByCompany();
        this.loadPromesasMarcaByCompany();
        this.loadFlywheelByCompany();
        this.loadFactorXByCompany();
        this.loadEstrategiaFraseByCompany();
        this.loadBhagByCompany();
        this.loadJugadoresAByCompany();
        this.loadFdtFortalezasByCompany();
        this.loadWinGameTrimestralByCompany();
    }

    // KPIS DE BALANCE

    async loadKpiBalanceByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getKpiBalancesByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            // Siempre pintamos todas las categorías; si no hay data, quedan vacías
            this.balanceCategorias = [
                { nombre: 'Empleados', kpis: this.mapBlockToKpis(data?.employee_balance) },
                { nombre: 'Clientes', kpis: this.mapBlockToKpis(data?.customer_balance) },
                { nombre: 'Accionistas', kpis: this.mapBlockToKpis(data?.shareholder_balance) },
                { nombre: 'Entrenamiento', kpis: this.mapBlockToKpis(data?.training_balance) },
                { nombre: 'Ventas/Marketing', kpis: this.mapBlockToKpis(data?.sales_marketing_balance) },
                { nombre: 'Administración', kpis: this.mapBlockToKpis(data?.administration_balance) },
            ];
        } catch (err) {
            console.error('Error cargando KPI Balance:', err);
            // Si falla el fetch, igual mostramos las tarjetas vacías
            this.balanceCategorias = [
                { nombre: 'Empleados', kpis: [] },
                { nombre: 'Clientes', kpis: [] },
                { nombre: 'Accionistas', kpis: [] },
                { nombre: 'Entrenamiento', kpis: [] },
                { nombre: 'Ventas/Marketing', kpis: [] },
                { nombre: 'Administración', kpis: [] },
            ];
        } finally {
            // no-op
        }
    }

    // VALORES

    async loadValoresByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getCoreValuesByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data : [];
            this.valores = data.map((v: any) => v.value_title ?? '');
        } catch (err) {
            console.error('Error cargando Valores Centrales:', err);
            this.valores = [];
        } finally {
        }
    }

    // PROPOSITO

    async loadPropositoByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getPurposeByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data : [];
            this.proposito = data.length > 0 ? data[0].purpose_description ?? '' : '';
        } catch (err) {
            console.error('Error cargando Propósito:', err);
            this.proposito = '';
        } finally {
        }
    }

    // TERRITORIO

    async loadTerritoriosByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getTerritoriesByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data : [];

            if (data.length > 0 && Array.isArray(data[0].geographic_location)) {
                this.territorios = data[0].geographic_location.map((t: any) => t.name ?? '');
            } else {
                this.territorios = [];
            }
        } catch (err) {
            console.error('Error cargando Territorios:', err);
            this.territorios = [];
        } finally {
        }
    }

    // ACCIONES CONSISTENTES

    async loadAccionesConsistentes(): Promise<void> {
        try {
            const resp = await this.opsp.getConsistentActionsByCompany(this.id_company);
            const rows = Array.isArray(resp?.data) ? resp.data : [];

            if (rows.length) {
                const item = rows[0];
                this.consistentActionsId = Number(item.id) || null;
                this.accionesConsistentes = Array.isArray(item.action)
                    ? item.action.map((a: any) => a?.description ?? '')
                    : [];
            } else {
                this.consistentActionsId = null;
                this.accionesConsistentes = [];
            }
        } catch (e) {
            console.error('Error al cargar Acciones consistentes', e);
            this.consistentActionsId = null;
            this.accionesConsistentes = [];
        } finally {
        }
    }

    async saveAccionesConsistentes(): Promise<void> {
        if (this.savingAcciones) return;
        this.savingAcciones = true;

        const payload = {
            id_company: this.id_company,
            action: this.accionesConsistentes
                .map(txt => (txt || '').trim())
                .filter(txt => txt.length > 0)
                .map(desc => ({
                    description: desc,
                    responsible: '',
                    kpi: ''
                })),
            status: 1,
            created_by: environment.defaultCreatedBy,
        };

        try {
            if (this.consistentActionsId != null) {
                await this.opsp.updateConsistentActions(this.consistentActionsId, {
                    action: payload.action,
                    status: 1,
                    created_by: environment.defaultCreatedBy,
                });
            } else {
                const res = await this.opsp.createConsistentActions(payload);
                const newId = Array.isArray(res?.data) ? res.data?.[0]?.id : res?.data?.id;
                this.consistentActionsId = newId ?? this.consistentActionsId;
            }

            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Las acciones consistentes se guardaron correctamente.',
                confirmButtonColor: '#003660'
            });

            await this.loadAccionesConsistentes();
        } catch (e) {
            console.error('Error al guardar Acciones consistentes', e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar las acciones.',
                confirmButtonColor: '#d33'
            });
        } finally {
            this.savingAcciones = false;
        }
    }

    addAccion(): void {
        this.accionesConsistentes.push('');
    }

    removeAccion(i: number): void {
        this.accionesConsistentes.splice(i, 1);
    }

    trackByIndex(index: number): number {
        return index;
    }

    // METAS

    async loadMetasByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getGoalsByCompany(this.id_company);
            const row = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!row) {
                this.metasPlazoCampos = [];
                this.metasAnualesCampos = [];
                this.metaTrimestreCampos = [];
                this.trimestreEtiqueta = '';
                return;
            }

            this.metasPlazoCampos = this.toCampos(row.three_to_five_years);
            this.metasAnualesCampos = this.toCampos(row.one_year);

            const { bloqueTrimestre, etiqueta } = this.pickTrimestreVigente(row);
            this.metaTrimestreCampos = this.toCampos(bloqueTrimestre);
            this.trimestreEtiqueta = etiqueta;
        } catch (e) {
            console.error('Error cargando Metas:', e);
            this.metasPlazoCampos = [];
            this.metasAnualesCampos = [];
            this.metaTrimestreCampos = [];
            this.trimestreEtiqueta = '';
        }
    }

    toCampos(arr: any): CampoMeta[] {
        if (!Array.isArray(arr)) return [];
        return arr.map((x: any) => ({
            titulo: String(x?.titulo ?? '').trim(),
            value: String(x?.value ?? '').trim(),
        }));
    }

    pickTrimestreVigente(row: any): { bloqueTrimestre: any[]; etiqueta: string } {
        const m = new Date().getMonth(); // 0..11
        let q = 1;
        if (m >= 3 && m <= 5) q = 2;
        else if (m >= 6 && m <= 8) q = 3;
        else if (m >= 9) q = 4;

        const etiqueta = `Q${q} ${new Date().getFullYear()}`;
        const bloqueTrimestre =
            q === 1 ? row?.trimester_one :
                q === 2 ? row?.trimester_two :
                    q === 3 ? row?.trimester_three :
                        row?.trimester_four;

        return { bloqueTrimestre: Array.isArray(bloqueTrimestre) ? bloqueTrimestre : [], etiqueta };
    }

    // PRIORIDADES

    async loadPrioridadesVisionByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getVisionByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            // sin registro => dejar todo vacío
            if (!data) {
                this.prioridadesPlazo = [];
                this.prioridadesAnuales = [];
                this.prioridadesTrimestrales = [];
                return;
            }

            // 3–5 años
            this.prioridadesPlazo = Array.isArray(data.strategic_priorities_3_to_5_years)
                ? data.strategic_priorities_3_to_5_years
                    .map((x: any) => (x?.value ?? '').toString().trim())
                    .filter(Boolean)
                : [];

            // Anuales (value = descripción, titulo = responsable)
            this.prioridadesAnuales = Array.isArray(data.strategic_priorities_1_year)
                ? data.strategic_priorities_1_year.map((x: any) => ({
                    descripcion: (x?.value ?? '').toString().trim(),
                    quien: (x?.titulo ?? '').toString().trim(),
                })).filter(p => p.descripcion)
                : [];

            // Trimestrales (se enlistan TODAS)
            this.prioridadesTrimestrales = Array.isArray(data.priority_list)
                ? data.priority_list.map((p: any) => ({
                    descripcion: (p?.prioridad ?? '').toString().trim(),
                    quien: (p?.who ?? '').toString().trim(),
                })).filter(p => p.descripcion)
                : [];

            this.ganarJuego1.forEach(element => {
                if (element.color === "verdeOscuro") element.descripcion = data.game_green_1;
                if (element.color === "verde") element.descripcion = data.game_lemon_1;
                if (element.color === "amarillo") element.descripcion = data.game_yellow_1;
                if (element.color === "rojo") element.descripcion = data.game_red_1;
            });

            this.ganarJuego2.forEach(element => {
                if (element.color === "verdeOscuro") element.descripcion = data.game_green_2;
                if (element.color === "verde") element.descripcion = data.game_lemon_2;
                if (element.color === "amarillo") element.descripcion = data.game_yellow_2;
                if (element.color === "rojo") element.descripcion = data.game_red_2;
            });

        } catch (err) {
            console.error('Error cargando Prioridades (visions):', err);
            this.prioridadesPlazo = [];
            this.prioridadesAnuales = [];
            this.prioridadesTrimestrales = [];
        }
    }

    // GANAR EL JUEGO

    getPlaceholder(color: string): string {
        switch (color) {
            case 'verdeOscuro': return 'Excelente (verde oscuro)';
            case 'verde': return 'Bien (verde claro)';
            case 'amarillo': return 'Entre verde y rojo';
            case 'rojo': return 'En problemas (rojo)';
            default: return '';
        }
    }

    private mapColorToUI(c?: string): Semaforo {
        const v = (c || '').toLowerCase();
        if (v.includes('green')) return 'excelente';
        if (v.includes('yellow')) return 'riesgo';
        if (v.includes('red')) return 'problemas';
        return '';
    }

    private mapBlockToKpis(block: any[] | undefined): KpiItemUI[] {
        if (!Array.isArray(block)) return [];
        return block.map(it => ({
            nombre: String(it?.kpi ?? ''),
            resultado: String(it?.result ?? ''),
            color: this.mapColorToUI(it?.color),
        }));
    }

    // COMPETENCIAS CLAVE

    async loadCompetenciasClaveByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getCompetenciesByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!data) {
                this.competenciasClave = [];
                return;
            }

            this.competenciasClave = Array.isArray(data.competencies_list)
                ? data.competencies_list
                    .map((c: any) => (c?.name ?? '').toString().trim())
                    .filter(Boolean)
                : [];

        } catch (err) {
            console.error('Error cargando Competencias Clave:', err);
            this.competenciasClave = [];
        }
    }

    // UTILIDAD POR X

    async loadUtilidadXByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getProfitPerXByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!data) {
                this.utilidadX = '';
                return;
            }

            this.utilidadX = (data.profit_per_x_definition ?? '').toString().trim();

        } catch (err) {
            console.error('Error cargando Utilidad / X:', err);
            this.utilidadX = '';
        }
    }

    // PROMESA DE MARCA

    async loadPromesasMarcaByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getBrandPromiseByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!data) {
                this.promesasMarca = '';
                return;
            }

            const promesas = [
                data.primary_promise,
                data.secondary_promise,
                data.tertiary_promise
            ].filter(p => !!p && p.toString().trim() !== '');

            this.promesasMarca = promesas.join(', ');

        } catch (err) {
            console.error('Error cargando Promesas de Marca:', err);
            this.promesasMarca = '';
        }
    }

    // FLYWHEEL

    async loadFlywheelByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getFlywheelByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data : [];

            this.flywheel = data
                .sort((a: any, b: any) => (a?.order_item ?? 0) - (b?.order_item ?? 0))
                .map((x: any) => (x?.kpi_description ?? '').toString().trim())
                .filter(Boolean);

        } catch (e) {
            console.error('Error cargando Flywheel:', e);
            this.flywheel = [];
        }
    }

    // FACTOR X

    async loadFactorXByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getFactorXByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data : [];

            const acciones = data.flatMap((d: any) =>
                Array.isArray(d?.trade_action_list) ? d.trade_action_list : []
            );

            this.factorX = acciones
                .map(a => (a?.name ?? '').toString().trim())
                .filter(Boolean);
        } catch (err) {
            console.error('Error cargando Factor X:', err);
            this.factorX = [];
        }
    }

    // ESTRATEGIA UNA FRASE

    async loadEstrategiaFraseByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getStrataByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            this.estrategiaFrase = data?.strategy_one_liner?.toString().trim() || '';
            this.palabrasPropias = data?.own_words?.toString().trim() || '';
        } catch (err) {
            console.error('Error cargando Estrategia en una Frase:', err);
            this.estrategiaFrase = '';
        }
    }

    // BHAG

    async loadBhagByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getBhagByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            this.bhag = data?.description?.toString().trim() || '';
        } catch (err) {
            console.error('Error cargando BHAG®:', err);
            this.bhag = '';
        }
    }

    // PLAYER A

    async loadJugadoresAByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getPlayersAByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (data) {
                this.jugadoresA = data.reward || '';
                this.jugadoresAId = data.id;
            } else {
                this.jugadoresA = '';
                this.jugadoresAId = null;
            }
        } catch (err) {
            console.error('Error cargando Jugadores A:', err);
            this.jugadoresA = '';
            this.jugadoresAId = null;
        }
    }

    async saveJugadoresA(): Promise<void> {
        if (!this.jugadoresA.trim()) {
            Swal.fire('Atención', 'Debes ingresar un valor para Jugadores A.', 'warning');
            return;
        }

        try {
            if (this.jugadoresAId) {
                // UPDATE
                await this.opsp.updatePlayerA(this.jugadoresAId, {
                    reward: this.jugadoresA,
                    status: 1,
                    created_by: environment.defaultCreatedBy,
                });
                Swal.fire('Éxito', 'Jugadores A actualizado correctamente', 'success');
            } else {
                // CREATE
                const resp = await this.opsp.createPlayerA({
                    id_company: this.id_company,
                    reward: this.jugadoresA,
                    status: 1,
                    created_by: environment.defaultCreatedBy,
                });
                this.jugadoresAId = resp?.data?.id ?? null;
                Swal.fire('Éxito', 'Jugadores A creado correctamente', 'success');
            }
        } catch (err) {
            console.error('Error guardando Jugadores A:', err);
            Swal.fire('Error', 'No se pudo guardar Jugadores A.', 'error');
        }
    }

    // FDT

    async loadFdtFortalezasByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getFdtByCompany(this.id_company);
            const data = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!data) {
                this.fdtFortalezas = [];
                return;
            }

            const coreStrengths = Array.isArray(data.core_strengths) ? data.core_strengths : [];
            const coreWeaknesses = Array.isArray(data.core_strengths) ? data.core_weaknesses : [];
            const globalTrendsImpact = Array.isArray(data.core_strengths) ? data.global_trends_impact : [];

            this.fdtFortalezas = coreStrengths
                .map((x: any) => (x?.strength ?? '').toString().trim())
                .filter(Boolean);

            this.fdtDebilidades = coreWeaknesses
                .map((x: any) => (x?.weakness ?? '').toString().trim())
                .filter(Boolean);

            this.fdtTendencias = globalTrendsImpact
                .map((x: any) => (x?.trend ?? '').toString().trim())
                .filter(Boolean);
        } catch (err) {
            console.error('Error cargando Fortalezas (FDT):', err);
            this.fdtFortalezas = [];
        }
    }

    // GANAR EL JUEGO

    async loadWinGameTrimestralByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getWinGamesByCompany(this.id_company);
            const row = Array.isArray(resp?.data) ? resp.data[0] : null;

            if (!row) {
                this.existingWinGameId = null;
                this.juego = { fechaLimite: '', equipo: '', reglas: '', tablero: '', celebracion: '', premio: '' };
                return;
            }

            this.existingWinGameId = Number(row.id);

            this.juego.fechaLimite = row.deadline ?? '';
            this.juego.equipo = row.team ?? '';
            this.juego.reglas = row.game_rules ?? '';
            this.juego.tablero = row.scoreboard ?? '';
            this.juego.celebracion = row.celebration_plan ?? '';
            this.juego.premio = row.reward ?? '';
        } catch (e) {
            console.error('Error cargando Win Game (Trimestral):', e);
            this.existingWinGameId = null;
        }
    }

    async saveWinGameTrimestral(): Promise<void> {
        if (!this.juego.fechaLimite || !this.juego.equipo) {
            Swal.fire('Completa los campos', 'Fecha límite y Equipo son obligatorios.', 'warning');
            return;
        }

        const payload = {
            deadline: this.juego.fechaLimite,
            team: this.juego.equipo,
            game_rules: this.juego.reglas,
            scoreboard: this.juego.tablero,
            celebration_plan: this.juego.celebracion,
            reward: this.juego.premio,
            status: 1,
            created_by: environment.defaultCreatedBy,
        };

        this.savingJuego = true;
        try {
            if (this.existingWinGameId == null) {
                // POST
                await this.opsp.createWinGame({
                    id_company: this.id_company,
                    ...payload,
                });
                Swal.fire('¡Guardado!', 'El juego trimestral fue creado.', 'success');
            } else {
                // PUT
                await this.opsp.updateWinGame(this.existingWinGameId, payload);
                Swal.fire('¡Actualizado!', 'El juego trimestral fue actualizado.', 'success');
            }
        } catch (e) {
            console.error('Error guardando Win Game (Trimestral):', e);
            Swal.fire('Error', 'No se pudo guardar la información.', 'error');
        } finally {
            this.savingJuego = false;
        }
    }
}


