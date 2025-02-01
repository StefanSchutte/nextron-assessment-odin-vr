import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { VideoCardProps } from '@/types/types'
import VideoPlaceholder from './VideoPlaceholder';

/**
 * A card component that displays video information with a thumbnail and play button.
 * @component
 * @param {VideoCardProps} props - The props for the VideoCard component
 * @returns {JSX.Element} The rendered video card
 */
const VideoCard: React.FC<VideoCardProps> = ({
                                                 title,
                                                 description,
                                                 thumbnailUrl,
                                                 videoUrl,
                                                 duration,
                                                 category,
                                                 uploadDate,
                                                 onPlay
                                             }: VideoCardProps): JSX.Element => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const formattedDate = new Date(uploadDate).toLocaleDateString();

    /**
     * Handles the successful loading of the thumbnail image
     * @function handleImageLoad
     */
    const handleImageLoad = () => {
        setImageLoading(false);
    };

    /**
     * Handles errors that occur while loading the thumbnail image
     * @function handleImageError
     */
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    return (
        <div
            className="bg-gray-200 rounded-lg shadow-md overflow-hidden group cursor-pointer"
            onClick={onPlay}
        >
            <div className="relative aspect-video bg-gray-200">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                {imageError ? (
                    <div className="w-full h-full">
                        <VideoPlaceholder />
                    </div>
                ) : (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm z-10">
                    {duration}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-950/0 group-hover:bg-gray-950/40 transition-all duration-300">
                    <Play
                        className="w-16 h-16 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                        color="#22c55e"
                    />
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-300">
                    {title}
                </h3>
            </div>
        </div>
    );
};

export default VideoCard;