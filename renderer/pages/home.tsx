import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import VideoGrid from "@/components/VideoGrid";

/**
 * Home page component that displays a grid of videos.
 * @component
 */
export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Nextron Assessment Odin VR</title>
      </Head>
        <div className="min-h-screen">
            <VideoGrid />
        </div>
    </React.Fragment>
  )
}
