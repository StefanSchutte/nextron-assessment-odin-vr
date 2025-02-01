import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReviewSection } from './ReviewSection';
import { getCurrentUser } from 'aws-amplify/auth';
import { VideoOverlayProps} from "@/types/types";
import VideoPlaceholder from "@/components/VideoPlaceholder";
import DeleteVideo from './DeleteVideo';

/**
 * Video overlay component that displays video playback and information
 * @component
 * @param {VideoOverlayProps} props - The props for the VideoOverlay component
 * @returns {JSX.Element} The rendered video overlay
 */
const VideoOverlay: React.FC<VideoOverlayProps> = ({ video, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    /**
     * Effect to manage body scroll behavior when overlay is open
     */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    /**
     * Effect to fetch and set current user information
     * @async
     */
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUserId(user.userId);
            } catch (err) {
                setCurrentUserId(null);
                toast.error('Please Login!');
            }
        };

        fetchCurrentUser();
    }, []);

    /**
     * Handles clicks on the backdrop to close the overlay
     * @param {React.MouseEvent} e - The click event
     */
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    /**
     * Handles video playback initiation
     */
    const handlePlayVideo = () => {
        setIsPlaying(true);
        toast.success('Starting video playback');
    };

    /**
     * Handles tab switching
     * @param {('details' | 'reviews')} tab - The tab to switch to
     */
    const handleTabSwitch = (tab: 'details' | 'reviews') => {
        setActiveTab(tab);
        if (!currentUserId && tab === 'reviews') {
            toast.error('Please sign in to access reviews');
            return;
        }
    };

    return (
        <>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
             onClick={handleBackdropClick}
             aria-hidden="true"
        />
            <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-700 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Main content container */}
                <div className="flex flex-row h-full">
                    {/* Video/Thumbnail Section */}
                    <div className="w-4/6 bg-black">
                        {isPlaying ? (
                            <video
                                src={video.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div
                                className="relative w-full h-full group cursor-pointer"
                                onClick={handlePlayVideo}
                            >
                                {/* Thumbnail */}
                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                ) : (
                                    <VideoPlaceholder />
                                )}

                                {/* Hover overlay + play button */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-950/0 group-hover:bg-gray-950/40 transition-all duration-300">
                                    <button className="transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                                        <Play
                                            className="w-16 h-16"
                                            color="#22c55e"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side content */}
                    <div className="w-2/6 flex flex-col border-l border-gray-600">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-600 px-4">
                            <button
                                className={`px-4 py-3 font-medium ${
                                    activeTab === 'details'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-100'
                                }`}
                                onClick={() => handleTabSwitch('details')}
                            >
                                Details
                            </button>
                            <button
                                className={`px-4 py-3 font-medium ${
                                    activeTab === 'reviews'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-100'
                                }`}
                                onClick={() => handleTabSwitch('reviews')}
                            >
                                Reviews
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'details' ? (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-100 break-words">{video.title}</h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex">
                                            <span className="text-gray-400 w-24">Date:</span>
                                            <span className="text-gray-200">{new Date(video.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-400 w-24">Category:</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{video.category}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-gray-400 w-24">Duration:</span>
                                            <span className="text-gray-200">{video.duration}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <span className="text-gray-400 block mb-2">Description:</span>
                                        <p className="text-gray-200 whitespace-pre-wrap break-words">{video.description}</p>
                                    </div>

                                    {currentUserId === video.userId && (
                                        <div className="flex justify-end mt-4">
                                            <DeleteVideo videoId={video.id} onDelete={onClose} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <ReviewSection videoId={video.id} currentUserId={currentUserId || ''} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default VideoOverlay;