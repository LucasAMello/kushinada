import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormGroup,
    FormControl,
    Validators,
    ValidationErrors,
    AbstractControl,
} from '@angular/forms';

import { AuthService } from '@app/shared/services';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['../auth.component.scss'],
})
export class ForgotComponent implements OnInit {
    userForm = new FormGroup({
        password: new FormControl('', [Validators.required]),
        repeatPassword: new FormControl('', [Validators.required, this.passwordsMatchValidator]),
    });

    resetCode: string;

    constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['resetCode']) {
                this.resetCode = params['resetCode'];
            } else {
                this.router.navigateByUrl('/auth/login');
            }
        });
    }

    passwordsMatchValidator(control: FormControl): ValidationErrors | null {
        const password = control.root.get('password');
        return password && control.value !== password.value ? { passwordMatch: true, } : null;
    }

    get password(): AbstractControl {
        return this.userForm.get('password')!;
    }

    get repeatPassword(): AbstractControl {
        return this.userForm.get('repeatPassword')!;
    }

    reset(): void {
        if (this.userForm.invalid) {
            return;
        }

        const { password, repeatPassword } = this.userForm.getRawValue();

        this.authService.reset(this.resetCode, password, repeatPassword).subscribe(data => {
            this.router.navigateByUrl('/auth/login?reseted=true');
        });
    }
}
