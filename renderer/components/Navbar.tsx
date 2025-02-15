import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Upload, Home, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

/**
 * Navbar component that provides navigation and authentication functionality
 * @component
 * @returns {JSX.Element} The rendered navigation bar
 */
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    /**
     * Checks the current authentication status of the user
     * @async
     * @function checkAuthStatus
     * @throws {Error} If there's an error checking authentication
     */
    const checkAuthStatus = async () => {
        try {
            await getCurrentUser();
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    /**
     * Effect hook to handle authentication status and listen for auth events.
     * Sets up a listener for authentication events using Amplify Hub.
     */
    useEffect(() => {
        checkAuthStatus();

        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    setIsAuthenticated(true);
                    toast.success('Successfully signed in');
                    break;
                case 'signedOut':
                    setIsAuthenticated(false);
                    toast.success('Successfully signed out');
                    break;
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    /**
     * Handles user sign out process.
     * @async
     * @function handleSignOut
     * @throws {Error} If sign out fails
     */
    const handleSignOut = async () => {
        try {
            await signOut();
            setIsAuthenticated(false);
            router.push('/home');
        } catch (error) {
            toast.error('Sign out error');
        }
    };

    return (
        <nav className="bg-gray-950 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/guidelines" className="flex items-center">
                            <span className="text-l font-bold text-white">Nextron Video Upload App</span>
                        </Link>
                    </div>

                    {/* Navigation items */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/home" className="flex items-center space-x-1 text-gray-200 hover:text-blue-600">
                            <Home size={20} />
                            <span>Home</span>
                        </Link>

                        {isAuthenticated && (
                            <Link href="/upload" className="flex items-center space-x-1 text-gray-200 hover:text-blue-600">
                                <Upload size={20} />
                                <span>Upload</span>
                            </Link>
                        )}
                        {!isAuthenticated ? (
                            <Link href="/login" className="flex items-center space-x-1 text-gray-200 hover:text-blue-600">
                                <User size={20} />
                                <span>Login</span>
                            </Link>
                        ) : (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-1 text-gray-200 hover:text-blue-600"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-200 hover:text-blue-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/home" className="block px-3 py-2 rounded-md text-gray-200 hover:text-blue-600 hover:bg-gray-800">
                            Home
                        </Link>
                        {isAuthenticated && (
                            <Link href="/upload" className="block px-3 py-2 rounded-md text-gray-200 hover:text-blue-600 hover:bg-gray-800">
                                Upload
                            </Link>
                        )}
                        {!isAuthenticated ? (
                            <Link href="/login" className="block px-3 py-2 rounded-md text-gray-200 hover:text-blue-600 hover:bg-gray-800">
                                Login
                            </Link>
                        ) : (
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left block px-3 py-2 rounded-md text-gray-200 hover:text-blue-600 hover:bg-gray-800"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;