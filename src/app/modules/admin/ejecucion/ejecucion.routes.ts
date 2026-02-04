import { Routes } from '@angular/router';
import { FormatsComponent } from './formats/formats.component';
import { FaceComponent } from './formats/face/face.component';
import { PaceComponent } from './formats/pace/pace.component';
import { RockefellerComponent } from './formats/rockefeller/rockefeller.component';
import { WwwComponent } from './formats/www/www.component';

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
