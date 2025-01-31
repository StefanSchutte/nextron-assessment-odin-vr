import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { s3Service } from '@/services/s3Service';
import VideoCard from './VideoCard';
import VideoOverlay from './VideoOverlay';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoMetadata } from '@/types/types'

/**
 * VideoCarousel component that handles video display and navigation.
 * @component
 * @returns {JSX.Element} The rendered video carousel
 */
const VideoCarousel: React.FC = () => {
    const [videos, setVideos] = useState<VideoMetadata[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(4);

    /**
     * Fetches and filters videos based on user authentication
     * @async
     * @param {string | null} username - The current user's username
     */
    const fetchAndFilterVideos = async (username: string | null) => {
        try {
            const allVideos = await s3Service.getAllVideos();
            const filteredVideos = allVideos.filter(video =>
                video.isPublic || (username && video.userId === username)
            );

            const sortedVideos = filteredVideos.sort((a, b) =>
                new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
            );

            setVideos(sortedVideos);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch videos');
            setLoading(false);
            toast.error('Failed to load videos. Please try again later.');
        }
    };

    /**
     * Checks and updates the current user status
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
     * Effect hook to update items per page based on window size
     */
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth >= 1024) {
                setItemsPerPage(4);
            } else if (window.innerWidth >= 768) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(1);
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    /**
     * Effect hook to handle authentication status and video fetching
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

    /**
     * Handles video card selection.
     * @param {VideoMetadata} video - The selected video metadata
     */
    const handleVideoClick = (video: VideoMetadata) => {
        setSelectedVideo(video);
        toast.success('Loading video...', {
            duration: 2000
        });
    };

    /**
     * Navigates to the next set of videos in the carousel
     */
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + itemsPerPage;
            return nextIndex >= videos.length ? 0 : nextIndex;
        });
    };

    /**
     * Navigates to the previous set of videos in the carousel
     */
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex - itemsPerPage;
            return nextIndex < 0 ? Math.max(videos.length - itemsPerPage, 0) : nextIndex;
        });
    };

    /**
     * Navigates to a specific page in the carousel
     * @param {number} pageIndex - The index of the page to navigate to
     */
    const goToPage = (pageIndex: number) => {
        const newIndex = pageIndex * itemsPerPage;
        setCurrentIndex(Math.min(newIndex, videos.length - itemsPerPage));
    };

    /** Total number of pages in the carousel */
    const totalPages = Math.ceil(videos.length / itemsPerPage);
    /** Current page number */
    const currentPage = Math.floor(currentIndex / itemsPerPage);

    /**
     * Gets the currently visible videos based on current index and items per page
     * @returns {VideoMetadata[]} Array of visible video metadata
     */
    const getVisibleVideos = (): VideoMetadata[] => {
        if (videos.length === 0) return [];
        const startIndex = currentIndex;
        const endIndex = Math.min(currentIndex + itemsPerPage, videos.length);
        return videos.slice(startIndex, endIndex);
    };

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
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-8">Uploaded Videos</h2>
            {videos.length === 0 ? (
                <div className="text-center text-gray-500">
                    No videos available
                </div>
            ) : (
                <div className="relative mt-5">
                    <div className="overflow-hidden relative px-12">

                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600 z-10 transition-transform duration-200 hover:scale-110"
                        >
                            <ArrowLeftCircle size={48} />
                        </button>

                        <div className="flex transition-transform duration-300 ease-in-out">
                            {getVisibleVideos().map((video) => (
                                <div
                                    key={video.id}
                                    className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
                                >
                                    <VideoCard
                                        title={video.title}
                                        description={video.description}
                                        thumbnailUrl={video.thumbnailUrl}
                                        videoUrl={video.videoUrl}
                                        duration={video.duration}
                                        category={video.category}
                                        uploadDate={video.uploadDate}
                                        onPlay={() => handleVideoClick(video)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600 z-10 transition-transform duration-200 hover:scale-110"
                        >
                            <ArrowRightCircle size={48} />
                        </button>
                    </div>

                    {/* Navigation dots */}
                    <div className="flex justify-center items-center mt-7 space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => goToPage(i)}
                                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                    (i === totalPages - 1 && currentIndex > videos.length - itemsPerPage) ||
                                    Math.floor(currentIndex / itemsPerPage) === i
                                        ? 'bg-green-500 ring-2 ring-green-300'
                                        : 'bg-gray-300 hover:bg-green-200'
                                }`}
                                aria-label={`Go to page ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {selectedVideo && (
                <VideoOverlay
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default VideoCarousel;