import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface FormField<T> {
    value: T;
    error: string;
    touched: boolean;
    dirty: boolean;
}

export interface RegistrationForm {
    username: FormField<string>;
    email: FormField<string>;
    password: FormField<string>;
    confirmPassword: FormField<string>;
    agreeToTerms: FormField<boolean>;
}

export class FormService {
    private formStateSubject = new BehaviorSubject<RegistrationForm>({
        username: { value: '', error: '', touched: false, dirty: false },
        email: { value: '', error: '', touched: false, dirty: false },
        password: { value: '', error: '', touched: false, dirty: false },
        confirmPassword: { value: '', error: '', touched: false, dirty: false },
        agreeToTerms: { value: false, error: '', touched: false, dirty: false }
    });

    public formState$ = this.formStateSubject.asObservable();

    public formValid$: Observable<boolean> = this.formState$.pipe(
        map(formState => {
            return Object.values(formState).every(field => !field.error);
        }),
        distinctUntilChanged()
    );

    public formDirty$: Observable<boolean> = this.formState$.pipe(
        map(formState => {
            return Object.values(formState).some(field => field.dirty);
        }),
        distinctUntilChanged()
    );

    updateField<K extends keyof RegistrationForm>(
        fieldName: K,
        updates: Partial<FormField<RegistrationForm[K]['value']>>
    ): void {
        const currentState = this.formStateSubject.value;
        const currentField = currentState[fieldName];

        const updatedField = {
            ...currentField,
            ...updates,
            dirty: updates.value !== undefined ? true : currentField.dirty
        };

        const validatedField = this.validateField(fieldName, updatedField);

        this.formStateSubject.next({
            ...currentState,
            [fieldName]: validatedField
        });
    }

    private validateField<K extends keyof RegistrationForm>(
        fieldName: K,
        field: FormField<RegistrationForm[K]['value']>
    ): FormField<RegistrationForm[K]['value']> {
        let error = '';

        switch (fieldName) {
            case 'username':
                error = this.validateUsername(field.value as string);
                break;
            case 'email':
                error = this.validateEmail(field.value as string);
                break;
            case 'password':
                error = this.validatePassword(field.value as string);
                break;
            case 'confirmPassword':
                error = this.validateConfirmPassword(
                    field.value as string,
                    this.formStateSubject.value.password.value
                );
                break;
            case 'agreeToTerms':
                error = this.validateAgreeToTerms(field.value as boolean);
                break;
        }

        return { ...field, error };
    }

    private validateUsername(username: string): string {
        if (!username) return 'Username is required';
        if (username.length < 3) return 'Username must be at least 3 characters';
        if (username.length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers and underscores';
        return '';
    }

    private validateEmail(email: string): string {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
        return '';
    }

    private validatePassword(password: string): string {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter and one number';
        }
        return '';
    }

    private validateConfirmPassword(confirmPassword: string, password: string): string {
        if (!confirmPassword) return 'Please confirm your password';
        if (confirmPassword !== password) return 'Passwords do not match';
        return '';
    }

    private validateAgreeToTerms(agreeToTerms: boolean): string {
        if (!agreeToTerms) return 'You must agree to the terms and conditions';
        return '';
    }

    resetForm(): void {
        this.formStateSubject.next({
            username: { value: '', error: '', touched: false, dirty: false },
            email: { value: '', error: '', touched: false, dirty: false },
            password: { value: '', error: '', touched: false, dirty: false },
            confirmPassword: { value: '', error: '', touched: false, dirty: false },
            agreeToTerms: { value: false, error: '', touched: false, dirty: false }
        });
    }

    getCurrentState(): RegistrationForm {
        return this.formStateSubject.value;
    }
}

export const formService = new FormService();