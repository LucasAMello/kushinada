import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
    FormGroup,
    FormControl,
    Validators,
    ValidationErrors,
    AbstractControl,
} from '@angular/forms';

import { AuthService } from '@app/shared/services';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['../auth.component.scss'],
})
export class RegisterComponent {
    userForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
        repeatPassword: new FormControl('', [Validators.required, this.passwordsMatchValidator]),
    });

    constructor(private snackBar: MatSnackBar, private authService: AuthService, private router: Router) { }

    passwordsMatchValidator(control: FormControl): ValidationErrors | null {
        const password = control.root.get('password');
        return password && control.value !== password.value
            ? {
                passwordMatch: true,
            }
            : null;
    }

    get username(): AbstractControl {
        return this.userForm.get('username')!;
    }

    get email(): AbstractControl {
        return this.userForm.get('email')!;
    }

    get password(): AbstractControl {
        return this.userForm.get('password')!;
    }

    get repeatPassword(): AbstractControl {
        return this.userForm.get('repeatPassword')!;
    }

    register(): void {
        if (this.userForm.invalid) {
            return;
        }

        const { username, email, password, repeatPassword } = this.userForm.getRawValue();

        this.authService.register(username, email, password, repeatPassword).subscribe(data => {
            this.router.navigateByUrl('/auth/login?verifyEmail=' + data.email);
        });
    }
}
