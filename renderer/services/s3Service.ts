import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { ENV } from '@/config/env';
import { VideoMetadata, UploadResult } from "@/types/types";

const s3Client = new S3Client({
    region: ENV.AWS_REGION,
    credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = ENV.AWS_BUCKET_NAME;

if (!ENV.AWS_REGION || !ENV.AWS_ACCESS_KEY_ID || !ENV.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS configuration is missing. Please check your environment variables.');
}

/**
 * Service class for managing S3 operations
 * @class S3Service
 */
class S3Service {
    /**
     * Gets a signed URL for an S3 object
     * @private
     * @async
     * @param {string} key - The S3 key of the object
     * @returns {Promise<string>} The signed URL
     */
    private async getSignedUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    /**
     * Stores video metadata in S3
     * @private
     * @async
     * @param {VideoMetadata} metadata - The video metadata to store
     * @returns {Promise<void>}
     */
    private async storeVideoMetadata(metadata: VideoMetadata): Promise<void> {
        const metadataKey = `metadata/${metadata.id}.json`;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: metadataKey,
            Body: JSON.stringify(metadata),
            ContentType: 'application/json'
        });
        await s3Client.send(command);
    }

    /**
     * Reads video metadata from S3
     * @private
     * @async
     * @param {string} videoId - ID of the video to read metadata for
     * @returns {Promise<VideoMetadata | null>} The video metadata or null if not found
     */
    private async readVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
        try {
            const metadataKey = `metadata/${videoId}.json`;
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: metadataKey
            });
            const response = await s3Client.send(command);
            const contents = await response.Body?.transformToString();
            return contents ? JSON.parse(contents) : null;
        } catch (error) {
            console.error('Error reading video metadata:', error);
            return null;
        }
    }

    /**
     * Uploads a video file to S3
     * @async
     * @param {File} file - The video file to upload
     * @param {string} key - The key to use for the file in S3
     * @param {Omit<VideoMetadata, 'videoUrl' | 'thumbnailUrl' | 'thumbnailKey' | 'videoKey'>} metadata - The video metadata
     * @returns {Promise<UploadResult>} The result of the upload operation
     */
    async uploadVideo(file: File, key: string, metadata: Omit<VideoMetadata, 'videoUrl' | 'thumbnailUrl' | 'thumbnailKey' | 'videoKey'>): Promise<UploadResult> {
        try {
            const videoKey = `videos/${key}`;
            const fileBuffer = await file.arrayBuffer();

            const uploadCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: videoKey,
                Body: Buffer.from(fileBuffer),
                ContentType: file.type
            });

            await s3Client.send(uploadCommand);
            const videoUrl = await this.getSignedUrl(videoKey);

            const newVideo: VideoMetadata = {
                ...metadata,
                videoKey,
                videoUrl,
                thumbnailKey: '',
                thumbnailUrl: ''
            };

            await this.storeVideoMetadata(newVideo);
            return { success: true, key: videoKey, url: videoUrl };
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Uploads a thumbnail image for a video
     * @async
     * @param {File} file - The thumbnail file to upload
     * @param {string} key - The key to use for the file in S3
     * @param {string} videoId - ID of the video this thumbnail belongs to
     * @returns {Promise<UploadResult>} The result of the upload operation
     */
    async uploadThumbnail(file: File, key: string, videoId: string): Promise<UploadResult> {
        try {
            const thumbnailKey = `thumbnails/${key}`;
            const fileBuffer = await file.arrayBuffer();

            const uploadCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: thumbnailKey,
                Body: Buffer.from(fileBuffer),
                ContentType: file.type
            });

            await s3Client.send(uploadCommand);
            const thumbnailUrl = await this.getSignedUrl(thumbnailKey);

            // Update the video metadata
            const videoMetadata = await this.readVideoMetadata(videoId);
            if (videoMetadata) {
                const updatedMetadata = {
                    ...videoMetadata,
                    thumbnailKey,
                    thumbnailUrl
                };
                await this.storeVideoMetadata(updatedMetadata);
            }

            return { success: true, key: thumbnailKey, url: thumbnailUrl };
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Retrieves all videos with their metadata
     * @async
     * @returns {Promise<VideoMetadata[]>} Array of video metadata objects
     */
    async getAllVideos(): Promise<VideoMetadata[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: 'metadata/'
            });

            const response = await s3Client.send(command);
            if (!response.Contents) return [];

            // Read each metadata file and update URLs
            const videos = await Promise.all(
                response.Contents
                    .filter(item => item.Key?.endsWith('.json'))
                    .map(async (item) => {
                        if (!item.Key) return null;
                        const videoId = item.Key.split('/').pop()?.replace('.json', '');
                        if (!videoId) return null;

                        const metadata = await this.readVideoMetadata(videoId);
                        if (!metadata) return null;

                        // Update signed URLs
                        return {
                            ...metadata,
                            videoUrl: await this.getSignedUrl(metadata.videoKey),
                            thumbnailUrl: metadata.thumbnailKey ? await this.getSignedUrl(metadata.thumbnailKey) : ''
                        };
                    })
            );

            return videos.filter((video): video is VideoMetadata => video !== null);
        } catch (error) {
            console.error('Error getting videos:', error);
            return [];
        }
    }

    /**
     * Deletes a video and its associated files from S3
     * @async
     * @param {string} videoId - ID of the video to delete
     * @returns {Promise<{success: boolean; error?: string}>} Result of the delete operation
     */
    async deleteVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const metadata = await this.readVideoMetadata(videoId);
            if (!metadata) {
                throw new Error('Video not found');
            }

            if (metadata.videoKey) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: metadata.videoKey
                }));
            }

            if (metadata.thumbnailKey) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: metadata.thumbnailKey
                }));
            }

            await s3Client.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: `metadata/${videoId}.json`
            }));

            return { success: true };
        } catch (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export const s3Service = new S3Service();