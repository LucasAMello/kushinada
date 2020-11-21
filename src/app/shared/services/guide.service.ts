import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Guide } from '@app/guide/guide.model';

@Injectable({ providedIn: 'root' })
export class GuideService {

    constructor(private http: HttpClient) { }

    submit(guide): Observable<Guide> {
        return this.http.post<Guide>('/api/guide/submit', guide);
    }

    getAll(search?): Observable<Guide[]> {
        return this.http.post<Guide[]>('/api/guide/getAll', search);
    }

    like(guideId, userId): Observable<any> {
        return this.http.post('/api/guide/like', { guideId, userId });
    }

    dislike(guideId, userId): Observable<any> {
        return this.http.post('/api/guide/dislike', { guideId, userId });
    }

    report(guideId, userId): Observable<any> {
        return this.http.post('/api/guide/report', { guideId, userId });
    }

    approve(guideId): Observable<any> {
        return this.http.post('/api/guide/approve', { guideId });
    }

    delete(guideId): Observable<any> {
        return this.http.post('/api/guide/delete', { guideId });
    }

}
