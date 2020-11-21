import { Component, OnInit } from '@angular/core';
import { version } from '../../../package.json';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    version: string = version;

    constructor() { }

    ngOnInit() {
    }

}
