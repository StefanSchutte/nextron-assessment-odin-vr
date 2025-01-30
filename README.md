# Nextron Video-Upload Platform Assessment

A video platform feature built with Nextron, Next.js and AWS, allowing users to upload, view, rate, and review video content.

## Features

### Video Management
- **Upload Videos**
    - Support for various video formats (mp4, mkv, avi, mov, wmv, flv, webm)
    - Required metadata:
        - Title (required)
        - Description
        - Category selection
        - Custom thumbnail upload
        - Automatic video duration extraction
        - Public/Private visibility toggle

- **Video Display**
    - Carousel-based video browsing
    - Video preview with thumbnails
    - Playback in modal overlay
    - Duration display
    - Upload date
    - Category tags

### Rating & Review System
- **Ratings**
    - 5-star rating system
    - Average rating display
    - Total reviews counter
    - Visual star display

- **Reviews**
    - Text-based reviews
    - Edit functionality for own reviews
    - Delete option for own reviews
    - Reply system for video owners
    - Timestamps on reviews
    - Sort options (Recent/Rating)

### Authentication
- User signup/login system
- Email verification
- Protected routes for authenticated features

## Tech Stack

- **Frontend**
    - Next.js
    - React
    - TailwindCSS
    - React Hot Toast (notifications)
    - Lucide React (icons)

- **Backend/Services**
    - AWS S3 (video and image storage)
    - AWS Amplify (authentication)
    - AWS SDK

## Usage
### Video Upload

- Navigate to the upload page
- Fill in required video details
- Upload video file and thumbnail
- Toggle visibility setting
- Submit upload

### Rating & Reviews

- Click on a video to open overlay
- Switch to reviews tab
- Submit rating (1-5 stars)
- Write and submit review
- Edit/delete reviews using action buttons
- Reply to reviews (video owners only)

## API Documentation
### S3Service

- uploadVideo(file, key, metadata): Uploads video file with metadata
- uploadThumbnail(file, key, videoId): Uploads thumbnail for video
- getAllVideos(): Retrieves all accessible videos
- deleteVideo(videoId): Removes video and associated files

### ReviewService

- createReview(reviewData): Creates new review
- updateReview(reviewId, data): Updates existing review
- deleteReview(reviewId): Deletes review
- addReply(reviewId, replyData): Adds reply to review

## Authentication Flow

### User Registration

- Email input
- Password creation
- Email verification


### User Login

- Email/password authentication
- Session management
- Protected route access

## Installation

1. Clone the repository
```bash
git clone [repository-url]

## Usage

### Create an App

```
# with npx
$ npx create-nextron-app my-app --example with-tailwindcss

# with yarn
$ yarn create nextron-app my-app --example with-tailwindcss

# with pnpm
$ pnpm dlx create-nextron-app my-app --example with-tailwindcss
```

### Install Dependencies

```
$ cd my-app

# using yarn or npm
$ yarn (or `npm install`)

# using pnpm
$ pnpm install --shamefully-hoist
```

### Use it

```
# development mode
$ yarn dev (or `npm run dev` or `pnpm run dev`)

# production build
$ yarn build (or `npm run build` or `pnpm run build`)
```
