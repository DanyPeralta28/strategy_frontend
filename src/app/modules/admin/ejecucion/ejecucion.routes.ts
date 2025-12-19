import { Routes } from '@angular/router';
import { FormatsComponent } from 'app/modules/admin/ejecucion/formats/formats.component';
import { FaceComponent } from 'app/modules/admin/ejecucion/formats/face/face.component';
import { PaceComponent } from 'app/modules/admin/ejecucion/formats/pace/pace.component';
import { RockefellerComponent } from 'app/modules/admin/ejecucion/formats/rockefeller/rockefeller.component';
import { WwwComponent } from 'app/modules/admin/ejecucion/formats/www/www.component';

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
        path: 'formats/face',
        component: FaceComponent
    },
    {
        path: 'formats/pace',
        component: PaceComponent
    },
    {
        path: 'formats/rockefeller',
        component: RockefellerComponent
    },
    {
        path: 'formats/www',
        component: WwwComponent
    },
] as Routes;
