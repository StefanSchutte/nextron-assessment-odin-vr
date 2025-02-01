import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { s3Service } from '@/services/s3Service';
import VideoCarouselSection from './VideoCarouselSection';
import { VideoMetadata } from '@/types/types';
import toast from "react-hot-toast";

/**
 * Main video carousel component that displays both "All Videos" and "My Videos" sections.
 * Handles authentication state, video fetching, and filtering based on user status.
 *  * @property {VideoMetadata[]} allVideos - Stores all accessible videos (public + user's private)
 *  * @property {VideoMetadata[]} userVideos - Stores only the current user's videos
 *  * @property {boolean} loading - Tracks the loading state during video fetching
 *  * @property {string | null} error - Stores error messages if video fetching fails
 *  * @property {string | null} currentUser - Stores the current user's username
 */
const VideoCarousel: React.FC = () => {
    const [allVideos, setAllVideos] = useState<VideoMetadata[]>([]);
    const [userVideos, setUserVideos] = useState<VideoMetadata[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    /**
     * Fetches and filters videos based on user authentication status.
     * @function fetchAndFilterVideos
     * @async
     * @param {string | null} username - The current user's username or null if not authenticated
     */
    const fetchAndFilterVideos = async (username: string | null) => {
        try {
            const videos = await s3Service.getAllVideos();
            const sortedVideos = videos.sort((a, b) =>
                new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
            );

            const filteredAllVideos = sortedVideos.filter(video =>
                video.isPublic || (username && video.userId === username)
            );
            setAllVideos(filteredAllVideos);

            if (username) {
                const filteredUserVideos = sortedVideos.filter(video =>
                    video.userId === username
                );
                setUserVideos(filteredUserVideos);
            } else {
                setUserVideos([]);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch videos');
            setLoading(false);
            toast.error('Failed to load videos. Please try again later.');
        }
    };

    /**
     * Checks and updates the current user's authentication status.
     * @function checkCurrentUser
     * @async
     */
    const checkCurrentUser = async () => {
        try {
            const { username } = await getCurrentUser();
            setCurrentUser(username);
            await fetchAndFilterVideos(username);
        } catch (err) {
            setCurrentUser(null);
            await fetchAndFilterVideos(null);
        }
    };

    /**
     * Effect hook that manages authentication and video upload subscriptions
     * - Sets up and cleans up auth listeners (signIn/signOut)
     * - Sets up and cleans up video upload listeners
     * - Handles initial user check
     */
    useEffect(() => {
        checkCurrentUser();

        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    checkCurrentUser();
                    break;
                case 'signedOut':
                    setCurrentUser(null);
                    fetchAndFilterVideos(null);
                    break;
            }
        });

        const videoListener = Hub.listen('videos', ({ payload }) => {
            if (payload.event === 'videoUploaded') {
                checkCurrentUser();
            }
        });

        return () => {
            unsubscribe();
            videoListener();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen pt-14">
                <div className="text-lg -translate-y-32">Loading videos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <VideoCarouselSection
                title="All Videos"
                videos={allVideos}
            />
            {currentUser && (
                <VideoCarouselSection
                    title="My Videos"
                    videos={userVideos}
                />
            )}
        </div>
    );
};

export default VideoCarousel;