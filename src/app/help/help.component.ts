import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
    scaleValue = 1;

    ngOnInit() {
        if (window.screen.width < 800) {
            this.scaleValue = (window.screen.width - 40) / 648;
        }
    }
}
