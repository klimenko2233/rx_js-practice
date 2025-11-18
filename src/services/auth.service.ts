import {BehaviorSubject, catchError, delay, map, type Observable, of, tap, throwError} from 'rxjs';
import {ajax} from 'rxjs/internal/ajax/ajax';

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private readonly STORAGE_KEY = 'auth_token';

    constructor() {
        this.checkExistingAuth();
    }

    public get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    public get isLoading(): boolean {
        return this.loadingSubject.value;
    }

    private checkExistingAuth():void {
        const token = localStorage.getItem(this.STORAGE_KEY);
        if (token) {
            this.loadUserProfile().subscribe();
        }
    }

    login(email:string, password:string):Observable<AuthResponse> {
        this.loadingSubject.next(true);
        return ajax.getJSON<User[]>(`https://jsonplaceholder.typicode.com/users?email=${email}`).pipe(
            delay(1000),
            map(users => {
                if (users.length === 0) {
                    throw new Error('User not found');
                }
                const user = users[0];

                if(!password) {
                    throw new Error('Invalid password');
                }

                const token = this.generateToken(user);

                return {user, token};
            }),
            tap(response => {
                this.currentUserSubject.next(response.user);
                localStorage.setItem(this.STORAGE_KEY, response.token);
                this.loadingSubject.next(false);

                console.log('Login successful:', response.user);
            }),
            catchError(error => {
                this.loadingSubject.next(false);
                console.error('Login failed:', error);
                return throwError(() => new Error(error.message || 'Login failed'));
            })
        );
    }

    loadUserProfile(): Observable<User> {
        const randomUserId= Math.floor(Math.random() * 10) + 1;

        return ajax.getJSON<User>(`https://jsonplaceholder.typicode.com/users/${randomUserId}`).pipe(
            tap(user => this.currentUserSubject.next(user)),
            catchError(error => {
                console.error('Error loading user profile:', error);
                return throwError(() => error);
            })
        );
    }

    logout():void {
        this.currentUserSubject.next(null);
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('User logged out');
    }

    updateProfile(userData: Partial<User>): Observable<User> {
        if(!this.currentUser) {
            return throwError(() => new Error('User not logged in'));
        }

        const updatedUser = {...this.currentUser, ...userData};

        return of(updatedUser).pipe(
            delay(500),
            tap(user => this.currentUserSubject.next(user)),
        )
    }

    private generateToken(user: User): string {
        return btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            timestamp: Date.now()
        }));
    }
}

export const authService = new AuthService();