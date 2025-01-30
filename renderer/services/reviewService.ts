import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand
} from '@aws-sdk/lib-dynamodb';
import { ENV } from '@/config/env';
import { getCurrentUser } from 'aws-amplify/auth';
import { Review, Reply, UpdateReviewData } from '@/types/types'

/**
 * Initialize DynamoDB client with ENV config
 */
const client = new DynamoDBClient({
    region: ENV.AWS_REGION,
    credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY
    }
});

if (!ENV.AWS_REGION || !ENV.AWS_ACCESS_KEY_ID || !ENV.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS configuration is missing. Please check your environment variables.');
}

const docClient = DynamoDBDocumentClient.from(client);

export const reviewService = {
    /**
     * Creates a new review for a video
     * @async
     * @param {Omit<Review, 'id' | 'createdAt' | 'updatedAt'>} review - Review data without system-generated fields
     * @returns {Promise<Review>} The created review with all fields populated
     * @throws {Error} If the database operation fails
     */
    async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
        const timestamp = new Date().toISOString();
        const reviewId = `${review.videoId}#${timestamp}`;

        const newReview: Review = {
            ...review,
            id: reviewId,
            createdAt: timestamp,
            updatedAt: timestamp,
            replies: []
        };

        await docClient.send(new PutCommand({
            TableName: 'Reviews',
            Item: newReview
        }));

        return newReview;
    },

    /**
     * Retrieves all reviews for a specific video
     * @async
     * @param {string} videoId - ID of the video to get reviews for
     * @returns {Promise<Review[]>} Array of reviews for the video
     * @throws {Error} If the database query fails
     */
    async getVideoReviews(videoId: string): Promise<Review[]> {
        const response = await docClient.send(new QueryCommand({
            TableName: 'Reviews',
            IndexName: 'videoId-index',
            KeyConditionExpression: 'videoId = :videoId',
            ExpressionAttributeValues: {
                ':videoId': videoId
            }
        }));

        return response.Items as Review[];
    },

    /**
     * Updates an existing review
     * @async
     * @param {string} reviewId - ID of the review to update
     * @param {UpdateReviewData} data - New data for the review
     * @returns {Promise<Review>} The updated review
     * @throws {Error} If review not found, user unauthorized, or database operation fails
     */
    async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
        const getResult = await docClient.send(new GetCommand({
            TableName: 'Reviews',
            Key: { id: reviewId }
        }));

        const review = getResult.Item as Review;
        if (!review) {
            throw new Error('Review not found');
        }

        const currentUser = await getCurrentUser();
        const currentUserId = currentUser.userId;

        if (review.userId !== currentUserId) {
            throw new Error('Unauthorized to edit this review');
        }

        const response = await docClient.send(new UpdateCommand({
            TableName: 'Reviews',
            Key: { id: reviewId },
            UpdateExpression: 'set #c = :comment, #r = :rating, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#c': 'comment',
                '#r': 'rating'
            },
            ExpressionAttributeValues: {
                ':comment': data.comment,
                ':rating': data.rating,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        }));

        return response.Attributes as Review;
    },

    /**
     * Deletes a review
     * @async
     * @param {string} reviewId - ID of the review to delete
     * @returns {Promise<void>}
     * @throws {Error} If review not found, user unauthorized, or database operation fails
     */
    async deleteReview(reviewId: string): Promise<void> {

        const getResult = await docClient.send(new GetCommand({
            TableName: 'Reviews',
            Key: { id: reviewId }
        }));

        const review = getResult.Item as Review;
        if (!review) {
            throw new Error('Review not found');
        }

        const currentUser = await getCurrentUser();
        const currentUserId = currentUser.userId;

        if (review.userId !== currentUserId) {
            throw new Error('Unauthorized to delete this review');
        }

        await docClient.send(new DeleteCommand({
            TableName: 'Reviews',
            Key: { id: reviewId }
        }));
    },

    /**
     * Adds a reply to an existing review
     * @async
     * @param {string} reviewId - ID of the review to add reply to
     * @param {Omit<Reply, 'id' | 'createdAt'>} reply - Reply data without system-generated fields
     * @returns {Promise<Review>} The review with the new reply added
     * @throws {Error} If the database operation fails
     */
    async addReply(reviewId: string, reply: Omit<Reply, 'id' | 'createdAt'>): Promise<Review> {
        const newReply: Reply = {
            ...reply,
            id: `${reviewId}#${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        const response = await docClient.send(new UpdateCommand({
            TableName: 'Reviews',
            Key: { id: reviewId },
            UpdateExpression: 'set replies = list_append(if_not_exists(replies, :empty_list), :reply)',
            ExpressionAttributeValues: {
                ':reply': [newReply],
                ':empty_list': []
            },
            ReturnValues: 'ALL_NEW'
        }));

        return response.Attributes as Review;
    },

    /**
     * Calculates the average rating for a video
     * @async
     * @param {string} videoId - ID of the video to calculate average rating for
     * @returns {Promise<{average: number, count: number}>} Object containing average rating and total review count
     * @throws {Error} If the database query fails
     */
    async getAverageRating(videoId: string): Promise<{ average: number; count: number }> {
        const reviews = await this.getVideoReviews(videoId);
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return {
            average: reviews.length ? total / reviews.length : 0,
            count: reviews.length
        };
    }
};

export default reviewService;