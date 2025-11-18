import { ajax } from 'rxjs/ajax';
import {map, catchError, switchMap} from 'rxjs/operators';
import { of, forkJoin, Observable } from 'rxjs';

export interface Launch {
    id: string;
    name: string;
    date_utc: string;
    success: boolean;
    rocket: string;
}

export interface Rocket {
    id: string;
    name: string;
    description: string;
    flickr_images: string[];
}

export interface LaunchWithRocket extends Launch {
    rocketDetails: Rocket;
}

export const spaceXService = {
    getLaunches(): Observable<Launch[]> {
        const url = 'https://corsproxy.io/?https://api.spacexdata.com/v4/launches?limit=5';

        return ajax.getJSON<Launch[]>(url).pipe(
            catchError(error => {
                console.error('Error fetching launches:', error);
                return of([]);
            })
        );
    },

    getRocket(rocketId: string): Observable<Rocket> {
        const url = `https://corsproxy.io/?https://api.spacexdata.com/v4/rockets/${rocketId}`;

        return ajax.getJSON<Rocket>(url).pipe(
            catchError(error => {
                console.error('Error fetching rocket:', error);
                return of({
                    id: rocketId,
                    name: 'Unknown Rocket',
                    description: 'No information available',
                    flickr_images: []
                });
            })
        );
    },

    getLaunchesWithRockets(): Observable<LaunchWithRocket[]> {
        return this.getLaunches().pipe(
            map(launches => launches.filter(launch => launch.rocket)),
            switchMap(launches => {
                const rocketRequests = launches.map(launch =>
                    this.getRocket(launch.rocket).pipe(
                        map(rocketDetails => ({
                            ...launch,
                            rocketDetails
                        }))
                    )
                );

                return forkJoin(rocketRequests);
            })
        );
    }
};