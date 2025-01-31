import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Star, Edit2, Trash2, MessageSquare, X, Plus } from 'lucide-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { reviewService } from '@/services/reviewService';
import { Review, Reply, UpdateReviewData, ReviewSectionProps, StarRatingProps } from '@/types/types'

/**
 * Component for managing and displaying video reviews.
 * @component
 * @param {ReviewSectionProps} props - Component props
 * @returns {JSX.Element} The rendered review section
 */
export const ReviewSection: React.FC<ReviewSectionProps> = ({ videoId, currentUserId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [editingRating, setEditingRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const router = useRouter();

    useEffect(() => {
        /**
         * Fetches the current user's email from AWS Amplify.
         * @async
         * @function fetchUserEmail
         * @throws {Error} If user fetching fails
         */
        const fetchUserEmail = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUserEmail(user.signInDetails?.loginId || null);
            } catch (err) {
                setCurrentUserEmail(null);
            }
        };

        fetchUserEmail();
        fetchReviews();
    }, [videoId]);

    /**
     * Fetches all reviews for the current video.
     * @async
     * @function fetchReviews
     * @throws {Error} If review fetching fails
     */
    const fetchReviews = async () => {
        try {
            const fetchedReviews = await reviewService.getVideoReviews(videoId);
            setReviews(fetchedReviews);
        } catch (error) {
            toast.error('Error fetching reviews');
        }
    };

    /**
     * Handles the submission of a new review.
     * @async
     * @function handleSubmitReview
     * @param {React.FormEvent} e - Form submission event
     * @throws {Error} If review submission fails
     */
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserEmail || newRating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const newReviewObj = await reviewService.createReview({
                userId: currentUserId,
                videoId,
                rating: newRating,
                comment: newReview,
                userEmail: currentUserEmail,
                replies: []
            });

            setReviews([...reviews, newReviewObj]);
            setNewRating(0);
            setNewReview('');
            setShowReviewForm(false);
            toast.success('Review submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handles updating an existing review
     * @async
     * @function handleUpdateReview
     * @param {string} reviewId - ID of the review to update
     * @throws {Error} If review update fails
     */
    const handleUpdateReview = async (reviewId: string) => {
        try {
            const updateData: UpdateReviewData = {
                comment: editingContent,
                rating: editingRating
            };

            const updatedReview = await reviewService.updateReview(reviewId, updateData);
            const updatedReviews = reviews.map(review =>
                review.id === reviewId ? updatedReview : review
            );
            setReviews(updatedReviews);
            setEditingReview(null);
            setEditingContent('');
            setEditingRating(0);
            toast.success('Review updated successfully!');
        } catch (error) {
            toast.error('Failed to update review');
        }
    };

    /**
     * Handles deleting a review.
     * @async
     * @function handleDeleteReview
     * @param {string} reviewId - ID of the review to delete
     * @throws {Error} If review deletion fails
     */
    const handleDeleteReview = async (reviewId: string) => {

        try {
            await toast.promise(
                reviewService.deleteReview(reviewId),
                {
                    loading: 'Deleting review...',
                    success: () => {
                        const filteredReviews = reviews.filter(review => review.id !== reviewId);
                        setReviews(filteredReviews);
                        return 'Review deleted successfully!';
                    },
                    error: 'Failed to delete review'
                }
            );
        } catch (error) {
            toast.error('Error deleting review');
        }
    };

    /**
     * Handles submitting a reply to a review.
     * @async
     * @function handleSubmitReply
     * @param {string} reviewId - ID of the review to reply to
     * @throws {Error} If reply submission fails
     */
    const handleSubmitReply = async (reviewId: string) => {
        if (!currentUserEmail || !replyContent) {
            toast.error('Please write a reply first');
            return;
        }

        try {
            const updatedReview = await reviewService.addReply(reviewId, {
                userId: currentUserId,
                content: replyContent,
                userEmail: currentUserEmail
            });

            const updatedReviews = reviews.map(review =>
                review.id === reviewId ? updatedReview : review
            );

            setReviews(updatedReviews);
            setReplyContent('');
            setReplyingTo(null);
            toast.success('Reply added successfully!');
        } catch (error) {
            toast.error('Failed to add reply');
        }
    };

    /**
     * Renders star rating display
     * @component
     * @param {StarRatingProps} props - Star rating props
     * @returns {JSX.Element} Star rating display
     */
    const StarRating = ({ rating, size = 20 }: StarRatingProps) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        color="#facc15"
                        fill={star <= rating ? "#facc15" : "none"}
                    />
                ))}
            </div>
        );
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

    const averageRating = reviews.length
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        : 0;

    // Rating summary component that's always visible
    const RatingSummary = () => (
        <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-100">
                {averageRating.toFixed(1)}
            </div>
            <div>
                <StarRating rating={Math.round(averageRating)} size={24} />
                <div className="text-sm text-gray-300">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
            </div>
        </div>
    );

    if (!currentUserEmail) {
        return (
            <div className="space-y-6">
                <RatingSummary />

                <div className="mt-8 text-center p-8 border border-gray-600 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">
                        Sign in required for Reviews
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Sign in to share your thoughts and see what others are saying.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* Rating Summary */}
            <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-gray-100">
                    {averageRating.toFixed(1)}
                </div>
                <div>
                    <StarRating rating={Math.round(averageRating)} size={24} />
                    <div className="text-sm text-gray-300">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex justify-between items-center">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'helpful')}
                    className="px-3 py-2 border rounded-lg text-gray-700"
                >
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                </select>

                {!showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Write Review</span>
                    </button>
                )}
            </div>

            {/* New Review Form */}
            {showReviewForm && (
                <div className="border border-gray-100 bg-gray-600 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-100">Write Your Review</h3>
                        <button
                            onClick={() => {
                                setShowReviewForm(false);
                                setNewRating(0);
                                setNewReview('');
                            }}
                            className="text-gray-300 hover:text-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="hover:opacity-80"
                                >
                                    <Star
                                        size={24}
                                        color="#facc15"
                                        fill={star <= newRating ? "#facc15" : "none"}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Write your review..."
                            className="w-full px-3 py-2 border rounded-lg text-gray-950"
                            rows={4}
                            required
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setNewRating(0);
                                    setNewReview('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || newRating === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {sortedReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{review.userEmail}</span>
                                        <span className="text-gray-400 text-sm mb-1">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} size={16} />
                            </div>

                            {review.userId === currentUserId && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingReview(review.id);
                                            setEditingContent(review.comment);
                                            setEditingRating(review.rating);
                                        }}
                                        className="text-gray-300 hover:text-blue-600"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="text-gray-300 hover:text-blue-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {editingReview === review.id ? (
                            <div className="mt-2 space-y-2 border border-gray-100 bg-gray-600 p-6 rounded-lg">
                                <div className="flex space-x-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditingRating(star)}
                                            className="hover:opacity-80"
                                        >
                                            <Star
                                                size={24}
                                                color="#facc15"
                                                fill={star <= editingRating ? "#facc15" : "none"}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-gray-950"
                                    rows={4}
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateReview(review.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingReview(null);
                                            setEditingContent('');
                                            setEditingRating(0);
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p className="text-gray-300">{typeof review.comment === 'string' ? review.comment : ''}</p>
                            </div>
                        )}

                        {/* Replies Section */}
                        <div className="mt-4 pl-6 space-y-4">
                            {review.replies.map((reply) => (
                                <div key={reply.id} className="bg-gray-400 p-4 rounded-lg">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{reply.userEmail}</span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(reply.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-2">{reply.content}</p>
                                </div>
                            ))}

                            {replyingTo === review.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write your reply..."
                                        className="w-full px-3 py-2 border rounded-lg text-gray-950"
                                        rows={2}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSubmitReply(review.id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Submit Reply
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReplyingTo(null);
                                                setReplyContent('');
                                            }}
                                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review.id)}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Reply</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;