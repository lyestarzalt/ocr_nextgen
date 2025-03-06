import {useState} from 'react';
import {SchemaField} from '@/types';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Collapsible, CollapsibleContent} from '@/components/ui/collapsible';
import {Edit, Trash, ChevronDown, ChevronUp} from 'lucide-react';

interface SchemaFieldItemProps {
    field: SchemaField;
    onEdit: () => void;
    onRemove: () => void;
}

export function SchemaFieldItem({field, onEdit, onRemove}: SchemaFieldItemProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex">
                    {/* Left side: Field Name */}
                    <div className="flex-grow">
                        <p className="font-medium text-base mb-2">{field.name}</p>

                        {/* Field Type and Modifiers */}
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            <Badge variant={field.required ? "default" : "outline"} className="text-xs">
                                {field.required ? 'Required' : 'Optional'}
                            </Badge>
                        </div>
                    </div>

                    {/* Right side: Action Buttons */}
                    <div className="flex items-start space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500"
                            onClick={onEdit}
                        >
                            <Edit size={16} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={onRemove}
                        >
                            <Trash size={16} />
                        </Button>
                    </div>
                </div>

                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                    <CollapsibleContent className="mt-2 space-y-2 text-sm">
                        {field.description && (
                            <div className="text-muted-foreground">
                                <span className="font-medium">Description:</span> {field.description}
                            </div>
                        )}

                        {field.format && (
                            <div className="text-muted-foreground">
                                <span className="font-medium">Format:</span> {field.format}
                            </div>
                        )}

                        {field.examples && field.examples.length > 0 && (
                            <div className="text-muted-foreground">
                                <span className="font-medium">Examples:</span> {field.examples.join(', ')}
                            </div>
                        )}

                        {field.type === 'object' && field.properties && (
                            <div>
                                <span className="font-medium">Properties:</span>
                                <ul className="list-disc list-inside mt-1 pl-2">
                                    {field.properties.map((prop, idx) => (
                                        <li key={idx} className="text-muted-foreground">
                                            {prop.name} <span className="opacity-70">({prop.type})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {field.type === 'array' && field.items && (
                            <div>
                                <span className="font-medium">Array items:</span>
                                <div className="text-muted-foreground">
                                    Type: {field.items.type}
                                    {field.items.type === 'object' && field.items.properties && (
                                        <> with {field.items.properties.length} properties</>
                                    )}
                                </div>
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}