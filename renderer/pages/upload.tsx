import React from 'react';
import Head from 'next/head'
import VideoUploadForm from '../components/VideoUploadForm';
import StorageIndicator from '@/components/StorageIndicator';

/**
 * Page component for video upload functionality.
 * @component
 */
const UploadPage = () => {
    return (
        <>
            <Head>
                <title>Upload Video</title>
            </Head>
            <StorageIndicator />
            <div className="min-h-screen ">
                <main className="container mx-auto px-4 py-8">
                    <VideoUploadForm />
                </main>
            </div>
        </>
    );
};

export default UploadPage;