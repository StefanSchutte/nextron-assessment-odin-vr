const Guidelines = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6 text-gray-200">

                <h1 className="text-3xl font-bold mb-8">Nextron Assessment</h1>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Objective</h2>
                    <p className="mb-4">Develop a new page in Nextron with the following features:</p>

                    <div className="ml-4 mb-6">
                        <h3 className="text-xl font-semibold mb-2">1. Upload New Content</h3>
                        <p className="mb-2">o Allow users to upload video-only content.</p>
                        <p className="mb-2">o Additional fields to be included on the upload page (take inspiration from the Play Store):</p>
                        <ul className="ml-8 space-y-1">
                            <li>Title: A mandatory field for the content name.</li>
                            <li>Description: A text field to provide details about the video.</li>
                            <li>Category: A dropdown or tag-based field for content categorization.</li>
                            <li>Thumbnail: Allow users to upload an image to represent the video.</li>
                            <li>Video Duration: Automatically extracted from the uploaded video.</li>
                            <li>Publish/Private Option: A toggle to decide whether the video should be public or private.</li>
                        </ul>
                    </div>

                    <div className="ml-4 mb-6">
                        <h3 className="text-xl font-semibold mb-2">2. Rating and Review System</h3>
                        <p className="mb-2">o Enable users to:</p>
                        <ul className="ml-8 space-y-1">
                            <li>Submit Ratings: Allow users to rate the content (e.g., 1 to 5 stars).</li>
                            <li>Write Reviews: Include a text field for users to leave detailed feedback.</li>
                            <li>Reply to Reviews: Provide the option for the original content uploader or an admin to reply to individual reviews.</li>
                        </ul>
                    </div>

                    <div className="ml-4">
                        <h3 className="text-xl font-semibold mb-2">3. Edit and Remove Ratings/Reviews</h3>
                        <p className="mb-2">o Allow users to:</p>
                        <ul className="ml-8 space-y-1">
                            <li>Edit their submitted ratings and reviews.</li>
                            <li>Delete their own ratings and reviews if needed.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Guidelines</h2>
                    <ul className="ml-4 space-y-1">
                        <li>Use Nextron's best practices for development.</li>
                        <li>Ensure the UI is responsive and user-friendly.</li>
                        <li>Implement form validation for all fields (e.g., Title cannot be empty, only video files are accepted).</li>
                    </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Deliverables</h2>
                    <ul className="ml-4 space-y-1">
                        <li>Fully functional page integrated with the Nextron app.</li>
                        <li>A README file with instructions to set up and test the new feature.</li>
                        <li>Ensure the code is clean, modular, and well-commented.</li>
                    </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Optional Enhancements</h2>
                    <ul className="ml-4 space-y-1">
                        <li>Display average ratings and number of reviews below each video.</li>
                        <li>Add filtering options for reviews (e.g., Most Helpful, Recent).</li>
                        <li>Show review timestamps and sort reviews chronologically or by rating.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Guidelines;