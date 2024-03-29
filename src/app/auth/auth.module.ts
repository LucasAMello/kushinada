import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthRoutingModule } from './auth-routing.module';
import { ForgotComponent } from './forgot/forgot.component';

@NgModule({
    imports: [SharedModule, AuthRoutingModule],
    declarations: [LoginComponent, RegisterComponent, ForgotComponent],
})
export class AuthModule { }
