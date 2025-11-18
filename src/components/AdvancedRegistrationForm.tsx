import {useEffect, useState} from 'react';
import {formService} from '../services/form.service';
import {usernameService} from '../services/username.service';
import {map, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

export const AdvancedRegistrationForm = () => {
    const [formState, setFormState] = useState(formService.getCurrentState());
    const [isFormValid, setIsFormValid] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const [usernameAvailability, setUsernameAvailability] = useState<{
        checking: boolean;
        available?: boolean;
        message: string;
    }>({checking: false, message: ''});

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        subscriptions.push(
            formService.formState$.subscribe(setFormState)
        );

        subscriptions.push(
            formService.formValid$.subscribe(setIsFormValid)
        );

        subscriptions.push(
            formService.formDirty$.subscribe(setIsFormDirty)
        );

        const usernameSubscription = formService.formState$.pipe(
            map(state => state.username),
            distinctUntilChanged((prev, curr) => prev.value === curr.value),
            filter(username => username.value.length >= 3),
            debounceTime(600),
            filter(username => !formService.getCurrentState().username.error)
        ).subscribe(username => {
            setUsernameAvailability({checking: true, message: 'Checking availability...'});

            usernameService.checkUsernameAvailability(username.value).subscribe({
                next: result => {
                    setUsernameAvailability({
                        checking: false,
                        available: result.available,
                        message: result.message
                    });

                    if (!result.available) {
                        formService.updateField('username', {error: result.message});
                    }
                },
                error: () => {
                    setUsernameAvailability({
                        checking: false,
                        message: 'Error checking username'
                    });
                }
            });
        });

        subscriptions.push(usernameSubscription);

        return () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        };
    }, []);

    const handleInputChange = (fieldName: keyof typeof formState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = fieldName === 'agreeToTerms' ? e.target.checked : e.target.value;
        formService.updateField(fieldName, {value});
    };

    const handleInputBlur = (fieldName: keyof typeof formState) => () => {
        formService.updateField(fieldName, {touched: true});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        Object.keys(formState).forEach(fieldName => {
            formService.updateField(fieldName as keyof typeof formState, {touched: true});
        });

        if (!isFormValid) {
            setSubmitMessage('Please fix form errors before submitting');
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitMessage('✅ Registration successful!');
            formService.resetForm();
            setUsernameAvailability({checking: false, message: ''});
        } catch (error) {
            setSubmitMessage('❌ Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        formService.resetForm();
        setUsernameAvailability({checking: false, message: ''});
        setSubmitMessage('');
    };

    const getInputClassName = (field: typeof formState[keyof typeof formState]) => {
        let className = 'border p-2 rounded w-full';

        if (field.touched && field.error) {
            className += ' border-red-500 bg-red-50';
        } else if (field.touched && !field.error) {
            className += ' border-green-500 bg-green-50';
        }

        return className;
    };

    return (
        <div className="p-6 border rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Advanced Registration Form</h2>
            <p className="text-gray-600 mb-6">
                Real-time validation with RxJS and async username checking
            </p>

            {submitMessage && (
                <div className={`p-4 rounded mb-6 ${
                    submitMessage.includes('✅')
                        ? 'bg-green-100 border border-green-400 text-green-700'
                        : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                    {submitMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                        type="text"
                        value={formState.username.value}
                        onChange={handleInputChange('username')}
                        onBlur={handleInputBlur('username')}
                        className={getInputClassName(formState.username)}
                        placeholder="Enter username (min 3 characters)"
                    />
                    {formState.username.touched && formState.username.error && (
                        <p className="text-red-500 text-sm mt-1">{formState.username.error}</p>
                    )}
                    {usernameAvailability.checking && (
                        <p className="text-blue-500 text-sm mt-1">🔄 Checking username...</p>
                    )}
                    {!usernameAvailability.checking && usernameAvailability.message &&
                        !formState.username.error && (
                            <p className={`text-sm mt-1 ${
                                usernameAvailability.available ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {usernameAvailability.available ? '✅' : '❌'} {usernameAvailability.message}
                            </p>
                        )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={formState.email.value}
                        onChange={handleInputChange('email')}
                        onBlur={handleInputBlur('email')}
                        className={getInputClassName(formState.email)}
                        placeholder="Enter your email"
                    />
                    {formState.email.touched && formState.email.error && (
                        <p className="text-red-500 text-sm mt-1">{formState.email.error}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={formState.password.value}
                        onChange={handleInputChange('password')}
                        onBlur={handleInputBlur('password')}
                        className={getInputClassName(formState.password)}
                        placeholder="At least 8 characters with uppercase, lowercase and number"
                    />
                    {formState.password.touched && formState.password.error && (
                        <p className="text-red-500 text-sm mt-1">{formState.password.error}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                        type="password"
                        value={formState.confirmPassword.value}
                        onChange={handleInputChange('confirmPassword')}
                        onBlur={handleInputBlur('confirmPassword')}
                        className={getInputClassName(formState.confirmPassword)}
                        placeholder="Confirm your password"
                    />
                    {formState.confirmPassword.touched && formState.confirmPassword.error && (
                        <p className="text-red-500 text-sm mt-1">{formState.confirmPassword.error}</p>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={formState.agreeToTerms.value}
                        onChange={handleInputChange('agreeToTerms')}
                        onBlur={handleInputBlur('agreeToTerms')}
                        className="mr-2"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm">
                        I agree to the terms and conditions
                    </label>
                </div>
                {formState.agreeToTerms.touched && formState.agreeToTerms.error && (
                    <p className="text-red-500 text-sm">{formState.agreeToTerms.error}</p>
                )}

                <div className="flex space-x-4 pt-4">
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="flex-1 bg-blue-500 text-white px-6 py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!isFormDirty}
                        className="flex-1 bg-gray-500 text-white px-6 py-3 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Reset Form
                    </button>
                </div>
            </form>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">Debug Information:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>Form Valid:</strong> {isFormValid ? 'Yes' : 'No'}</p>
                        <p><strong>Form Dirty:</strong> {isFormDirty ? 'Yes' : 'No'}</p>
                        <p><strong>Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <p><strong>Username Available:</strong> {usernameAvailability.available ? 'Yes' : 'No'}</p>
                        <p><strong>Username Checking:</strong> {usernameAvailability.checking ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};