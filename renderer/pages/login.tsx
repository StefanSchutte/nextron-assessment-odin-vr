import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';
import toast from 'react-hot-toast';

/**
 * Login component that provides authentication functionality
 * @component
 * @returns {JSX.Element} The rendered login form
 */
export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    /**
     * Handles form submission for login and signup
     * @async
     * @param {React.FormEvent} e - The form submission event
     * @throws {Error} If authentication fails
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Check if user is already authenticated
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    router.push('/home').then(() => {
                        window.location.reload();
                    });
                    return;
                }
            } catch {}

            if (isSignUp) {
                const { userId } = await signUp({
                    username: email,
                    password,
                    options: {
                        userAttributes: {
                            email
                        }
                    }
                });
                toast.success('Please check your email for verification code');
                setNeedsVerification(true);
            } else {
                const { isSignedIn } = await signIn({
                    username: email,
                    password
                });
                if (isSignedIn) {
                    toast.success('Logged in successfully!');
                    await router.push('/home');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles email verification code submission
     * @async
     * @param {React.FormEvent} e - The form submission event
     * @throws {Error} If verification fails
     */
    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await confirmSignUp({
                username: email,
                confirmationCode: verificationCode
            });
            setNeedsVerification(false);
            setIsSignUp(false);
            toast.success('Email verified successfully! You can now login.');
        } catch (err: any) {
            setError(err.message || 'Verification failed');
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (needsVerification) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-500">
                <div className="bg-gray-400 p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Verify Email
                    </h2>

                    <form onSubmit={handleVerification} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-gray-200 border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen text-gray-900">
            <div className="bg-gray-400 p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isSignUp ? 'Create Account' : 'Login'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border bg-gray-200 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border bg-gray-200 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            disabled={isLoading}
                        >
                            {isSignUp
                                ? 'Already have an account? Login'
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}