import { Routes, RouterModule } from '@angular/router';
import { ForgotComponent } from './forgot/forgot.component';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: '/auth/login',
                pathMatch: 'full',
            },
            {
                path: 'login',
                component: LoginComponent,
            },
            {
                path: 'register',
                component: RegisterComponent,
            },
            {
                path: 'forgot',
                component: ForgotComponent,
            },
        ],
    },
];

export const AuthRoutingModule = RouterModule.forChild(routes);
