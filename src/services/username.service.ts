import { of, Observable } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export class UsernameService {
    private takenUsernames = ['admin', 'user', 'test', 'username'];

    checkUsernameAvailability(username: string): Observable<{ available: boolean; message: string }> {
        return of(username).pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(username => {
                if (!username || username.length < 3) {
                    return of({ available: false, message: '' });
                }

                return new Observable<{ available: boolean; message: string }>(subscriber => {
                    setTimeout(() => {
                        const available = !this.takenUsernames.includes(username.toLowerCase());
                        const message = available
                            ? 'Username is available!'
                            : 'Username is already taken';

                        subscriber.next({ available, message });
                        subscriber.complete();
                    }, 800);
                });
            }),
            catchError(error => {
                console.error('Username check error:', error);
                return of({ available: false, message: 'Error checking username availability' });
            })
        );
    }
}

export const usernameService = new UsernameService();