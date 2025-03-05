import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Upload} from "lucide-react";

interface DocumentUploadProps {
    onFileChange: (file: File | null) => void;
    isLoading: boolean;
}

export function DocumentUpload({onFileChange, isLoading}: DocumentUploadProps) {
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFileName(file.name);
            onFileChange(file);
        } else {
            setFileName('');
            onFileChange(null);
        }
    };

    return (
        <Card className="w-full flex-grow"> {/* Added w-full and flex-grow */}
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-md">Upload Document</CardTitle>
                <CardDescription className="text-xs">Upload an image of an invoice, receipt, or document</CardDescription>
            </CardHeader>
            <CardContent className="p-4 w-full"> {/* Added w-full */}
                <div className="grid w-full gap-2">
                    <div className="grid w-full items-center gap-1.5">
                        <div className="flex items-center gap-2">
                            <Input
                                id="document-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="cursor-pointer text-xs h-9 w-full" // Added w-full
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                        </div>
                        {fileName && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {fileName}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}