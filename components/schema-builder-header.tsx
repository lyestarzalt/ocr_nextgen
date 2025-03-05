import {CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {LayoutTemplate, Info} from "lucide-react";

interface SchemaBuilderHeaderProps {
    selectedTemplate: string;
    onTemplateChange: (value: string) => void;
}

export function SchemaBuilderHeader({selectedTemplate, onTemplateChange}: SchemaBuilderHeaderProps) {
    return (
        <CardHeader className="px-3 py-2 flex flex-row items-center justify-between border-b">
            <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                    <LayoutTemplate className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Schema Definition</CardTitle>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Define fields to extract from the document</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Select
                value={selectedTemplate}
                onValueChange={onTemplateChange}
            >
                <SelectTrigger className="h-7 text-xs w-[130px]">
                    <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="custom">Custom Schema</SelectItem>
                    <SelectItem value="invoice">Invoice Template</SelectItem>
                    <SelectItem value="receipt">Receipt Template</SelectItem>
                    <SelectItem value="business_card">Business Card</SelectItem>
                </SelectContent>
            </Select>
        </CardHeader>
    );
}