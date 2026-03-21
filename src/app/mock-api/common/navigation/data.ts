/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'opsp',
        title: 'OPSP',
        type: 'collapsable',
        icon: 'heroicons_outline:light-bulb',
        children: [
            {
                id: 'opsp.dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/opsp',
                exactMatch: true,
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats',
            },
        ],
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup',
    },
    {
        id: 'cash',
        title: 'Cash',
        type: 'collapsable',
        icon: 'heroicons_outline:banknotes',
        children: [
            {
                id: 'cash.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/cash/formats',
            },
        ],
    },
    {
        id: 'ejecucion',
        title: 'Ejecucion',
        type: 'collapsable',
        icon: 'heroicons_outline:play-circle',
        children: [
            {
                id: 'ejecucion.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/ejecucion/formats',
            },
        ],
    },
    {
        id: 'configuracion',
        title: 'Configuracion',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'configuracion.usuarios',
                title: 'Usuarios',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/configuracion/usuarios',
            },
            {
                id: 'configuracion.permisos',
                title: 'Permisos',
                type: 'basic',
                icon: 'heroicons_outline:key',
                link: '/configuracion/permisos',
            },
        ],
    },
    {
        id: 'signout',
        title: 'Cerrar sesion',
        type: 'basic',
        icon: 'heroicons_outline:arrow-left-on-rectangle',
        link: '/sign-out',
    },
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'opsp',
        title: 'OPSP',
        type: 'collapsable',
        icon: 'heroicons_outline:light-bulb',
        children: [
            {
                id: 'opsp.dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/opsp',
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats',
            },
        ],
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup',
    },
    {
        id: 'cash',
        title: 'Cash',
        type: 'collapsable',
        icon: 'heroicons_outline:banknotes',
        children: [
            {
                id: 'cash.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/cash/formats',
            },
        ],
    },
    {
        id: 'ejecucion',
        title: 'Ejecucion',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion',
    },
    {
        id: 'configuracion',
        title: 'Configuracion',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'configuracion.usuarios',
                title: 'Usuarios',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/configuracion/usuarios',
            },
            {
                id: 'configuracion.permisos',
                title: 'Permisos',
                type: 'basic',
                icon: 'heroicons_outline:key',
                link: '/configuracion/permisos',
            },
        ],
    },
    {
        id: 'signout',
        title: 'Cerrar sesion',
        type: 'basic',
        icon: 'heroicons_outline:arrow-left-on-rectangle',
        link: '/sign-out',
    },
];

export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'opsp',
        title: 'OPSP',
        type: 'collapsable',
        icon: 'heroicons_outline:light-bulb',
        children: [
            {
                id: 'opsp.dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/opsp',
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats',
            },
        ],
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup',
    },
    {
        id: 'cash',
        title: 'Cash',
        type: 'collapsable',
        icon: 'heroicons_outline:banknotes',
        children: [
            {
                id: 'cash.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/cash/formats',
            },
        ],
    },
    {
        id: 'ejecucion',
        title: 'Ejecucion',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion',
    },
    {
        id: 'configuracion',
        title: 'Configuracion',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'configuracion.usuarios',
                title: 'Usuarios',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/configuracion/usuarios',
            },
            {
                id: 'configuracion.permisos',
                title: 'Permisos',
                type: 'basic',
                icon: 'heroicons_outline:key',
                link: '/configuracion/permisos',
            },
        ],
    },
    {
        id: 'signout',
        title: 'Cerrar sesion',
        type: 'basic',
        icon: 'heroicons_outline:arrow-left-on-rectangle',
        link: '/sign-out',
    },
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'opsp',
        title: 'OPSP',
        type: 'collapsable',
        icon: 'heroicons_outline:light-bulb',
        children: [
            {
                id: 'opsp.dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/opsp',
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats',
            },
        ],
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup',
    },
    {
        id: 'cash',
        title: 'Cash',
        type: 'basic',
        icon: 'heroicons_outline:banknotes',
        link: '/cash',
    },
    {
        id: 'ejecucion',
        title: 'Ejecucion',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion',
    },
    {
        id: 'configuracion',
        title: 'Configuracion',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'configuracion.usuarios',
                title: 'Usuarios',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/configuracion/usuarios',
            },
            {
                id: 'configuracion.permisos',
                title: 'Permisos',
                type: 'basic',
                icon: 'heroicons_outline:key',
                link: '/configuracion/permisos',
            },
        ],
    },
    {
        id: 'signout',
        title: 'Cerrar sesion',
        type: 'basic',
        icon: 'heroicons_outline:arrow-left-on-rectangle',
        link: '/sign-out',
    },
];
