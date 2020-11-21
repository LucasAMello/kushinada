import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import badges from '@app/data/badges';
import { User } from '@app/shared/interfaces';
import { AuthService, GuideService } from '@app/shared/services';
import cardData from '../data/cardData';
import dungeonData from '../data/dungeonData';

@Component({
    selector: 'app-submit',
    templateUrl: './submit.component.html',
    styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {

    user: User;

    submitForm: FormGroup;

    cardNames: any[];
    dungeons: any[];
    badges: any[];

    suggestions = [];

    constructor(private formBuilder: FormBuilder, private guideService: GuideService, private authService: AuthService,
        private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.authService.getUser().subscribe(user => this.user = user);

        this.cardNames = cardData.map(d => ({ label: `#${d[0]} - ${d[1]}`, name: d[1], value: d[0] }));
        this.dungeons = dungeonData.map(d => ({ label: d.name, value: d.id }));
        this.badges = badges.map(d => ({ label: d.name, value: d.id }));

        this.submitForm = this.formBuilder.group({
            title: new FormControl(null, [Validators.required]),
            videoId: new FormControl(null),
            padDashFormation: new FormControl(null),
            leaderId: new FormControl(null, [Validators.required]),
            sub1Id: new FormControl(null),
            sub2Id: new FormControl(null),
            sub3Id: new FormControl(null),
            sub4Id: new FormControl(null),
            helperId: new FormControl(null, [Validators.required]),
            description: new FormControl(null),
            badge: new FormControl(0)
        });
    }

    readYouTubeLink(str: string) {
        let youtubeId: string;
        if (str.indexOf('youtu.be/') >= 0) {
            youtubeId = str.substr(str.indexOf('youtu.be/') + 'youtu.be/'.length);
        } else if (str.indexOf('watch?v=') >= 0) {
            youtubeId = str.substr(str.indexOf('watch?v=') + 'watch?v='.length);
        }

        if (youtubeId.indexOf('&') >= 0) {
            youtubeId = youtubeId.substr(0, youtubeId.indexOf('&'));
        }

        this.submitForm.controls.videoId.setValue(youtubeId);
    }

    readPadDashFormation(str: string) {
        let json: any;

        if (str.indexOf('https://mapaler.github.io/PADDashFormation/') === 0 || str.indexOf('%7B') === 0) {
            const decoded = decodeURIComponent(str);
            const index = decoded.indexOf('d=');
            json = index === -1 ? JSON.parse(decoded) : JSON.parse(decoded.substr(index + 2));
        } else if (str.indexOf('{') === 0) {
            json = JSON.parse(str);
        } else {
            return false;
        }

        this.submitForm.patchValue({
            padDashFormation: JSON.stringify(json),
            title: json.t.replaceAll('+', ' '),
            description: json.d,
            badge: json.f[0].length > 2 ? json.f[0][2] : null,
            leaderId: this.cardNames[json.f[0][0][0][0]],
            sub1Id: json.f[0][0][1] ? this.cardNames[json.f[0][0][1][0]] : null,
            sub2Id: json.f[0][0][2] ? this.cardNames[json.f[0][0][2][0]] : null,
            sub3Id: json.f[0][0][3] ? this.cardNames[json.f[0][0][3][0]] : null,
            sub4Id: json.f[0][0][4] ? this.cardNames[json.f[0][0][4][0]] : null,
            helperId: this.cardNames[json.f[0][0][5][0]]
        });
    }

    searchCard(event) {
        const query = event.query.toLowerCase();
        const results = [];
        results.push(...this.cardNames.filter(c => c.name.toLowerCase() === query).map(d => ({ data: d, level: 0 })));
        results.push(...this.cardNames.filter(c => c.value + '' === query).map(d => ({ data: d, level: 0 })));
        results.push(...this.cardNames.filter(c => c.label.toLowerCase().indexOf(query) >= 0).map(d => ({ data: d, level: 1 })));
        const regularExpression = new RegExp(event.query.toLowerCase().split(' ').join('.*'), 'i');
        results.push(...this.cardNames.filter(c => regularExpression.test(c.label.toLowerCase())).map(d => ({ data: d, level: 2 })));

        this.suggestions = [...new Set(results.sort((a, b) => a.level - b.level).map(d => d.data))];
    }

    searchDungeon(event) {
        const regularExpression = new RegExp(event.query.toLowerCase().split(' ').join('.*'), 'i');
        this.suggestions = this.dungeons.filter(c => regularExpression.test(c.label.toLowerCase()));
    }

    submit() {
        if (this.submitForm.invalid || !this.user) {
            return;
        }

        const formValue = this.submitForm.getRawValue();
        const guide = {
            title: formValue.title,
            videoId: formValue.videoId,
            padDashFormation: formValue.padDashFormation,
            leaderId: formValue.leaderId.value,
            sub1Id: formValue.sub1Id?.value,
            sub2Id: formValue.sub2Id?.value,
            sub3Id: formValue.sub3Id?.value,
            sub4Id: formValue.sub4Id?.value,
            helperId: formValue.helperId.value,
            description: formValue.description,
            badge: formValue.badge,
            user: this.user._id
        };

        this.guideService.submit(guide).subscribe(data => {
            this.snackBar.open('Submitted', 'Close', {
                duration: 10000,
                verticalPosition: 'top'
            });

            this.submitForm.reset();
        });
    }
}
