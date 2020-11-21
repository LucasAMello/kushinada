import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@app/shared/services';

@Injectable()
export class OnlyAdminUsersGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(): Observable<boolean> {
        return this.authService.getUser().pipe(
            map(user => {
                if (!!user?.isAdmin) {
                    return true;
                }

                this.router.navigateByUrl('');
                return false;
            })
        );
    }
}
