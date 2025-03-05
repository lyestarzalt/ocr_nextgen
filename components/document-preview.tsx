import {useRef, useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {OCRResults, TextLine} from '@/types';
import {Loader, Image as ImageIcon} from "lucide-react";

interface DocumentPreviewProps {
    filePreview: string | null;
    ocrResults: OCRResults | null;
    isLoading: boolean;
    onSelectBox: (index: number) => void;
    selectedBox: number | null;
}
function BoundingBox({
    id,
    text,
    top,
    left,
    width,
    height,
    isSelected,
    onClick,
}: {
    id: string;
    text: string;
    top: number;
    left: number;
    width: number;
    height: number;
    isSelected: boolean;
    onClick: () => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            id={id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                border: isSelected
                    ? '2px solid #1098ad'
                    : hovered
                        ? '2px dashed #1098ad'
                        : '1px solid rgba(16, 152, 173, 0.5)',
                backgroundColor: isSelected
                    ? 'rgba(16, 152, 173, 0.2)'
                    : hovered
                        ? 'rgba(16, 152, 173, 0.1)'
                        : 'transparent',
                cursor: 'pointer',
                borderRadius: '2px',
                zIndex: isSelected ? 100 : 10,
                transition: 'all 0.2s ease',
            }}
        >
            {(hovered || isSelected) && (
                <p
                    className="absolute -top-6 left-0 z-50 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-sm max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    {text}
                </p>
            )}
        </div>
    );
}
export function DocumentPreview({
    filePreview,
    ocrResults,
    isLoading,
    onSelectBox,
    selectedBox
}: DocumentPreviewProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [boxPositions, setBoxPositions] = useState<{
        top: number;
        left: number;
        width: number;
        height: number;
    }[]>([]);

    // Advanced box position calculation
    const calculateBoxPosition = (
        bbox: [number, number, number, number]
    ): {top: number; left: number; width: number; height: number} => {
        if (!imageRef.current) return {top: 0, left: 0, width: 0, height: 0};

        const imageRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        // Precise scaling calculation
        const scaleX = imageRect.width / imageRef.current.naturalWidth;
        const scaleY = imageRect.height / imageRef.current.naturalHeight;

        // Center offset calculation
        const offsetX = containerRect ?
            (containerRect.width - imageRect.width) / 2 : 0;
        const offsetY = containerRect ?
            (containerRect.height - imageRect.height) / 2 : 0;

        // Calculate box position with more precise scaling
        const calculatedBox = {
            left: bbox[0] * scaleX + imageRect.left - (containerRect?.left || 0),
            top: bbox[1] * scaleY + imageRect.top - (containerRect?.top || 0),
            width: (bbox[2] - bbox[0]) * scaleX,
            height: (bbox[3] - bbox[1]) * scaleY
        };

        return calculatedBox;
    };

    // Recalculate bounding box positions
    const updateBoxPositions = () => {
        if (!imageRef.current || !ocrResults) return;

        const newBoxPositions = ocrResults.text_lines.map(line =>
            calculateBoxPosition(line.bbox)
        );

        setBoxPositions(newBoxPositions);
    };

    // Add resize and load event listeners
    useEffect(() => {
        // Delay calculation to ensure image is fully rendered
        const timeoutId = setTimeout(updateBoxPositions, 100);

        const handleResize = () => {
            updateBoxPositions();
        };

        // Add multiple event listeners for thorough coverage
        window.addEventListener('resize', handleResize);
        imageRef.current?.addEventListener('load', updateBoxPositions);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            imageRef.current?.removeEventListener('load', updateBoxPositions);
        };
    }, [ocrResults, filePreview]);

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="px-3 py-2 flex flex-row items-center border-b">
                <CardTitle className="text-sm font-medium">Document Preview</CardTitle>
            </CardHeader>
            <CardContent
                className="p-3 flex-1 w-full relative"
                onClick={() => {
                    // Deselect box when clicking outside of boxes
                    onSelectBox(-1);
                }}
            >
                {filePreview ? (
                    <div
                        className="relative w-full h-full border border-border rounded-md overflow-hidden flex items-center justify-center"
                        ref={containerRef}
                        style={{height: 'calc(100vh - 12rem)'}}
                    >
                        <img
                            src={filePreview}
                            alt="Document preview"
                            className="max-w-full max-h-full object-contain"
                            ref={imageRef}
                        />

                        {ocrResults && boxPositions.map((box, index) => (
                            <BoundingBox
                                key={index}
                                id={`box-${index}`}
                                text={ocrResults.text_lines[index].text}
                                top={box.top}
                                left={box.left}
                                width={box.width}
                                height={box.height}
                                isSelected={selectedBox === index}
                                onClick={() => onSelectBox(index)}
                            />
                        ))}

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                                <Loader size={32} className="animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-md w-full"
                        style={{height: 'calc(100vh - 12rem)'}}
                    >
                        <ImageIcon size={48} className="mb-3 opacity-30" />
                        <p className="text-sm">Upload a document to see the preview</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}