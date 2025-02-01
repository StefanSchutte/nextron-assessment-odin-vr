import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Switch from 'react-switch'
import { s3Service } from '@/services/s3Service';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from 'aws-amplify/auth';
import { FormData } from '@/types/types'
import {Hub} from "aws-amplify/utils";

const STORAGE_CHANNEL = 'customStorage';

/**
 * Form component for uploading videos with metadata
 * @component
 * @returns {JSX.Element} The rendered video upload form
 */
const VideoUploadForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        category: '',
        isPublic: true,
        duration: '',
    });

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        'Education', 'Entertainment', 'Gaming', 'Music',
        'Sports', 'Technology', 'Other'
    ];

    /**
     * Handles video file upload and metadata extraction
     * @param {ChangeEvent<HTMLInputElement>} e - The file input change event
     */
    const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoFile(file);
        toast.success('Video file selected successfully');

        try {
            const withinLimit = await s3Service.checkStorageLimit(file.size);
            if (!withinLimit) {
                const storageInfo = await s3Service.getStorageInfo();
                const availableMB = Math.floor(storageInfo.available / (1024 * 1024));
                toast.error(`File too large. Only ${availableMB}MB available.`);
                if (videoInputRef.current) {
                    videoInputRef.current.value = '';
                }
                setVideoFile(null);
                return;
            }

            const videoUrl = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'metadata';

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
                video.src = videoUrl;
            });

            const duration = Math.floor(video.duration);
            setFormData(prev => ({
                ...prev,
                duration: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`
            }));

            URL.revokeObjectURL(videoUrl);
        } catch (error) {
            toast.error('Error processing video file');
        }
    };

    /**
     * Handles thumbnail image upload
     * @param {ChangeEvent<HTMLInputElement>} e - The file input change event
     */
    const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setThumbnail(file);
            toast.success('Thumbnail selected successfully');
        } else {
            toast.error('Please select a valid image file');
        }
    };

    /**
     * Handles form submission and video upload process
     * @param {FormEvent<HTMLFormElement>} e - The form submission event
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setIsUploading(true);
        toast.loading('Starting upload...', { duration: 2000 });
        const uploadToastId = toast.loading('Preparing upload...');

        try {
            const { username } = await getCurrentUser();

            const videoId = uuidv4();
            const videoKey = `${uuidv4()}-${videoFile.name}`;
            const thumbnailKey = thumbnail ? `${uuidv4()}-${thumbnail.name}` : '';


            toast.loading('Uploading video...', { id: uploadToastId });

            const videoUploadResult = await s3Service.uploadVideo(videoFile, videoKey, {
                id: videoId,
                userId: username,
                title: formData.title,
                description: formData.description,
                category: formData.category.toLowerCase(),
                duration: formData.duration,
                isPublic: formData.isPublic,
                uploadDate: new Date().toISOString(),
            });

            if (!videoUploadResult.success) {
                throw new Error(videoUploadResult.error);
            }

            if (thumbnail && thumbnailKey) {
                toast.loading('Uploading thumbnail...', { id: uploadToastId });
                const thumbnailUploadResult = await s3Service.uploadThumbnail(thumbnail, thumbnailKey, videoId);
                if (!thumbnailUploadResult.success) {
                    throw new Error(thumbnailUploadResult.error);
                }
            }

            Hub.dispatch('videos', {
                event: 'videoUploaded',
                data: { videoId }
            });

            Hub.dispatch(STORAGE_CHANNEL, {
                event: 'storageUpdated'
            });

            setFormData({
                title: '',
                description: '',
                category: '',
                isPublic: true,
                duration: '',
            });
            setVideoFile(null);
            setThumbnail(null);

            toast.dismiss(uploadToastId);
            toast.success('Upload successful!');
        } catch (error) {
            toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-gray-400 rounded-lg shadow p-4 text-gray-700">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Video File*</label>
                    <div
                        className="border-2 border-dashed rounded-lg p-3 text-center bg-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-sm">{videoFile ? videoFile.name : 'Click to upload video'}</p>
                        <input
                            ref={videoInputRef}
                            type="file"
                            name="video"
                            accept="video/*, .mkv, .avi, .mov, .wmv, .flv, .mp4, .webm"
                            onChange={handleVideoUpload}
                            className="sr-only"
                            aria-label="Video file"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Title*</label>
                    <input
                        type="text"
                        className="w-full px-2 py-1.5 bg-gray-200 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        className="w-full px-2 py-1.5 bg-gray-200 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        className="w-full px-2 py-1.5 bg-gray-200 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category} value={category.toLowerCase()}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Thumbnail</label>
                    <div
                        className="border-2 bg-gray-200 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => thumbnailInputRef.current?.click()}
                    >
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-sm">{thumbnail ? thumbnail.name : 'Click to upload thumbnail'}</p>
                        <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Make video public</label>
                    <Switch
                        checked={formData.isPublic}
                        onChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                        onColor="#3B82F6"
                        offColor="#D1D5DB"
                        height={20}
                        width={40}
                    />
                </div>

                {formData.duration && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration</label>
                        <input
                            type="text"
                            className="w-full px-2 py-1.5 border rounded-lg bg-gray-50 text-sm"
                            value={formData.duration}
                            readOnly
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                    disabled={isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    );
};

export default VideoUploadForm;