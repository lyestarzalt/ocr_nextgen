import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ProcessResponse} from "@/types";
import {ScrollArea} from "@/components/ui/scroll-area";
import {CheckCircle2, XCircle, Sparkles} from "lucide-react";

interface ResultsDisplayProps {
    results: ProcessResponse | null;
}

export function ResultsDisplay({results}: ResultsDisplayProps) {
    if (!results) return null;

    const extractedData = results.extracted_data;
    const fields = Object.entries(extractedData);


    type ExtractedValue = string | number | boolean | object | null | undefined;

    const getDataTypeBadge = (value: ExtractedValue): string => {
        if (value === null || value === undefined) return "null";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        if (typeof value === "string") return "string";
        if (Array.isArray(value)) return "array";
        if (typeof value === "object") return "object";
        return "unknown";
    };

    // Function to render the value based on its type
    const renderValue = (value: ExtractedValue): React.ReactNode => {
        // Handle null or undefined
        if (value === null || value === undefined) {
            return <span className="italic text-muted-foreground">null</span>;
        }

        // Handle numbers
        if (typeof value === "number") {
            return <span className="font-mono">{value.toFixed(2)}</span>;
        }

        // Handle booleans
        if (typeof value === "boolean") {
            return (
                <div className="flex items-center">
                    {value ?
                        <><CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> <span>true</span></> :
                        <><XCircle className="h-4 w-4 text-red-500 mr-1" /> <span>false</span></>
                    }
                </div>
            );
        }

        // Handle strings
        if (typeof value === "string") {
            return value;
        }

        // Handle arrays and objects
        if (Array.isArray(value) || (typeof value === "object")) {
            return (
                <div className="bg-muted rounded p-2 mt-2 overflow-auto max-h-36">
                    <pre className="text-xs">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                </div>
            );
        }

        // Fallback for any other types
        return <span>{String(value)}</span>;
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="px-3 py-2 flex flex-row items-center justify-between border-b">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Extracted Data</CardTitle>
                </div>
                <Badge variant="outline">
                    {fields.length} fields
                </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-grow w-full">
                {fields.length > 0 ? (
                    <ScrollArea className="h-full w-full">
                        <div className="divide-y">
                            {fields.map(([key, value]) => (
                                <div key={key} className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-sm font-medium">{key}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {getDataTypeBadge(value)}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {renderValue(value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <p className="text-muted-foreground">No data extracted</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}