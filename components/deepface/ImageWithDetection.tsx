'use client';

import {useState} from 'react';

interface FacialArea {
    x: number;
    y: number;
    w: number;
    h: number;
    left_eye?: [number, number] | null;
    right_eye?: [number, number] | null;
}

interface ImageWithDetectionProps {
    imageUrl: string;
    facialArea: FacialArea | null | undefined;
    label: string;
}

const ImageWithDetection = ({imageUrl, facialArea, label}: ImageWithDetectionProps) => {
    const [imgDimensions, setImgDimensions] = useState({width: 0, height: 0});

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        setImgDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
        });
    };

    return (
        <div className="relative inline-block">
            <img
                src={imageUrl}
                alt={label}
                className="max-h-48 object-contain"
                onLoad={handleImageLoad}
            />
            {facialArea && imgDimensions.width > 0 && (
                <div
                    className="absolute border-2 border-green-500 pointer-events-none"
                    style={{
                        left: `${(facialArea.x / imgDimensions.width) * 100}%`,
                        top: `${(facialArea.y / imgDimensions.height) * 100}%`,
                        width: `${(facialArea.w / imgDimensions.width) * 100}%`,
                        height: `${(facialArea.h / imgDimensions.height) * 100}%`
                    }}
                >
                    {/* Eyes indicators if available */}
                    {facialArea.left_eye && (
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full"
                            style={{
                                left: `${((facialArea.left_eye[0] - facialArea.x) / facialArea.w) * 100}%`,
                                top: `${((facialArea.left_eye[1] - facialArea.y) / facialArea.h) * 100}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                    {facialArea.right_eye && (
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full"
                            style={{
                                left: `${((facialArea.right_eye[0] - facialArea.x) / facialArea.w) * 100}%`,
                                top: `${((facialArea.right_eye[1] - facialArea.y) / facialArea.h) * 100}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                </div>
            )}
            <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                {label}
            </div>
        </div>
    );
};

export default ImageWithDetection;