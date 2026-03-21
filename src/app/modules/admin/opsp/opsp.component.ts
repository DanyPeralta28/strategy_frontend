import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../services/opsp.service';
import { FollowupService } from '../services/followup.service';
import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

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
interface FilterEntityOption { id: number | string; name: string; }
interface FilterTeamOption { id: number | string; name: string; }
interface FilterUserOption {
    id: number | string;
    name: string;
    checked: boolean;
    color?: string;
    status_dashboard?: number;
}
interface OpspDashboardFiltersState {
    entidadId: string | null;
    equipoId: string | null;
    userIds: string[];
}

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
    selector: 'opsp',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
    templateUrl: './opsp.component.html',
    styleUrls: ['./opsp.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class OpspComponent {
    @ViewChild('dashboardPdfContent') dashboardPdfContent?: ElementRef<HTMLElement>;
    @ViewChild('dashboardPdfReportContent') dashboardPdfReportContent?: ElementRef<HTMLElement>;
    id_company = getSessionCompanyId();
    balanceCategorias: CategoriaUI[] = [];
    valores: string[] = [];
    proposito: string = '';
    centralClientSummary: string = '';
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
    prioridadesTrimestrales: {
        descripcion: string;
        quien: string;
        plazo: string;
        esOKR: boolean;
        esIndividual: boolean | null;
        subprioridades: string[];
    }[] = [];
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

    entidades: FilterEntityOption[] = [];
    equipos: FilterTeamOption[] = [];
    // Filtro
    usuarios: FilterUserOption[] = [];

    userData: any[] = [];

    showUserDropdown = false;
    showOtrosMenu = false;
    currentUserSlideIndex = 0;
    otrosVisibility = {
        centralClient: true,
        vision: true,
        strata: true,
    };

    get selectedUsers() {
        return this.usuarios.filter(u => u.checked);
    }

    get activeSelectedUser(): FilterUserOption | null {
        const users = this.selectedUsers;
        if (!users.length) return null;
        const index = Math.min(this.currentUserSlideIndex, users.length - 1);
        return users[index] ?? null;
    }

    get selectedUserNames(): string {
        const names = this.selectedUsers.map(u => u.name);
        return names.length ? names.join(', ') : 'Seleccionar usuarios';
    }

    get selectedEntityName(): string {
        const found = this.entidades.find(e => String(e.id) === String(this.selectedEntidad));
        return found?.name || String(this.selectedEntidad ?? '');
    }

    get selectedTeamName(): string {
        const found = this.equipos.find(e => String(e.id) === String(this.selectedEquipo) || String(e.name) === String(this.selectedEquipo));
        return found?.name || String(this.selectedEquipo ?? '');
    }

    getSelectedUserData(userId: number | string, selectedIndex?: number) {
        const byId = this.userData.find(u => String(u.userId) === String(userId));
        if (byId) return byId;

        // Fallback temporal por indice para evitar vista vacia si hay desalineacion puntual.
        if (typeof selectedIndex === 'number' && this.userData.length > 0) {
            return this.userData[selectedIndex % this.userData.length];
        }

        return undefined;
    }

    getDashboardUserSectionStyle(userId: number | string): { [key: string]: string } {
        const user = this.usuarios.find((u) => String(u.id) === String(userId));
        return { backgroundColor: user?.color || '#f8fafc' };
    }

    get canGoPrevUserSlide(): boolean {
        return this.currentUserSlideIndex > 0;
    }

    get canGoNextUserSlide(): boolean {
        return this.currentUserSlideIndex < this.selectedUsers.length - 1;
    }

    prevUserSlide(): void {
        if (!this.canGoPrevUserSlide) return;
        this.currentUserSlideIndex--;
    }

    nextUserSlide(): void {
        if (!this.canGoNextUserSlide) return;
        this.currentUserSlideIndex++;
    }

    onUserSelectionChange(): void {
        this.persistDashboardFilters();
        const maxIndex = Math.max(this.selectedUsers.length - 1, 0);
        if (this.currentUserSlideIndex > maxIndex) {
            this.currentUserSlideIndex = maxIndex;
        }
        this.loadMultiUsersDashboardData();
    }

    selectedEntidad: number | string | null = null;
    selectedEquipo: number | string | null = null;
    selectedUsuario: string = '';
    private readonly requesterUserId = getSessionUserId();
    private readonly filtersStorageKey = 'opsp_dashboard_filters_v1';

    constructor(
        private opsp: OpspService,
        private followupService: FollowupService,
        private router: Router
    ) {
    }

    get isAdminTeamUser(): boolean {
        return [2, 3].includes(Number(getSessionLevelUser()));
    }

    goToFormat(link: string): void {
        if (!link) return;
        this.router.navigate(['/opsp/formats', link]);
    }

    exportDashboardToExcel(): void {
        const summaryRows = [
            {
                Compania: this.id_company ?? '',
                Entidad: this.selectedEntityName || '',
                Equipo: this.selectedTeamName || '',
                Usuarios: this.selectedUsers.map(u => u.name).join(', ') || '',
                BHAG: this.bhag || '',
                Proposito: this.proposito || '',
                'Cliente central': this.centralClientSummary || '',
                Territorios: this.territorios.join(' | ') || '',
                Valores: this.valores.join(' | ') || '',
            }
        ];

        const balanceRows = this.balanceCategorias.flatMap(cat =>
            (cat.kpis || []).map(kpi => ({
                Categoria: cat.nombre || '',
                KPI: kpi.nombre || '',
                Resultado: kpi.resultado || '',
                Estado: this.semaforoToLabel(kpi.color),
            }))
        );

        const prioritiesRows = [
            ...this.prioridadesPlazo.map((p, i) => ({
                Tipo: '3-5 años',
                '#': i + 1,
                Prioridad: p || '',
                Responsable: '',
                Plazo: '',
                OKR: '',
                Alcance: '',
                Subprioridades: '',
            })),
            ...this.prioridadesAnuales.map((p, i) => ({
                Tipo: 'Anual',
                '#': i + 1,
                Prioridad: p.descripcion || '',
                Responsable: p.quien || '',
                Plazo: '',
                OKR: '',
                Alcance: '',
                Subprioridades: '',
            })),
            ...this.prioridadesTrimestrales.map((p, i) => ({
                Tipo: 'Trimestral',
                '#': i + 1,
                Prioridad: p.descripcion || '',
                Responsable: p.quien || '',
                Plazo: p.plazo || '',
                OKR: p.esOKR ? 'Si' : 'No',
                Alcance: p.esIndividual == null ? '' : (p.esIndividual ? 'Individual' : 'Equipo'),
                Subprioridades: Array.isArray(p.subprioridades) ? p.subprioridades.join(' | ') : '',
            })),
            ...this.metaTrimestreCampos.map((m, i) => ({
                Tipo: 'Meta trimestral',
                '#': i + 1,
                Prioridad: m.titulo || '',
                Responsable: '',
                Plazo: this.trimestreVigente || '',
                OKR: '',
                Alcance: '',
                Subprioridades: m.value || '',
            })),
            ...this.metasAnualesCampos.map((m, i) => ({
                Tipo: 'Meta anual',
                '#': i + 1,
                Prioridad: m.titulo || '',
                Responsable: '',
                Plazo: '',
                OKR: '',
                Alcance: '',
                Subprioridades: m.value || '',
            })),
            ...this.metasPlazoCampos.map((m, i) => ({
                Tipo: 'Meta largo plazo',
                '#': i + 1,
                Prioridad: m.titulo || '',
                Responsable: '',
                Plazo: '',
                OKR: '',
                Alcance: '',
                Subprioridades: m.value || '',
            })),
        ];

        const gameRows = [
            ...this.ganarJuego1.map((item, index) => ({
                Grupo: 'Anual',
                Indicador: ['Super Verde', 'Verde', 'Amarillo', 'Rojo'][index] || '',
                Valor: item?.descripcion || '',
                Color: ['Super Verde', 'Verde', 'Amarillo', 'Rojo'][index] || '',
            })),
            ...this.ganarJuego2.map((item, index) => ({
                Grupo: `Trimestre ${this.trimestreVigente || ''}`.trim(),
                Indicador: ['Super Verde', 'Verde', 'Amarillo', 'Rojo'][index] || '',
                Valor: item?.descripcion || '',
                Color: ['Super Verde', 'Verde', 'Amarillo', 'Rojo'][index] || '',
            })),
            {
                Grupo: 'Win Game',
                Indicador: 'Fecha limite',
                Valor: this.juego.fechaLimite || '',
                Color: '',
            },
            {
                Grupo: 'Win Game',
                Indicador: 'Equipo',
                Valor: this.juego.equipo || '',
                Color: '',
            },
            {
                Grupo: 'Win Game',
                Indicador: 'Reglas',
                Valor: this.juego.reglas || '',
                Color: '',
            },
            {
                Grupo: 'Win Game',
                Indicador: 'Tablero',
                Valor: this.juego.tablero || '',
                Color: '',
            },
            {
                Grupo: 'Win Game',
                Indicador: 'Celebracion',
                Valor: this.juego.celebracion || '',
                Color: '',
            },
            {
                Grupo: 'Win Game',
                Indicador: 'Premio',
                Valor: this.juego.premio || '',
                Color: '',
            }
        ];

        const usersKpiRows = this.selectedUsers.flatMap((u) => {
            const data = this.userData.find(x => String(x?.userId) === String(u.id));
            return (Array.isArray(data?.kpis) ? data.kpis : []).map((k: any) => ({
                Usuario: u.name,
                Descripcion: k?.description ?? '',
                SV: k?.sv ?? '',
                V: k?.v ?? '',
                R: k?.r ?? '',
            }));
        });

        const usersPriorityRows = this.selectedUsers.flatMap((u) => {
            const data = this.userData.find(x => String(x?.userId) === String(u.id));
            return (Array.isArray(data?.priorities) ? data.priorities : []).map((p: any, index: number) => ({
                Usuario: u.name,
                '#': index + 1,
                Prioridad: p?.name ?? '',
                Cuando: p?.when ?? '',
            }));
        });

        const usersGameRows = this.selectedUsers.flatMap((u) => {
            const data = this.userData.find(x => String(x?.userId) === String(u.id));
            if (!data) return [];
            return [
                {
                    Usuario: u.name,
                    Grupo: 'KPI',
                    'Numero critico': data?.ganarJuego?.kpis?.critical ?? '',
                    SV: data?.ganarJuego?.kpis?.sv ?? '',
                    V: data?.ganarJuego?.kpis?.v ?? '',
                    A: data?.ganarJuego?.kpis?.a ?? '',
                    R: data?.ganarJuego?.kpis?.r ?? '',
                    Resultado: data?.ganarJuego?.kpis?.result ?? '',
                    Color: data?.ganarJuego?.kpis?.color ?? '',
                },
                {
                    Usuario: u.name,
                    Grupo: 'Prioridades',
                    'Numero critico': data?.ganarJuego?.priorities?.critical ?? '',
                    SV: data?.ganarJuego?.priorities?.sv ?? '',
                    V: data?.ganarJuego?.priorities?.v ?? '',
                    A: data?.ganarJuego?.priorities?.a ?? '',
                    R: data?.ganarJuego?.priorities?.r ?? '',
                    Resultado: data?.ganarJuego?.priorities?.result ?? '',
                    Color: data?.ganarJuego?.priorities?.color ?? '',
                }
            ];
        });

        void exportSheetsToExcel('opsp_dashboard', [
            { name: 'Resumen', rows: summaryRows },
            { name: 'Balance KPIs', rows: balanceRows },
            { name: 'Prioridades', rows: prioritiesRows },
            { name: 'Ganar el Juego', rows: gameRows },
            { name: 'Usuarios KPIs', rows: usersKpiRows },
            { name: 'Usuarios Prioridades', rows: usersPriorityRows },
            { name: 'Usuarios Juegos', rows: usersGameRows },
        ]);
    }

    exportDashboardToPdf(): void {
        void exportElementToPdf(this.dashboardPdfReportContent?.nativeElement, 'opsp_dashboard');
    }

    private semaforoToLabel(value: Semaforo): string {
        if (value === 'excelente') return 'Super Verde';
        if (value === 'riesgo') return 'Verde';
        if (value === 'problemas') return 'Rojo';
        return '';
    }

    private buildExcelWorkbook(
        sheets: Array<{ name: string; headers: string[]; rows: Array<Array<string | number>> }>
    ): string {
        const workbookOpen =
            `<?xml version="1.0"?>` +
            `<?mso-application progid="Excel.Sheet"?>` +
            `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ` +
            `xmlns:o="urn:schemas-microsoft-com:office:office" ` +
            `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
            `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ` +
            `xmlns:html="http://www.w3.org/TR/REC-html40">` +
            `<Styles>` +
            `<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11"/></Style>` +
            `<Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#003660" ss:Pattern="Solid"/></Style>` +
            `<Style ss:ID="TextWrap"><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>` +
            `</Styles>`;

        const workbookClose = `</Workbook>`;
        const sheetsXml = sheets.map(sheet => this.buildExcelWorksheet(sheet.name, sheet.headers, sheet.rows)).join('');
        return workbookOpen + sheetsXml + workbookClose;
    }

    private buildExcelWorksheet(name: string, headers: string[], rows: Array<Array<string | number>>): string {
        const safeName = this.sanitizeSheetName(name);
        let xml = `<Worksheet ss:Name="${this.escapeXml(safeName)}"><Table>`;

        xml += '<Row>';
        headers.forEach(h => {
            xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${this.escapeXml(h)}</Data></Cell>`;
        });
        xml += '</Row>';

        rows.forEach(row => {
            xml += '<Row>';
            row.forEach(value => {
                const num = typeof value === 'number' ? value : Number(value);
                const isNumeric = typeof value === 'number' || (!Number.isNaN(num) && value !== '' && value !== null);
                const type = isNumeric ? 'Number' : 'String';
                const cellValue = isNumeric ? String(num) : this.escapeXml(String(value ?? ''));
                xml += `<Cell ss:StyleID="TextWrap"><Data ss:Type="${type}">${cellValue}</Data></Cell>`;
            });
            xml += '</Row>';
        });

        xml += '</Table></Worksheet>';
        return xml;
    }

    private sanitizeSheetName(name: string): string {
        const cleaned = (name || 'Sheet')
            .replace(/[\\\/\?\*\[\]:]/g, ' ')
            .trim();
        return cleaned.substring(0, 31) || 'Sheet';
    }

    private escapeXml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private formatDateForFile(date: Date): string {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
    }

    ngOnInit() {
        this.loadKpiBalanceByCompany();
        this.loadValoresByCompany();
        this.loadPropositoByCompany();
        this.loadTerritoriosByCompany();
        this.loadCentralClientByCompany();
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
        if (this.isAdminTeamUser) {
            this.loadEntitiesForFilters();
        }
    }

    toggleOtrosMenu(): void {
        this.showOtrosMenu = !this.showOtrosMenu;
    }

    setOtrosVisibility(key: 'centralClient' | 'vision' | 'strata', value: boolean): void {
        this.otrosVisibility[key] = value;
    }

    async loadEntitiesForFilters(): Promise<void> {
        if (!this.isAdminTeamUser) {
            this.entidades = [];
            this.equipos = [];
            this.usuarios = [];
            return;
        }
        try {
            const resp = await this.followupService.getEntitiesByCompany(this.id_company);
            const rows = Array.isArray(resp?.data) ? resp.data : [];

            this.entidades = rows
                .map((r: any) => {
                    const id = r?.id_entity ?? r?.entity_id ?? r?.id;
                    const name = (r?.name_entity ?? r?.entity_name ?? r?.name ?? r?.entity ?? '').toString().trim();
                    return { id, name };
                })
                .filter((x: any) => x.id != null && !!x.name);

            const saved = this.getSavedFilters();
            if (saved?.entidadId) {
                const savedEntity = this.entidades.find(e => String(e.id) === String(saved.entidadId));
                if (savedEntity) {
                    this.selectedEntidad = savedEntity.id;
                    await this.onEntidadChange(true, saved);
                    return;
                }
            }

            const defaultEntity = this.entidades.find(e => String(e.id) === String(getSessionEntityId()));
            if (defaultEntity) {
                this.selectedEntidad = defaultEntity.id;
                await this.onEntidadChange();
            }
        } catch (err) {
            console.error('Error cargando entidades para OPSP:', err);
            this.entidades = [];
            this.selectedEntidad = null;
            this.equipos = [];
            this.usuarios = [];
        }
    }

    async onEntidadChange(restore = false, saved?: OpspDashboardFiltersState): Promise<void> {
        if (!restore) this.selectedEquipo = null;
        this.equipos = [];
        this.usuarios = [];
        this.userData = [];
        this.showUserDropdown = false;

        if (this.selectedEntidad == null || this.selectedEntidad === '') {
            this.persistDashboardFilters();
            return;
        }

        try {
            const resp = await this.followupService.getTeamMembersByEntity(
                this.requesterUserId,
                this.selectedEntidad,
                this.id_company
            );
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            const teamMap = new Map<string, FilterTeamOption>();

            rows.forEach((r: any) => {
                // backend real: data puede venir como string[]
                if (typeof r === 'string') {
                    const name = r.trim();
                    if (!name) return;
                    if (!teamMap.has(name)) {
                        teamMap.set(name, { id: name, name });
                    }
                    return;
                }

                // fallback por compatibilidad si llega objeto
                const name = (r?.team ?? r?.team_name ?? r?.name ?? '').toString().trim();
                const id = r?.id_team ?? r?.team_id ?? name;
                if (!name) return;
                const key = `${id}`;
                if (!teamMap.has(key)) {
                    teamMap.set(key, { id, name });
                }
            });

            this.equipos = Array.from(teamMap.values());

            if (restore && saved?.equipoId) {
                const savedTeam = this.equipos.find(
                    t => String(t.id) === String(saved.equipoId) || String(t.name) === String(saved.equipoId)
                );
                if (savedTeam) {
                    this.selectedEquipo = savedTeam.name;
                    await this.onEquipoChange(true, saved);
                    return;
                }
            }

            this.persistDashboardFilters();
        } catch (err) {
            console.error('Error cargando equipos por entidad en OPSP:', err);
            this.equipos = [];
            this.persistDashboardFilters();
        }
    }

    async onEquipoChange(restore = false, saved?: OpspDashboardFiltersState): Promise<void> {
        this.usuarios = [];
        this.userData = [];
        this.showUserDropdown = false;

        if (
            this.selectedEntidad == null || this.selectedEntidad === '' ||
            this.selectedEquipo == null || this.selectedEquipo === ''
        ) {
            this.persistDashboardFilters();
            return;
        }

        try {
            const resp = await this.followupService.getTeamMembersByTeamDashboard(
                this.selectedEquipo,
                this.selectedEntidad,
                this.id_company
            );
            const rows = Array.isArray(resp?.data) ? resp.data : [];

            this.usuarios = rows
                .map((u: any) => {
                    const id = u?.id_user ?? u?.user_id ?? u?.id;
                    const first = (u?.firstname ?? '').toString().trim();
                    const last = (u?.lastname ?? '').toString().trim();
                    const fullName = `${first} ${last}`.trim();
                    const name = (
                        fullName ||
                        u?.name ||
                        u?.full_name ||
                        u?.user_name ||
                        u?.username ||
                        ''
                    ).toString().trim();
                    return {
                        id,
                        name,
                        checked: false,
                        color: (u?.color ?? '#f8fafc').toString().trim() || '#f8fafc',
                        status_dashboard: Number(u?.status_dashboard ?? 1),
                    };
                })
                .filter((u: any) => u.id != null && !!u.name);

            this.usuarios = this.usuarios.filter((u) => Number(u.status_dashboard ?? 1) === 1);

            if (restore && saved?.userIds?.length) {
                const selectedIds = new Set(saved.userIds.map(x => String(x)));
                this.usuarios.forEach(u => {
                    u.checked = selectedIds.has(String(u.id));
                });
            }

            this.onUserSelectionChange();
            this.persistDashboardFilters();
        } catch (err) {
            console.error('Error cargando usuarios por equipo en OPSP:', err);
            this.usuarios = [];
            this.userData = [];
            this.onUserSelectionChange();
            this.persistDashboardFilters();
        }
    }

    private gameColorToHex(color?: string): string {
        const c = (color || '').toString().trim().toLowerCase();
        if (c === 'green') return '#006600';
        if (c === 'lemon') return '#66CC66';
        if (c === 'yellow') return '#FFCC00';
        if (c === 'red') return '#CC0000';
        return '#9CA3AF';
    }

    async loadMultiUsersDashboardData(): Promise<void> {
        const userIds = this.selectedUsers.map(u => u.id);
        if (
            this.selectedEntidad == null || this.selectedEntidad === '' ||
            userIds.length === 0
        ) {
            this.userData = [];
            return;
        }

        try {
            const resp = await this.followupService.getPriorityWeeksMultiUsers(
                this.id_company,
                this.selectedEntidad,
                userIds
            );
            const rows = Array.isArray(resp?.data) ? resp.data : [];

            this.userData = rows.map((item: any) => ({
                userId: item?.id_user,
                kpis: (Array.isArray(item?.kpi_list) ? item.kpi_list : []).map((k: any) => ({
                    description: (k?.description ?? '').toString().trim(),
                    sv: (k?.sv ?? '').toString().trim(),
                    v: (k?.v ?? '').toString().trim(),
                    r: (k?.r ?? '').toString().trim(),
                })),
                priorities: [
                    ...(Array.isArray(item?.quarter_priority_list) ? item.quarter_priority_list : []).map((p: any) => ({
                        name: (p?.name ?? '').toString().trim(),
                        when: (p?.when ?? '').toString().trim(),
                    })),
                    ...(Array.isArray(item?.vision_priorities) ? item.vision_priorities : []).map((p: any) => ({
                        name: (p?.name ?? '').toString().trim(),
                        when: (p?.plazo ?? p?.when ?? '').toString().trim(),
                    })),
                ].filter((p: any) => p.name || p.when),
                ganarJuego: {
                    kpis: {
                        critical: (item?.kpi_game?.game_critical_number_kpi ?? '').toString().trim(),
                        sv: (item?.kpi_game?.game_green_kpi ?? '').toString().trim(),
                        v: (item?.kpi_game?.game_lemon_kpi ?? '').toString().trim(),
                        a: (item?.kpi_game?.game_yellow_kpi ?? '').toString().trim(),
                        r: (item?.kpi_game?.game_red_kpi ?? '').toString().trim(),
                        result: (item?.kpi_game?.game_result_kpi ?? '').toString().trim(),
                        color: this.gameColorToHex(item?.kpi_game?.game_color_kpi),
                    },
                    priorities: {
                        critical: (item?.priority_game?.game_critical_number_priority ?? '').toString().trim(),
                        sv: (item?.priority_game?.game_green_priority ?? '').toString().trim(),
                        v: (item?.priority_game?.game_lemon_priority ?? '').toString().trim(),
                        a: (item?.priority_game?.game_yellow_priority ?? '').toString().trim(),
                        r: (item?.priority_game?.game_red_priority ?? '').toString().trim(),
                        result: (item?.priority_game?.game_result_priority ?? '').toString().trim(),
                        color: this.gameColorToHex(item?.priority_game?.game_color_priority),
                    }
                }
            }));
        } catch (err) {
            console.error('Error cargando data multi-usuarios en OPSP dashboard:', err);
            this.userData = [];
        }
    }

    persistDashboardFilters(): void {
        try {
            const state: OpspDashboardFiltersState = {
                entidadId: this.selectedEntidad != null && this.selectedEntidad !== '' ? String(this.selectedEntidad) : null,
                equipoId: this.selectedEquipo != null && this.selectedEquipo !== '' ? String(this.selectedEquipo) : null,
                userIds: this.usuarios.filter(u => u.checked).map(u => String(u.id)),
            };
            localStorage.setItem(this.filtersStorageKey, JSON.stringify(state));
        } catch {
            // ignore localStorage errors
        }
    }

    private getSavedFilters(): OpspDashboardFiltersState | null {
        try {
            const raw = localStorage.getItem(this.filtersStorageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            return {
                entidadId: parsed.entidadId != null ? String(parsed.entidadId) : null,
                equipoId: parsed.equipoId != null ? String(parsed.equipoId) : null,
                userIds: Array.isArray(parsed.userIds) ? parsed.userIds.map((x: any) => String(x)) : []
            };
        } catch {
            return null;
        }
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

    async loadCentralClientByCompany(): Promise<void> {
        try {
            const resp = await this.opsp.getCentralClientByCompany(this.id_company);
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            this.centralClientSummary = rows.length > 0
                ? (rows[0]?.core_client_summary ?? '').toString().trim()
                : '';
        } catch (err) {
            console.error('Error cargando Cliente Central:', err);
            this.centralClientSummary = '';
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
            created_by: getSessionUserId(),
        };

        try {
            if (this.consistentActionsId != null) {
                await this.opsp.updateConsistentActions(this.consistentActionsId, {
                    action: payload.action,
                    status: 1,
                    created_by: getSessionUserId(),
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
                    quien: this.resolvePriorityWho(p?.who_name),
                    plazo: (p?.plazo ?? '').toString().trim(),
                    esOKR: Boolean(p?.esOKR),
                    esIndividual: typeof p?.esIndividual === 'boolean' ? p.esIndividual : null,
                    subprioridades: Array.isArray(p?.subprioridades)
                        ? p.subprioridades.map((s: any) => (s ?? '').toString().trim()).filter(Boolean)
                        : [],
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

    private resolvePriorityWho(who: any): string {
        const id = (who ?? '').toString().trim();
        if (!id) return '';
        const found = this.usuarios.find((u) => String(u.id) === id);
        return found?.name || id;
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
                    created_by: getSessionUserId(),
                });
                Swal.fire('Éxito', 'Jugadores A actualizado correctamente', 'success');
            } else {
                // CREATE
                const resp = await this.opsp.createPlayerA({
                    id_company: this.id_company,
                    reward: this.jugadoresA,
                    status: 1,
                    created_by: getSessionUserId(),
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
            created_by: getSessionUserId(),
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





