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
                exactMatch: true
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats'
            }
        ]
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup'
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
                link: '/cash/formats'
            }
        ]
    },
        {
        id: 'ejecucion',
        title: 'Ejecución',
        type: 'collapsable',
        icon: 'heroicons_outline:play-circle',
        children: [
            {
                id: 'cash.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/ejecucion/formats'
            }
        ]
    }
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
                link: '/opsp'
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats'
            }
        ]
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup'
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
                link: '/cash/formats'
            }
        ]
    },
    {
        id: 'ejecucion',
        title: 'Ejecución',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion'
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
                link: '/opsp'
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats'
            }
        ]
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup'
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
                link: '/cash/formats'
            }
        ]
    },
    {
        id: 'ejecucion',
        title: 'Ejecución',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion'
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
                link: '/opsp'
            },
            {
                id: 'opsp.formatos',
                title: 'Formatos',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/opsp/formats'
            }
        ]
    },
    {
        id: 'followup',
        title: 'Follow up',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/followup'
    },
    {
        id: 'cash',
        title: 'Cash',
        type: 'basic',
        icon: 'heroicons_outline:banknotes',
        link: '/cash'
    },
    {
        id: 'ejecucion',
        title: 'Ejecución',
        type: 'basic',
        icon: 'heroicons_outline:play-circle',
        link: '/ejecucion'
    },
];
