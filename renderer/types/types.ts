/**
 * Interface for video metadata
 * @interface VideoMetadata
 * @property {string} id - Unique identifier for the video
 * @property {string} userId - ID of the user who uploaded the video
 * @property {string} title - Title of the video
 * @property {string} description - Description of the video
 * @property {string} thumbnailUrl - Signed URL for the video thumbnail
 * @property {string} thumbnailKey - S3 key for the thumbnail file
 * @property {string} videoUrl - Signed URL for the video file
 * @property {string} videoKey - S3 key for the video file
 * @property {string} duration - Duration of the video
 * @property {string} category - Category of the video
 * @property {string} uploadDate - Date when the video was uploaded
 * @property {boolean} isPublic - Whether the video is publicly accessible
 */
export interface VideoMetadata {
    id: string;
    userId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    thumbnailKey: string;
    videoUrl: string;
    videoKey: string;
    duration: string;
    category: string;
    uploadDate: string;
    isPublic: boolean;
}

/**
 * Type for upload operation results
 * @typedef {Object} UploadResult
 * @property {boolean} success - Whether the upload was successful
 * @property {string} [url] - The signed URL of the uploaded file
 * @property {string} [key] - The S3 key of the uploaded file
 * @property {string} [error] - Error message if upload failed
 */
export type UploadResult = {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

/**
 * Represents a review in the system
 *
 * @interface Review
 * @property {string} id - Unique identifier for the review, format: `${videoId}#${timestamp}`
 * @property {string} videoId - ID of the video being reviewed
 * @property {string} userId - ID of the user who created the review
 * @property {number} rating - Numerical rating, typically 1-5
 * @property {string} comment - Text content of the review
 * @property {string} createdAt - ISO timestamp of review creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {string} userEmail - Email of the user who created the review
 * @property {Reply[]} replies - Array of replies to this review
 */
export interface Review {
    id: string;
    videoId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    userEmail: string;
    replies: Reply[];
}

/**
 * Represents a reply to a review
 *
 * @interface Reply
 * @property {string} id - Unique identifier for the reply, format: `${reviewId}#${timestamp}`
 * @property {string} userId - ID of the user who created the reply
 * @property {string} content - Text content of the reply
 * @property {string} createdAt - ISO timestamp of reply creation
 * @property {string} userEmail - Email of the user who created the reply
 */
export interface Reply {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    userEmail: string;
}

/**
 * Data structure for updating a review
 * @interface UpdateReviewData
 * @property {string} comment - New comment text for the review
 * @property {number} rating - New rating value for the review
 */
export interface UpdateReviewData {
    comment: string;
    rating: number;
}

/**
 * Interface for form data state
 * @interface FormData
 * @property {string} title - Title of the video
 * @property {string} description - Description of the video
 * @property {string} category - Category of the video
 * @property {boolean} isPublic - Whether the video is public or private
 * @property {string} duration - Duration of the video in MM:SS format
 */
export interface FormData {
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
    duration: string;
}

/**
 * Props interface for the VideoOverlay component
 * @interface VideoOverlayProps
 * @property {Object} video - Video metadata object
 * @property {string} video.id - Unique identifier for the video
 * @property {string} video.title - Title of the video
 * @property {string} video.description - Description of the video
 * @property {string} video.thumbnailUrl - URL for the video thumbnail
 * @property {string} video.videoUrl - URL for the video content
 * @property {string} video.duration - Duration of the video
 * @property {string} video.category - Category of the video
 * @property {string} video.uploadDate - Upload date of the video
 * @property {string} video.userId - ID of the user who uploaded the video
 * @property {() => void} onClose - Callback function to close the overlay
 */
export interface VideoOverlayProps {
    video: {
        id: string;
        title: string;
        description: string;
        thumbnailUrl: string;
        videoUrl: string;
        duration: string;
        category: string;
        uploadDate: string;
        userId: string;
    };
    onClose: () => void;
}

/**
 * Props interface for the VideoCard component.
 * @interface VideoCardProps
 * @property {string} title - The title of the video
 * @property {string} description - The description of the video
 * @property {string} thumbnailUrl - URL of the video thumbnail image
 * @property {string} videoUrl - URL of the video content
 * @property {string} duration - Duration of the video in string format
 * @property {string} category - Category of the video
 * @property {string} uploadDate - ISO date string of when the video was uploaded
 * @property {() => void} onPlay - Callback function triggered when play button is clicked
 */
export interface VideoCardProps {
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
    uploadDate: string;
    onPlay: () => void;
}

/**
 * Props for the ReviewSection component.
 * @interface ReviewSectionProps
 * @property {string} videoId - Unique identifier for the video being reviewed
 * @property {string} currentUserId - ID of the currently authenticated user
 */
export interface ReviewSectionProps {
    videoId: string;
    currentUserId: string;
}

/**
 * Props for the StarRating subcomponent.
 * @interface StarRatingProps
 * @property {number} rating - The rating value (1-5)
 * @property {number} [size=20] - Optional size in pixels for the star icons
 */
export interface StarRatingProps {
    rating: number;
    size?: number;
}

/**
 * Interface for the DeleteVideo component props.
 * @interface DeleteVideoProps
 * @property {string} videoId - The unique identifier of the video to be deleted
 * @property {() => void} [onDelete] - Optional callback function to be executed after successful video deletion
 */
export interface DeleteVideoProps {
    videoId: string;
    onDelete?: () => void;
}

/**
 * Props interface for the VideoCarousel component
 * @interface VideoCarouselProps
 * @property {string} title - The title to display above the carousel
 * @property {VideoMetadata[]} videos - Array of video metadata objects to display in the carousel
 */
export interface VideoCarouselProps {
    title: string;
    videos: VideoMetadata[];
}