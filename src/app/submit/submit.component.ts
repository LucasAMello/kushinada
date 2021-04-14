import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
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
    dungeonNames: any[];
    badges: any[];

    suggestions = [];

    guideId: any;
    dungeonSuggestions: any;

    constructor(private formBuilder: FormBuilder, private guideService: GuideService, private authService: AuthService,
        private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.authService.getUser().subscribe(user => this.user = user);

        this.cardNames = cardData.map(d => ({ label: `#${d[0]} - ${d[1]}`, name: d[1], value: d[0] }));
        this.dungeonNames = dungeonData.map(d => ({ label: d.name, value: d.id }));
        this.badges = badges.map(d => ({ label: d.name, value: d.id }));

        this.submitForm = this.formBuilder.group({
            title: new FormControl(null, [Validators.required]),
            dungeonId: new FormControl(null),
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

        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.guideId = params['id'];

                this.guideService.get(this.guideId).subscribe((res: any[]) => {
                    if (res.length > 0 && (this.user.roles.indexOf('admin') >= 0 || this.user._id === res[0].user)) {
                        res[0].dungeonId = this.dungeonNames.find(c => c.value === res[0].dungeonId);
                        res[0].leaderId = this.cardNames.find(c => c.value === res[0].leaderId);
                        res[0].sub1Id = this.cardNames.find(c => c.value === res[0].sub1Id);
                        res[0].sub2Id = this.cardNames.find(c => c.value === res[0].sub2Id);
                        res[0].sub3Id = this.cardNames.find(c => c.value === res[0].sub3Id);
                        res[0].sub4Id = this.cardNames.find(c => c.value === res[0].sub4Id);
                        res[0].helperId = this.cardNames.find(c => c.value === res[0].helperId);
                        this.submitForm.patchValue(res[0]);
                    } else {
                        this.guideId = undefined;
                        this.router.navigateByUrl('/submit');
                    }
                });
            }
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
            title: json.t ? json.t.replaceAll('+', ' ') : '',
            description: json.d ? json.d.replaceAll('+', ' ') : '',
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
        results.push(...this.cardNames.filter(c => c.name.toLowerCase() === query).map(c => ({ data: c, level: 0 })));
        results.push(...this.cardNames.filter(c => c.value + '' === query).map(c => ({ data: c, level: 0 })));
        results.push(...this.cardNames.filter(c => c.label.toLowerCase().indexOf(query) >= 0).map(c =>
            ({ data: c, level: c.label.toLowerCase().indexOf(query) })));
        const regularExpression = new RegExp(event.query.toLowerCase().split(' ').join('.*'), 'i');
        results.push(...this.cardNames.filter(c => regularExpression.test(c.label.toLowerCase())).map(c => ({ data: c, level: 1000 })));

        this.suggestions = [...new Set(results.sort((a, b) => a.level - b.level).map(d => d.data))];
    }

    searchDungeon(event) {
        const query = event.query.toLowerCase();
        const regularExpression = new RegExp(event.query.toLowerCase().split(' ').join('.*'), 'i');

        if (query.indexOf('shura') !== -1) {
            const aliases = [
                { label: 'Illusory World of Carnage-No Continues - Guardian of the Demon Gate', alias: 'shura realm 1', value: '4400-1' },
                { label: 'Illusory World of Carnage-No Continues - Ruler of Hell\'s Halls-No Dupes', alias: 'shura realm 2', value: '4400-2' },
                { label: 'Alt. Illusory World of Carnage-No Continues - Alt. Guardian of the Demon Gate', alias: 'alt. shura realm 1', value: '4401-1' },
                { label: 'Alt. Illusory World of Carnage-No Continues - Alt. Ruler of Hell\'s Halls-No Dupes', alias: 'alt. shura realm 2', value: '4401-2' },
            ];

            this.dungeonSuggestions = [...aliases.filter(c => regularExpression.test(c.alias.toLowerCase()))];
        } else {
            const results = [];
            results.push(...this.dungeonNames.filter(c => c.label.toLowerCase() === query).map(c => ({ data: c, level: 0 })));
            results.push(...this.dungeonNames.filter(c => c.value + '' === query).map(c => ({ data: c, level: 0 })));
            results.push(...this.dungeonNames.filter(c => c.label.toLowerCase().indexOf(query) >= 0).map(c => ({ data: c, level: c.label.toLowerCase().indexOf(query) })));
            results.push(...this.dungeonNames.filter(c => regularExpression.test(c.label.toLowerCase())).map(c => ({ data: c, level: 1000 })));

            this.dungeonSuggestions = [...new Set(results.sort((a, b) => a.level - b.level).map(d => d.data))];
        }
    }

    submit() {
        if (this.submitForm.invalid || !this.user) {
            return;
        }

        const formValue = this.submitForm.getRawValue();
        const guide = {
            guideId: this.guideId,
            title: formValue.title,
            dungeonId: formValue.dungeonId?.value,
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

        this.guideService.submit(guide).subscribe(_ => {
            this.snackBar.open('Submitted', 'Close', {
                duration: 10000,
                verticalPosition: 'top'
            });

            this.guideId = undefined;
            this.router.navigateByUrl('/submit');

            this.submitForm.reset();
        });
    }
}
