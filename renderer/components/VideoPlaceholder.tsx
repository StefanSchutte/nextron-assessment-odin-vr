import React from 'react';
import { Video } from 'lucide-react';

/**
 * Placeholder for video content thumbnail image
 *
 * @component
 */
const VideoPlaceholder = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
            <Video className="w-36 h-36 text-gray-400" />
        </div>
    );
};

export default VideoPlaceholder;