import React from 'react'
import type { AppProps } from 'next/app'
import Navbar from '../components/Navbar'
import '../styles/globals.css'
import { Amplify } from 'aws-amplify'
import { ENV } from '@/config/env'
import { Toaster } from 'react-hot-toast';

/**
 * AWS Amplify configuration object for authentication settings
 * @type {Object}
 * @property {Object} Auth - Authentication configuration
 * @property {Object} Auth.Cognito - Amazon Cognito specific settings
 * @property {string} Auth.Cognito.region - AWS region for Cognito services
 * @property {string} Auth.Cognito.userPoolId - Cognito User Pool ID
 * @property {string} Auth.Cognito.userPoolClientId - Cognito User Pool Client ID
 * @property {string} Auth.Cognito.authenticationFlowType - Authentication flow type for Cognito
 */
const amplifyConfig = {
    Auth: {
        Cognito: {
            region: ENV.AWS_REGION,
            userPoolId: ENV.COGNITO_USER_POOL_ID,
            userPoolClientId: ENV.COGNITO_USER_POOL_CLIENT_ID,
            authenticationFlowType: ENV.COGNITO_AUTHENTICATION_FLOW_TYPE
        }
    }
}

Amplify.configure(amplifyConfig)

/**
 * Root application component that provides the base layout and configuration.
 * @component
 * @param {AppProps} props - Next.js application props
 * @param {React.ComponentType} props.Component - The active page component
 * @param {Object} props.pageProps - Props passed to the active page component
 */
function MyApp({ Component, pageProps }: AppProps) {
    return (

        <div className="min-h-screen">
            <Navbar />
            <Component {...pageProps} />
            <Toaster position="top-right" />
        </div>
    )
}

export default MyApp