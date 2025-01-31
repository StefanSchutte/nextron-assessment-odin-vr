# Nextron Video-Upload Platform Assessment

A video platform feature built with Nextron, Next.js and AWS, allowing users to upload, view, rate, and review video content.

## Download Links

### Option 1: Direct Downloads
- [Windows Version (144 MB)](https://drive.google.com/file/d/1UPiREfzgmbBDdvlWB6YGYs5b2quaO5Ps/view?usp=drive_link)
- [Linux Version (179 MB)](https://drive.google.com/file/d/1WSB4kKWAAMP_jzv0-IbPRGix_V0jdA2W/view?usp=drive_link)

### Option 2: Google Drive Folder
Access all distribution files in our [Google Drive folder](https://drive.google.com/drive/folders/1p7KFYtpc_dWhm9PtvYIliBH_F_tYJdml)

## Features

### Video Management
- **Upload Videos**
    - Support for various video formats (mp4, mkv, avi, mov, wmv, flv, webm)
    - Thumbnail for video.
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
    - Nextron
    - Electron
    - Next.js
    - React
    - TailwindCSS
    - React Hot Toast (notifications)
    - Lucide React (icons)

- **Backend/Services**
    - AWS S3 (video and image storage)
    - AWS Amplify (authentication)
    - AWS SDK
    - AWS DynamoDB

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

## Running the Application

### Option 1: Quick Start with Pre-built Executable

#### For a quick preview of the application in action:

- In Download Link section in this readme.
- Download the zip file
- Unzip the contents
- Run the executable file


- Note: This version comes with pre-configured AWS services and will provide full functionality immediately.

### Option 2: Local Development Setup

##### If you want to run and develop the application locally, you'll need to configure your own AWS services:

- **Set up required AWS services:**

- Create an S3 bucket for video and thumbnail storage
- Set up Cognito User Pool for authentication
- Create IAM user with appropriate permissions
- Configure authentication flow

- **Create a .env.local file with the following AWS credentials:**
```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
NEXT_PUBLIC_AWS_REGION=your_region
NEXT_PUBLIC_AWS_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_AUTHENTICATION_FLOW_TYPE=USER_SRP_AUTH
```

## Installation

1. Clone the repository
```
git clone https://github.com/StefanSchutte/nextron-assessment-odin-vr

```

### Install Dependencies

```
# using yarn or npm
$ yarn (or `npm install`)

```

### Use it

```
# development mode
$ yarn dev (or `npm run dev` or `pnpm run dev`)

# production build
$ yarn build (or `npm run build` or `pnpm run build`)
```


