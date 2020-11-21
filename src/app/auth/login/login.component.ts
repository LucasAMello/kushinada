import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@app/shared/services';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['../auth.component.scss'],
})
export class LoginComponent implements OnInit {
    email: string | null = null;
    password: string | null = null;

    constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar, private authService: AuthService) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params.validationCode) {
                this.authService.verify(params.validationCode).subscribe(res => {
                    this.snackBar.open('User verified', 'Close', {
                        duration: 10000,
                    });

                    this.email = res.email;
                });

                this.router.navigate(['.'], { relativeTo: this.route });
            } else if (params.verifyEmail) {
                this.snackBar.open('Verification email sent to ' + params.verifyEmail, 'Close', {
                    duration: 10000,
                });

                this.router.navigate(['.'], { relativeTo: this.route });
            }
        });
    }

    login(): void {
        this.authService.login(this.email!, this.password!).subscribe(() => {
            this.router.navigateByUrl('/');
        }, _ => {
            this.snackBar.open('Email and Password don\'t match', 'Close', {
                duration: 10000,
            });
        });
    }
}
