'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Badge} from '@/components/ui/badge';
import {toast} from 'sonner';
import {Loader, FileCheck, AlertCircle, PersonStanding} from 'lucide-react';
import ImageWithDetection from './ImageWithDetection';

// Define proper types for the verification result
interface FacialArea {
    x: number;
    y: number;
    w: number;
    h: number;
    left_eye?: [number, number] | null;
    right_eye?: [number, number] | null;
}

interface FacialAreas {
    img1?: FacialArea;
    img2?: FacialArea;
}

interface VerificationResult {
    verified: boolean;
    distance?: number | null;
    threshold?: number | null;
    model: string;
    detector_backend: string;
    similarity_metric?: string | null;
    facial_areas?: FacialAreas | null;
    time?: number | null;
    error?: string | null;
    error_details?: string | null;
    img1_real?: boolean | null;
    img2_real?: boolean | null;
    processing_time?: number | null;
}

// Main component
const FaceVerification = () => {
    // State for face image files
    const [faceFile1, setFaceFile1] = useState<File | null>(null);
    const [facePreview1, setFacePreview1] = useState<string | null>(null);

    const [faceFile2, setFaceFile2] = useState<File | null>(null);
    const [facePreview2, setFacePreview2] = useState<string | null>(null);

    // Verification options
    const [modelName, setModelName] = useState<string>('Facenet512');
    const [detector, setDetector] = useState<string>('retinaface');
    const [enforceDetection, setEnforceDetection] = useState<boolean>(false);
    const [antiSpoofing, setAntiSpoofing] = useState<boolean>(false);

    // Result state with proper typing
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    // Handle face file changes
    const handleFaceChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFaceFile1(file);
            const imageUrl = URL.createObjectURL(file);
            setFacePreview1(imageUrl);
        }
    };

    const handleFaceChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFaceFile2(file);
            const imageUrl = URL.createObjectURL(file);
            setFacePreview2(imageUrl);
        }
    };

    // Verify face to face
    const verifyFaces = async () => {
        if (!faceFile1 || !faceFile2) {
            toast.error('Please upload both face images');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('img1', faceFile1);
            formData.append('img2', faceFile2);
            formData.append('model_name', modelName);
            formData.append('detector_backend', detector);
            formData.append('enforce_detection', String(enforceDetection));
            formData.append('anti_spoofing', String(antiSpoofing));

            // Use face verification endpoint
            const response = await fetch('http://127.0.0.1:6589/verify/faces', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResult(data);

            if (data.verified) {
                toast.success('Face verification successful!');
            } else if (data.error) {
                toast.error(`Verification failed: ${data.error}`);
            } else {
                toast.error('Faces do not match');
            }
        } catch (error) {
            toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-wrapper">
            <div className="container py-4">
                <div className="content-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Face Verification</CardTitle>
                                    <CardDescription>
                                        Verify if two face photos match
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Face 1 Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="face-upload-1">Face Photo 1</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-md p-6 cursor-pointer flex flex-col items-center justify-center ${facePreview1 ? 'border-primary' : 'border-muted-foreground/20'}`}
                                            onClick={() => document.getElementById('face-upload-1')?.click()}
                                        >
                                            {facePreview1 ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <img
                                                        src={facePreview1}
                                                        alt="Face 1 preview"
                                                        className="max-h-36 object-contain"
                                                    />
                                                    <span className="text-xs text-muted-foreground">Click to change</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <PersonStanding className="h-10 w-10 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-medium">Upload first face image</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Drag & drop or click to browse
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                id="face-upload-1"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFaceChange1}
                                            />
                                        </div>
                                    </div>

                                    {/* Face 2 Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="face-upload-2">Face Photo 2</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-md p-6 cursor-pointer flex flex-col items-center justify-center ${facePreview2 ? 'border-primary' : 'border-muted-foreground/20'}`}
                                            onClick={() => document.getElementById('face-upload-2')?.click()}
                                        >
                                            {facePreview2 ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <img
                                                        src={facePreview2}
                                                        alt="Face 2 preview"
                                                        className="max-h-36 object-contain"
                                                    />
                                                    <span className="text-xs text-muted-foreground">Click to change</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <PersonStanding className="h-10 w-10 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-medium">Upload second face image</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Drag & drop or click to browse
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                id="face-upload-2"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFaceChange2}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Common Options */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="model-select">Recognition Model</Label>
                                            <Select
                                                value={modelName}
                                                onValueChange={setModelName}
                                            >
                                                <SelectTrigger id="model-select">
                                                    <SelectValue placeholder="Select model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Facenet512">Facenet512 (Recommended)</SelectItem>
                                                    <SelectItem value="Facenet">Facenet</SelectItem>
                                                    <SelectItem value="VGG-Face">VGG-Face</SelectItem>
                                                    <SelectItem value="ArcFace">ArcFace</SelectItem>
                                                    <SelectItem value="Dlib">Dlib</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="detector-select">Face Detector</Label>
                                            <Select
                                                value={detector}
                                                onValueChange={setDetector}
                                            >
                                                <SelectTrigger id="detector-select">
                                                    <SelectValue placeholder="Select detector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="retinaface">RetinaFace (Best)</SelectItem>
                                                    <SelectItem value="mtcnn">MTCNN</SelectItem>
                                                    <SelectItem value="opencv">OpenCV (Faster)</SelectItem>
                                                    <SelectItem value="ssd">SSD</SelectItem>
                                                    <SelectItem value="yolov8">YOLOv8</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="enforce-detection"
                                                checked={enforceDetection}
                                                onCheckedChange={setEnforceDetection}
                                            />
                                            <Label htmlFor="enforce-detection">Enforce Detection</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="anti-spoofing"
                                                checked={antiSpoofing}
                                                onCheckedChange={setAntiSpoofing}
                                            />
                                            <Label htmlFor="anti-spoofing">Anti-Spoofing</Label>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={verifyFaces}
                                        disabled={!faceFile1 || !faceFile2 || loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck className="mr-2 h-4 w-4" />
                                                Verify Faces
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Results Panel */}
                        <div>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Verification Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-60">
                                            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                                            <p className="text-sm text-muted-foreground">Processing...</p>
                                        </div>
                                    ) : result ? (
                                        <div className="space-y-6">
                                            {/* Display the match badge */}
                                            <div className="flex items-center justify-center py-4">
                                                {result.verified ? (
                                                    <Badge className="text-lg px-4 py-2 bg-green-600">MATCH</Badge>
                                                ) : (
                                                    <Badge className="text-lg px-4 py-2 bg-red-600">NO MATCH</Badge>
                                                )}
                                            </div>

                                            {/* Display detected images with facial areas */}
                                            <div className="flex flex-wrap gap-4 justify-center">
                                                {facePreview1 && (
                                                    <ImageWithDetection
                                                        imageUrl={facePreview1}
                                                        facialArea={result.facial_areas?.img1}
                                                        label="Face 1"
                                                    />
                                                )}

                                                {facePreview2 && (
                                                    <ImageWithDetection
                                                        imageUrl={facePreview2}
                                                        facialArea={result.facial_areas?.img2}
                                                        label="Face 2"
                                                    />
                                                )}
                                            </div>

                                            {result.error ? (
                                                <div className="rounded-md bg-red-50 dark:bg-red-950/25 p-4">
                                                    <div className="flex items-start">
                                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                                                        <div>
                                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                                                {result.error}
                                                            </h3>
                                                            {result.error_details && (
                                                                <p className="text-xs mt-1 text-red-700 dark:text-red-300/80">
                                                                    {result.error_details}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Similarity Score */}
                                                    {result.distance !== null && result.distance !== undefined && (
                                                        <div className="space-y-2">
                                                            <Label>Similarity</Label>
                                                            <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                                                                <div
                                                                    className={`h-full ${result.verified ? 'bg-green-500' : 'bg-red-500'}`}
                                                                    style={{
                                                                        width: `${result.distance <= 1
                                                                            ? Math.max(0, 100 - (result.distance * 100))
                                                                            : 0}%`
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                <span>Different</span>
                                                                <span>
                                                                    {result.distance?.toFixed(4)} / Threshold: {result.threshold?.toFixed(4)}
                                                                </span>
                                                                <span>Same</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Processing Details */}
                                                    <div className="space-y-2">
                                                        <Label>Technical Details</Label>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between py-1 border-b border-muted">
                                                                <span className="text-muted-foreground">Model</span>
                                                                <span>{result.model}</span>
                                                            </div>
                                                            <div className="flex justify-between py-1 border-b border-muted">
                                                                <span className="text-muted-foreground">Detector</span>
                                                                <span>{result.detector_backend}</span>
                                                            </div>
                                                            <div className="flex justify-between py-1 border-b border-muted">
                                                                <span className="text-muted-foreground">Processing Time</span>
                                                                <span>{result.processing_time ? `${result.processing_time.toFixed(2)}s` : 'N/A'}</span>
                                                            </div>
                                                            {(result.img1_real !== undefined || result.img2_real !== undefined) && (
                                                                <div className="flex justify-between py-1 border-b border-muted">
                                                                    <span className="text-muted-foreground">Anti-Spoofing</span>
                                                                    <div className="flex gap-2">
                                                                        {result.img1_real !== undefined && (
                                                                            <Badge className={result.img1_real ? "bg-green-600" : "bg-red-600"}>
                                                                                Image 1: {result.img1_real ? "Pass" : "Fail"}
                                                                            </Badge>
                                                                        )}
                                                                        {result.img2_real !== undefined && (
                                                                            <Badge className={result.img2_real ? "bg-green-600" : "bg-red-600"}>
                                                                                Image 2: {result.img2_real ? "Pass" : "Fail"}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-60 text-center">
                                            <div className="h-8 w-8 text-muted-foreground mb-4">
                                                <PersonStanding size={32} />
                                            </div>
                                            <p className="text-muted-foreground">
                                                Upload two face images to see verification results
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceVerification;