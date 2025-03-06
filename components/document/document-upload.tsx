import {useState, useCallback} from 'react';
import {Card, CardContent} from "@/components/ui/card";
import {Upload} from "lucide-react";

interface DocumentUploadProps {
    onFileChange: (file: File | null) => void;
    isLoading: boolean;
}

export function DocumentUpload({onFileChange, isLoading}: DocumentUploadProps) {
    const [fileName, setFileName] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleFileChange = useCallback((file: File | null) => {
        if (file) {
            setFileName(file.name);
            onFileChange(file);
        } else {
            setFileName('');
            onFileChange(null);
        }
    }, [onFileChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.match('image/png|image/jpeg|image/jpg|application/pdf')) {
                handleFileChange(file);
            }
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-3">
                <div
                    className={`border-2 border-dashed rounded-md ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                        } cursor-pointer flex flex-col items-center justify-center py-3 px-2 transition-colors`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">Drop invoice or receipt here or click to browse</p>
                    {fileName ? (
                        <p className="text-xs text-primary mt-1">{fileName}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">Accepts PNG, JPG, JPEG or PDF</p>


                    )}
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"

                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}