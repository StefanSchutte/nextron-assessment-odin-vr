import React from 'react';
import Head from 'next/head'
import VideoUploadForm from '../components/VideoUploadForm';

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
            <div className="min-h-screen ">
                <main className="container mx-auto px-4 py-8">
                    <VideoUploadForm />
                </main>
            </div>
        </>
    );
};

export default UploadPage;