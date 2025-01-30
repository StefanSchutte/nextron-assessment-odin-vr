const Guidelines = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-gray-200 whitespace-pre-line">
            {`Nextron Assessment

Duration: 10 days from the day the task is received (negotiable upon request).

Objective
Develop a new page in Nextron with the following features:

1. Upload New Content
o Allow users to upload video-only content.
o Additional fields to be included on the upload page (take inspiration from the Play Store):
Title: A mandatory field for the content name.
Description: A text field to provide details about the video.
Category: A dropdown or tag-based field for content categorization.
Thumbnail: Allow users to upload an image to represent the video.
Video Duration: Automatically extracted from the uploaded video.
Publish/Private Option: A toggle to decide whether the video should be public or private.

2. Rating and Review System
o Enable users to:
Submit Ratings: Allow users to rate the content (e.g., 1 to 5 stars).
Write Reviews: Include a text field for users to leave detailed feedback.
Reply to Reviews: Provide the option for the original content uploader or an admin to reply to individual reviews.

3. Edit and Remove Ratings/Reviews
o Allow users to:
Edit their submitted ratings and reviews.
Delete their own ratings and reviews if needed.

Guidelines

Use Nextron's best practices for development.
Ensure the UI is responsive and user-friendly.
Implement form validation for all fields (e.g., Title cannot be empty, only video files are accepted).

Deliverables

Fully functional page integrated with the Nextron app.
A README file with instructions to set up and test the new feature.
Ensure the code is clean, modular, and well-commented.

Optional Enhancements

Display average ratings and number of reviews below each video.
Add filtering options for reviews (e.g., Most Helpful, Recent).
Show review timestamps and sort reviews chronologically or by rating.`}
        </div>
    );
};

export default Guidelines;