import { Routes } from '@angular/router';
import { FormatsComponent } from 'app/modules/admin/cash/formats/formats.component';
import { IelComponent } from 'app/modules/admin/cash/formats/iel/iel.component';
import { OptcashComponent } from 'app/modules/admin/cash/formats/optcash/optcash.component';
import { ValueComponent } from 'app/modules/admin/cash/formats/value/value.component';
import { FinanceComponent } from 'app/modules/admin/cash/formats/finance/finance.component';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: FormatsComponent,
    },
    {
        path: 'formats',
        component: FormatsComponent
    },
    {
        path: 'formats/iel',
        component: IelComponent
    },
    {
        path: 'formats/optcash',
        component: OptcashComponent
    },
    {
        path: 'formats/value',
        component: ValueComponent
    },
    {
        path: 'formats/finance',
        component: FinanceComponent
    },
] as Routes;
