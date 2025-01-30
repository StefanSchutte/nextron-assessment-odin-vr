import React from 'react';
import { Trash2 } from 'lucide-react';
import { s3Service } from '@/services/s3Service';
import toast from 'react-hot-toast';
import {DeleteVideoProps} from "@/types/types";

/**
 * A React component that renders a delete button for videos with confirmation toast notifications
 * @component
 * @param {DeleteVideoProps} props - The component props
 * @param {string} props.videoId - The unique identifier of the video to be deleted
 * @param {() => void} [props.onDelete] - Optional callback function to be executed after successful video deletion
 */
const DeleteVideo: React.FC<DeleteVideoProps> = ({ videoId, onDelete }) => {
    const handleDelete = async () => {
        try {
            await toast.promise(
                s3Service.deleteVideo(videoId),
                {
                    loading: 'Deleting video...',
                    success: (result) => {
                        if (result.success) {
                            onDelete?.();
                            window.location.reload();
                            return 'Video deleted successfully!';
                        }
                        throw new Error(result.error || 'Failed to delete video');
                    },
                    error: 'Failed to delete video'
                }
            );
        } catch (error) {
            toast.error('Error deleting video');
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="flex items-center px-2 py-2 border-2 border-[#ff0000] text-[#ff0000] rounded-lg hover:bg-white"

        >
            <Trash2 className="w-4 h-4 mr-2" color="red" />
            Delete
        </button>
    );
};

export default DeleteVideo;