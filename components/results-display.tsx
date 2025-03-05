import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ProcessResponse} from "@/types";
import {ScrollArea} from "@/components/ui/scroll-area";
import {CheckCircle2, Sparkles} from "lucide-react";

interface ResultsDisplayProps {
    results: ProcessResponse | null;
}

export function ResultsDisplay({results}: ResultsDisplayProps) {
    if (!results) return null;

    const extractedData = results.extracted_data;
    const fields = Object.entries(extractedData);

    return (
        <Card className="w-full h-full flex flex-col"> {/* Added w-full */}
            <CardHeader className="px-3 py-2 flex flex-row items-center justify-between border-b">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Extracted Data</CardTitle>
                </div>
                <Badge variant="outline">
                    {fields.length} fields
                </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-grow w-full"> {/* Added w-full */}
                {fields.length > 0 ? (
                    <ScrollArea className="h-full w-full"> {/* Added w-full */}
                        <div className="divide-y">
                            {fields.map(([key, value]) => (
                                <div key={key} className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-sm font-medium">{key}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {typeof value === "number"
                                                ? "number"
                                                : Array.isArray(value)
                                                    ? "array"
                                                    : typeof value === "object" && value !== null
                                                        ? "object"
                                                        : "string"}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {typeof value === "number" ? (
                                            <span className="font-mono">{value.toFixed(2)}</span>
                                        ) : typeof value === "string" ? (
                                            value
                                        ) : Array.isArray(value) || (typeof value === "object" && value !== null) ? (
                                            <div className="bg-muted rounded p-2 mt-2 overflow-auto max-h-36">
                                                <pre className="text-xs">
                                                    {JSON.stringify(value, null, 2)}
                                                </pre>
                                            </div>
                                        ) : (
                                            <span className="italic text-muted-foreground">null</span>
                                        )}
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