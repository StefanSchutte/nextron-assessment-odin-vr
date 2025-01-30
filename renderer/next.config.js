/** @type {import('next').NextConfig} */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

module.exports = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.extensions.push('.ts', '.tsx');
    return config
  },
  env: {
    NEXT_PUBLIC_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME
  }
}