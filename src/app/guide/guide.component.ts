import { Component, Input, OnInit } from '@angular/core';
import cardData from '@app/data/cardData';
import dungeonData from '@app/data/dungeonData';
import badges from '@app/data/badges';
import { AuthService, GuideService } from '@app/shared/services';
import { User } from '@app/shared/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {
    @Input() admin = false;
    @Input() guideId = '';

    user: User;
    showMine = false;

    dungeonData = dungeonData;
    cardData = cardData;
    badges = badges;

    guides: any[];

    searchForm: FormGroup;
    cardNames: any[];
    dungeonNames: any[];
    advancedSearch = false;
    suggestions: any;
    orderOptions = [{ label: 'Most Recent', value: 'recent' }, { label: 'Most Likes', value: 'likes' }];

    displayReport = false;
    guideReportId: any;
    reportOptions = [
        { label: 'Not PaD related', value: 'notPad' },
        { label: 'Duplicated', value: 'duplicated' },
        { label: 'Offensive', value: 'offensive' }];
    reportReason: any;

    dungeonSuggestions: any[];
    skipQuery = false;

    constructor(private formBuilder: FormBuilder, private guideService: GuideService, private authService: AuthService,
            private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.authService.getUser().subscribe(user => this.user = user);

        this.searchForm = this.formBuilder.group({
            title: new FormControl(null),
            leader: new FormControl(null),
            order: new FormControl('recent'),
            dungeon: new FormControl(null),
            withVideo: new FormControl(false),
            withFormation: new FormControl(false)
        });

        const transformDict = {};
        cardData.forEach(d => {
            if (d[5]) {
                if (transformDict[d[5]]) {
                    transformDict[d[5]].push(d[0]);
                } else {
                    transformDict[d[5]] = [d[0]];
                }

                if (transformDict[d[0]]) {
                    transformDict[d[5]].push(...transformDict[d[0]]);
                    transformDict[d[0]].push(d[5]);
                } else {
                    transformDict[d[0]] = [d[5]];
                }
            }
        });
        this.cardNames = cardData.map(d => ({ label: `#${d[0]} - ${d[1]}`, name: d[1], value: d[0], transform: transformDict[d[0]] }));

        this.dungeonNames = dungeonData.map(d => ({ label: d.name, value: d.id }));

        this.route.queryParams.subscribe(params => {
            if (this.skipQuery) {
                this.skipQuery = false;
            } else {
                this.searchForm.reset();
                this.searchForm.get('order').setValue('recent');
                this.advancedSearch = false;

                if (params['showMine']) {
                    this.showMine = params['showMine'] === 'true';
                }

                if (params['title']) {
                    this.searchForm.get('title').setValue(params['title']);
                }

                if (params['leader']) {
                    this.searchForm.get('leader').setValue(this.cardNames.find(c => c.value === +params['leader']));
                    this.advancedSearch = true;
                }

                if (params['dungeon']) {
                    this.searchForm.get('dungeon').setValue(this.dungeonNames.find(d => d.value === params['dungeon']));
                    this.advancedSearch = true;
                }

                this.search(this.guideId);
            }
        });
    }

    like(guide) {
        if (!this.user) {
            this.snackBar.open('You need to be logged to like a guide', 'Close', {
                duration: 5000,
                verticalPosition: 'top'
            });
        } else {
            this.guideService.like(guide._id, this.user._id).subscribe(res => {
                if (res.success) {
                    guide.likes.push(this.user._id);

                    const index = guide.dislikes.indexOf(this.user._id);
                    if (index > -1) {
                        guide.dislikes.splice(index, 1);
                    }
                }
            });
        }
    }

    dislike(guide) {
        if (!this.user) {
            this.snackBar.open('You need to be logged to dislike a guide', 'Close', {
                duration: 5000,
                verticalPosition: 'top'
            });
        } else {
            this.guideService.dislike(guide._id, this.user._id).subscribe(res => {
                if (res.success) {
                    guide.dislikes.push(this.user._id);

                    const index = guide.likes.indexOf(this.user._id);
                    if (index > -1) {
                        guide.likes.splice(index, 1);
                    }
                }
            });
        }
    }

    showReport(id) {
        if (!this.user) {
            this.snackBar.open('You need to be logged to report a guide', 'Close', {
                duration: 5000,
                verticalPosition: 'top'
            });
        } else {
            this.guideReportId = id;
            this.displayReport = true;
        }
    }

    report() {
        this.guideService.report(this.guideReportId, this.user._id).subscribe(res => {
            if (res.success) {
                this.snackBar.open('Report sent', 'Close', {
                    duration: 5000,
                    verticalPosition: 'top'
                });
            }

            this.displayReport = false;
        });
    }

    approve(id) {
        if (!this.admin) {
            this.snackBar.open('You need to be logged to an admin account', 'Close', {
                duration: 5000,
                verticalPosition: 'top'
            });
        } else {
            this.guideService.approve(id).subscribe(res => {
                if (res.success) {
                    this.snackBar.open('Approved', 'Close', {
                        duration: 5000,
                        verticalPosition: 'top'
                    });

                    this.guides.find(g => g._id === id).awaitingApproval = false;
                }
            });
        }
    }

    delete(guide) {
        if (!this.admin && (!this.user || guide.user._id !== this.user._id)) {
            this.snackBar.open('You need to be logged to an admin account', 'Close', {
                duration: 5000,
                verticalPosition: 'top'
            });
        } else {
            this.guideService.delete(guide._id).subscribe(res => {
                if (res.success) {
                    this.snackBar.open('Deleted', 'Close', {
                        duration: 5000,
                        verticalPosition: 'top'
                    });

                    this.search();
                }
            });
        }
    }

    edit(guide, event) {
        if (event.ctrlKey) {
            window.open('/submit?id=' + guide._id.toString());
        } else {
            this.router.navigateByUrl('/submit?id=' + guide._id.toString());
        }
    }

    getLatentStyle(l) {
        const style: any = {
            backgroundPositionY: l * -32 + 'px'
        };

        if ([12, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 43, 44, 45].indexOf(l) !== -1) {
            style.width = '70px';
        } else if ([13, 14, 15, 37, 38, 39, 40, 41, 42].indexOf(l) !== -1) {
            style.width = '146px';
            style.marginLeft = '-50px';
            style.marginRight = '47px';
        } else {
            style.width = '32px';
        }

        return style;
    }

    getLatentSize(l) {
        if ([12, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 43, 44, 45].indexOf(l) !== -1) {
            return 2;
        } else if ([13, 14, 15, 37, 38, 39, 40, 41, 42].indexOf(l) !== -1) {
            return 6;
        } else {
            return 1;
        }
    }

    search(id?) {
        if (id) {
            this.guideService.get(id).subscribe(res => {
                this.guides = res;
                this.guides.forEach(g => this.parseGuide(g));
            });
        } else {
            const formValues = this.searchForm.value;
            const search: any = {
                dungeonId: formValues.dungeon ? formValues.dungeon.value : null,
                leaderId: formValues.leader ? formValues.leader.value : null,
                transformId: formValues.leader ? formValues.leader.transform : null,
                title: formValues.title,
                withVideo: formValues.withVideo ? formValues.withVideo.length > 0 : false,
                withFormation: formValues.withFormation ? formValues.withFormation.length > 0 : false,
                order: formValues.order,
                showMine: this.showMine
            };

            const queryParams: any = { title: formValues.title };
            if (formValues.dungeon) {
                queryParams.dungeon = formValues.dungeon.value;
            }

            if (formValues.leader) {
                queryParams.leader = formValues.leader.value;
            }

            this.router.navigate([], {
                queryParams,
                queryParamsHandling: 'merge',
            });

            this.skipQuery = true;

            if (!this.admin) {
                search.awaitingApproval = false;
            }

            this.guides = null;
            this.guideService.getAll(search).subscribe(res => {
                this.guides = res;
                this.guides.forEach(g => this.parseGuide(g));
            });
        }
    }

    parseGuide(g) {
        g.showMore = false;
        g.createdAt = new Date(g.createdAt).toLocaleString('en-GB');

        const version = g.version ? g.version : 1;
        if (g.version < 2) {
            g.badge = this.convertBadge(g.badge);
        }

        if (g.padDashFormation) {
            const parsed = JSON.parse(g.padDashFormation);
            const team = [];
            const latents = [];
            parsed.f[0][0].forEach(t => {
                if (t) {
                    const p = Math.ceil((t[0] - 1) / 100.0);
                    const x = Math.floor((t[0] - 1) % 10);
                    const y = Math.floor(((t[0] - 1) % 100) / 10.0);
                    team.push(cardData[t[0]].concat(t[5], p, x, y));
                    latents.push(t[4] ? t[4].sort((a, b) => this.getLatentSize(b) - this.getLatentSize(a)) : t[4]);
                } else {
                    team.push(null);
                    latents.push(null);
                }
            });

            const assists = parsed.f[0][1].map(t => {
                if (t) {
                    const p = Math.ceil((t[0] - 1) / 100.0);
                    const x = Math.floor((t[0] - 1) % 10);
                    const y = Math.floor(((t[0] - 1) % 100) / 10.0);
                    return cardData[t[0]].concat(p, x, y);
                } else {
                    return null;
                }
            });

            while (assists.length < 6) {
                assists.push(null);
            }

            g.parsedTeamData = { team, assists, latents, badge: parsed.v > 3 ? parsed.f[0][2] : this.convertBadge(parsed.f[0][2]) };
            g.padDashFormation = encodeURIComponent(g.padDashFormation).split('%2B').join('+');
        }
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
                { label: 'Illusory World of Carnage-No Continues - Stellar Stage of the Supreme-All Att. Req.', alias: 'shura realm 3', value: '4400-3' },
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

    findBadge(badgeId) {
        const badge = this.badges.find(b => b.id === badgeId);
        return badge ? badge.name : '';
    }

    convertBadge(badge: number) {
        switch (badge) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: {
                return badge + 1;
            }

            case 9: {
                return 11;
            }

            case 10: case 11: case 12: {
                return badge + 7;
            }

            case 13: {
                return 21;
            }

            case 14: {
                return 10;
            }

            case 15: case 16: case 17: {
                return badge - 3;
            }

            case 18: {
                return 50;
            }

            default: return 1;
        }
    }

    getBackgroundPositionX(badge: number) {
        return (badge === 50 ? -36 : 0) + 'px';
    }

    getBackgroundPositionY(badge: number) {
        return (badge ? badge : 0) * -30 + 'px';
    }
}
