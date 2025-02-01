import React, { useState, useEffect } from 'react';
import { HardDrive } from 'lucide-react';
import { s3Service } from '@/services/s3Service';
import toast from 'react-hot-toast';
import {StorageInfo} from "@/types/types";
import {Hub} from "aws-amplify/utils";

const STORAGE_CHANNEL = 'customStorage';

/**
 * A component that displays storage usage information with a visual progress bar
 * @component
 * @description
 * @returns {JSX.Element | null} The rendered storage indicator component or null if storage info is not yet loaded.
 */
const StorageIndicator: React.FC = () => {
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

    /**
     * Formats a byte value into a human-readable string with appropriate unit.
     * @param {number} bytes - The number of bytes to format
     * @returns {string} Formatted string with appropriate unit (Bytes, KB, MB, or GB)
     */
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    /**
     * Fetches the current storage usage information from S3
     * @async
     * @function fetchStorageInfo
     * @throws {Error} When S3 service call fails
     * @returns {Promise<void>}
     */
    const fetchStorageInfo = async () => {
        try {
            const info = await s3Service.getStorageInfo();
            setStorageInfo(info);
        } catch (error) {
            console.error('Error fetching storage info:', error);
            toast.error('Failed to fetch storage information');
        }
    };
    /**
     * Effect hook to fetch update storage information.
     */
    useEffect(() => {
        fetchStorageInfo();
        const interval = setInterval(fetchStorageInfo, 5 * 60 * 1000);

        const storageListener = Hub.listen(STORAGE_CHANNEL, (data) => {
            if (data.payload.event === 'storageUpdated') {
                fetchStorageInfo();
            }
        });

        const videoListener = Hub.listen('videos', (data) => {
            if (data.payload.event === 'videoUploaded') {
                fetchStorageInfo();
            }
        });

        return () => {
            clearInterval(interval);
            storageListener();
            videoListener();
        };
    }, []);

    if (!storageInfo) return null;

    const usagePercentage = (storageInfo.used / storageInfo.total) * 100;
    const colorClass = usagePercentage > 90 ? 'bg-red-600' :
        usagePercentage > 75 ? 'bg-yellow-500' :
            'bg-blue-600';

    return (
        <div className="fixed top-28 left-2 w-55 bg-gray-400 rounded-lg shadow-md p-3 z-50">
            <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Storage Usage</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${usagePercentage}%` }}
                />
            </div>
            <div className="flex flex-col text-sm mt-2 text-gray-700">
                <span>Used: {formatBytes(storageInfo.used)}</span>
                <span>Free: {formatBytes(storageInfo.available)}</span>
            </div>
        </div>
    );
};

export default StorageIndicator;