import { Component, Input, OnInit } from '@angular/core';
import Card from './card.model';
import cardData from '../../data/cardData';

@Component({
    selector: 'app-card-small',
    templateUrl: './card-small.component.html',
    styleUrls: ['./card-small.component.scss']
})
export class CardSmallComponent implements OnInit {

    @Input() cardId: number;

    card: Card;

    constructor() { }

    ngOnInit() {
        const card = cardData[this.cardId] as any[];
        const p = Math.ceil(card[0] / 100.0);
        const x = Math.floor((card[0] - 1) % 10);
        const y = Math.floor(((card[0] - 1) % 100) / 10.0);

        this.card = {
            id: card[0],
            name: card[1],
            attr: card[2],
            subAttr: card[3],
            picId: ('' + p).padStart(3, '0'),
            picX: x * -25,
            picY: y * -25
        };
    }

}
