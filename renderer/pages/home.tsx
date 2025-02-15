import React from 'react'
import Head from 'next/head'
import VideoGrid from "@/components/VideoGrid";

/**
 * Home page component that displays a grid of videos.
 * @component
 */
export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Nextron Video Upload App</title>
      </Head>
        <div className="min-h-screen">
            <div className="w-full pt-12">
            <VideoGrid />
            </div>
        </div>
    </React.Fragment>
  )
}
