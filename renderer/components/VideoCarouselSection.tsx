import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import VideoOverlay from './VideoOverlay';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoMetadata, VideoCarouselProps } from '@/types/types';

/**
 * A section component that displays a carousel of video cards with navigation controls.
 * Handles responsive layout, video selection, and pagination.
 * @param {VideoCarouselProps} props - Component props
 * @param {string} props.title - The title displayed above the carousel
 * @param {VideoMetadata[]} props.videos - Array of video metadata to display
 * @returns {JSX.Element | null} Returns the carousel component if videos exist, null otherwise
 */
const VideoCarouselSection: React.FC<VideoCarouselProps> = ({ title, videos }) => {
    const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(4);

    useEffect(() => {
        /**
         * Updates the number of items displayed per page based on screen width
         * @function updateItemsPerPage
         * @private
         */
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
     * Handles video selection and displays loading toast
     * @function handleVideoClick
     * @private
     * @param {VideoMetadata} video - The selected video metadata
     */
    const handleVideoClick = (video: VideoMetadata) => {
        setSelectedVideo(video);
        toast.success('Loading video...', {
            duration: 2000
        });
    };

    /**
     * Advances the carousel to the next set of videos
     * @function nextSlide
     * @private
     * Loops back to start when reaching the end
     */
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + itemsPerPage;
            return nextIndex >= videos.length ? 0 : nextIndex;
        });
    };

    /**
     * Moves the carousel to the previous set of videos
     * @function prevSlide
     * @private
     * Loops to end when at the start
     */
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex - itemsPerPage;
            return nextIndex < 0 ? Math.max(videos.length - itemsPerPage, 0) : nextIndex;
        });
    };

    /**
     * Navigates to a specific page in the carousel
     * @function goToPage
     * @private
     * @param {number} pageIndex - The zero-based index of the target page
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
     * Retrieves the currently visible videos based on current index and items per page
     * @function getVisibleVideos
     * @private
     * @returns {VideoMetadata[]} Array of video metadata objects currently visible
     */
    const getVisibleVideos = (): VideoMetadata[] => {
        if (videos.length === 0) return [];
        const startIndex = currentIndex;
        const endIndex = Math.min(currentIndex + itemsPerPage, videos.length);
        return videos.slice(startIndex, endIndex);
    };

    if (videos.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-8">{title}</h2>
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

                <div className="flex justify-center items-center mt-7 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                (i === totalPages - 1 && currentIndex >= Math.max(0, videos.length - itemsPerPage)) ||
                                (i === currentPage && currentIndex < Math.max(0, videos.length - itemsPerPage))
                                    ? 'bg-green-500 ring-2 ring-green-300'
                                    : 'bg-gray-300 hover:bg-green-200'
                            }`}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {selectedVideo && (
                <VideoOverlay
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default VideoCarouselSection;