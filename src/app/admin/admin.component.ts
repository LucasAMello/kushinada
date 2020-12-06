import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {

    guideId: string;

    constructor(private route: ActivatedRoute) { }

    public ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.guideId = params['id'];
        });
    }
}
