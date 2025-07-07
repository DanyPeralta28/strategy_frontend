import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'opsp',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './opsp.component.html',
    styleUrls: ['./opsp.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class OpspComponent {
    entidades: string[] = ['Empresa A', 'Empresa B', 'Empresa C'];
    equipos: string[] = ['Ventas', 'Finanzas', 'Operaciones'];
    usuarios: string[] = ['Usuario 1', 'Usuario 2', 'Usuario 3'];

    selectedEntidad: string = '';
    selectedEquipo: string = '';
    selectedUsuario: string = '';

    // balance kpis
    balanceCategorias = [
        {
            nombre: 'Empleados',
            kpis: [
                { nombre: 'Satisfacción interna', resultado: '92%', color: 'excelente' },
                { nombre: 'Rotación de personal', resultado: '18%', color: 'riesgo' },
                { nombre: 'Clima laboral', resultado: '75%', color: 'excelente' }
            ]
        },
        {
            nombre: 'Clientes',
            kpis: [
                { nombre: 'NPS', resultado: '60', color: 'problemas' },
                { nombre: 'Reclamaciones', resultado: '4%', color: 'riesgo' },
                { nombre: 'Fidelización', resultado: '88%', color: 'excelente' }
            ]
        },
        {
            nombre: 'Accionistas',
            kpis: [
                { nombre: 'Rentabilidad', resultado: '15%', color: 'excelente' },
                { nombre: 'Crecimiento EBITDA', resultado: '12%', color: 'excelente' }
            ]
        },
        {
            nombre: 'Entrenamiento',
            kpis: [
                { nombre: 'Horas promedio de capacitación', resultado: '6h', color: 'riesgo' },
                { nombre: 'Nivel de certificación', resultado: '80%', color: 'excelente' }
            ]
        },
        {
            nombre: 'Ventas/Marketing',
            kpis: [
                { nombre: 'Conversiones', resultado: '22%', color: 'excelente' },
                { nombre: 'Ticket promedio', resultado: '$52', color: 'riesgo' }
            ]
        }
    ];

    valores: string[] = [
        'Compromiso con la calidad',
        'Innovación constante',
        'Respeto por las personas'
    ];

    proposito: string = 'Nuestra razón de ser es generar un impacto positivo en la sociedad mediante soluciones tecnológicas que mejoran la vida de nuestros clientes y comunidades.';

    // Metas a 3–5 años
    metasPlazo = {
        fecha: '2028',
        ingresos: '$10M',
        utilidad: '$2M',
        efectivo: '$1.5M'
    };

    // Metas Anuales
    metasAnuales = {
        anioFiscal: '2025',
        ingresos: '$3M',
        utilidad: '$600K',
        margenBruto: '35%',
        efectivo: '$750K',
        cuentasPorCobrar: '$200K',
        rotacionInventario: '8 veces',
        ingresoEmpleado: '$100K'
    };

    // Metas Trimestrales (los 4 trimestres)
    metasTrimestrales = [
        {
            trimestre: 'Q1 2025',
            ingresos: '$750K',
            utilidad: '$150K',
            margenBruto: '33%',
            efectivo: '$200K',
            cuentasPorCobrar: '$50K',
            rotacionInventario: '2 veces',
            ingresoEmpleado: '$25K'
        },
        {
            trimestre: 'Q2 2025',
            ingresos: '$700K',
            utilidad: '$140K',
            margenBruto: '34%',
            efectivo: '$180K',
            cuentasPorCobrar: '$55K',
            rotacionInventario: '2.1 veces',
            ingresoEmpleado: '$24K'
        },
        {
            trimestre: 'Q3 2025',
            ingresos: '$770K',
            utilidad: '$160K',
            margenBruto: '35%',
            efectivo: '$190K',
            cuentasPorCobrar: '$48K',
            rotacionInventario: '2.2 veces',
            ingresoEmpleado: '$26K'
        },
        {
            trimestre: 'Q4 2025',
            ingresos: '$780K',
            utilidad: '$150K',
            margenBruto: '32%',
            efectivo: '$210K',
            cuentasPorCobrar: '$52K',
            rotacionInventario: '2 veces',
            ingresoEmpleado: '$25K'
        }
    ];

    territorio = 'Guatemala';

    accionesConsistentes: string[] = [];

    prioridadesPlazo: string[] = [
        'Expandir operaciones a Centroamérica',
        'Automatizar el 70% de procesos internos',
        'Incrementar participación en mercado digital',
        'Desarrollar talento clave',
        'Alcanzar reconocimiento nacional'
    ];

    prioridadesAnuales = [
        { descripcion: 'Implementar ERP', quien: 'Juan Pérez' },
        { descripcion: 'Capacitar al equipo', quien: 'Ana García' },
    ];

    prioridadesTrimestrales = [
        { descripcion: 'Campaña publicitaria', quien: 'Marcos Díaz' },
        { descripcion: 'Campaña publicitaria', quien: 'Marcos Díaz' },
        { descripcion: 'Campaña publicitaria', quien: 'Marcos Díaz' },
    ];

    // Sección: Visión - Ganar el Juego
    ganarJuego1 = [
        { color: 'verdeOscuro', descripcion: 'gana oscuro' },
        { color: 'verde', descripcion: 'gana verde' },
        { color: 'amarillo', descripcion: 'Entre verde y rojo' },
        { color: 'rojo', descripcion: 'gana rojo' }
    ];

    ganarJuego2 = [
        { color: 'verdeOscuro', descripcion: '' },
        { color: 'verde', descripcion: '' },
        { color: 'amarillo', descripcion: 'Entre verde y rojo' },
        { color: 'rojo', descripcion: '' }
    ];

    metaTrimestreVigente = this.metasTrimestrales[0];
    trimestreVigente: string = this.metaTrimestreVigente?.trimestre || '';
    prioridadesTrimestreVigente = this.prioridadesTrimestrales;

    // Sección: Diferenciadores
    competenciasClave = 'Desarrollo ágil, servicio al cliente excepcional, enfoque en resultados.';
    utilidadX = 'Maximizar utilidad por punto de contacto con el cliente.';
    promesasMarca = 'Rapidez, confianza y personalización.';

    flywheel = 'Generación de valor a través de ciclos de innovación y feedback constante.';
    factorX = 'Tecnología propia + talento humano enfocado en experiencia del cliente.';
    estrategiaFrase = 'Conectamos innovación y personas para transformar industrias.';

    palabrasPropias = 'Ágil, Cercano, Imparable.';
    bhag = 'Alcanzar 1M de usuarios en LATAM para 2030.';
    jugadoresA = '40%';

    // FDT – Solo lectura con datos simulados
    fdtFortalezas: string[] = [
        'Cultura organizacional sólida',
        'Alta satisfacción del cliente',
        'Procesos eficientes de entrega'
    ];

    fdtDebilidades: string[] = [
        'Dependencia de un solo proveedor',
        'Falta de automatización en ventas',
        'Capacitación técnica limitada'
    ];

    fdtTendencias: string[] = [
        'Digitalización del servicio al cliente',
        'Crecimiento en e-commerce',
        'Enfoque en sostenibilidad'
    ];

    juego = {
        fechaLimite: '',
        equipo: '',
        reglas: '',
        tablero: '',
        celebracion: '',
        premio: ''
    };


    constructor() {
    }

    // acciones consistentes
    addAccion(): void {
        this.accionesConsistentes.push('');
    }

    removeAccion(index: number): void {
        this.accionesConsistentes.splice(index, 1);
    }

    trackByIndex(index: number): number {
        return index;   // evita que Angular recree la fila y pierdas el foco
    }

    // ganar el juego
    getPlaceholder(color: string): string {
        switch (color) {
            case 'verdeOscuro': return 'Excelente (verde oscuro)';
            case 'verde': return 'Bien (verde claro)';
            case 'amarillo': return 'Entre verde y rojo';
            case 'rojo': return 'En problemas (rojo)';
            default: return '';
        }
    }
}
