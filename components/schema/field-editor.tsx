import {useState} from 'react';
import {FieldType, SchemaField, FORMAT_OPTIONS} from '@/types';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
} from '@/components/ui/collapsible';
import {Badge} from '@/components/ui/badge';
import {ChevronDown, ChevronUp, Plus, Trash, Edit} from 'lucide-react';
import {Separator} from '@/components/ui/separator';
import {
    ToggleGroup,
    ToggleGroupItem
} from '@/components/ui/toggle-group';

interface FieldEditorProps {
    field: SchemaField;
    onUpdate: (updatedField: SchemaField) => void;
    onCancel: () => void;
    isNew?: boolean;
}

export function FieldEditor({
    field,
    onUpdate,
    onCancel,
    isNew = false
}: FieldEditorProps) {
    const [fieldData, setFieldData] = useState<SchemaField>({...field});
    const [showProperties, setShowProperties] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [examples, setExamples] = useState<string[]>(field.examples || []);
    const [exampleInput, setExampleInput] = useState('');

    // Handle input changes
    const handleChange = (key: keyof SchemaField, value: any) => {
        setFieldData(prev => ({...prev, [key]: value}));
    };

    // Handle type change
    const handleTypeChange = (value: FieldType) => {
        const newData = {...fieldData, type: value};

        // Reset type-specific fields
        if (value !== 'object') {
            newData.properties = undefined;
        }

        if (value !== 'array') {
            newData.items = undefined;
        }

        if (value !== 'string') {
            newData.format = undefined;
        }

        // Initialize nested structures if needed
        if (value === 'object' && !newData.properties) {
            newData.properties = [];
        }

        if (value === 'array' && !newData.items) {
            newData.items = {
                name: 'item',
                type: 'object',
                required: true,
                properties: []
            };
        }

        setFieldData(newData);
    };

    // Add a property to an object field
    const addProperty = () => {
        if (fieldData.properties) {
            setFieldData({
                ...fieldData,
                properties: [
                    ...fieldData.properties,
                    {name: '', type: 'string', required: true}
                ]
            });
        }
    };

    // Remove a property from an object field
    const removeProperty = (index: number) => {
        if (fieldData.properties) {
            setFieldData({
                ...fieldData,
                properties: fieldData.properties.filter((_, i) => i !== index)
            });
        }
    };

    // Update a property in an object field
    const updateProperty = (index: number, updatedProperty: SchemaField) => {
        if (fieldData.properties) {
            const updatedProperties = [...fieldData.properties];
            updatedProperties[index] = updatedProperty;
            setFieldData({
                ...fieldData,
                properties: updatedProperties
            });
        }
    };

    // Add an example
    const addExample = () => {
        if (exampleInput.trim()) {
            const newExamples = [...examples, exampleInput.trim()];
            setExamples(newExamples);
            handleChange('examples', newExamples);
            setExampleInput('');
        }
    };

    // Remove an example
    const removeExample = (index: number) => {
        const newExamples = examples.filter((_, i) => i !== index);
        setExamples(newExamples);
        handleChange('examples', newExamples);
    };

    // Handle form submission
    const handleSubmit = () => {
        onUpdate({
            ...fieldData,
            examples: examples,
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="field-name">Field Name</Label>
                    <Input
                        id="field-name"
                        placeholder="e.g. invoice_number"
                        value={fieldData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-8"> {/* Increased gap to 8 */}
                    <div className="space-y-4"> {/* Increased vertical spacing */}
                        <Label className="text-sm font-medium">Field Type</Label>
                        <ToggleGroup
                            type="single"
                            value={fieldData.type}
                            onValueChange={(value) => value && handleTypeChange(value as FieldType)}
                            className="grid grid-cols-3 gap-2 w-full" // Changed to grid layout
                        >
                            <ToggleGroupItem value="string" size="sm" className="py-2">string</ToggleGroupItem>
                            <ToggleGroupItem value="number" size="sm" className="py-2">number</ToggleGroupItem>
                            <ToggleGroupItem value="boolean" size="sm" className="py-2">boolean</ToggleGroupItem>
                            <ToggleGroupItem value="array" size="sm" className="py-2">array</ToggleGroupItem>
                            <ToggleGroupItem value="object" size="sm" className="py-2">object</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col justify-end space-y-2 h-full"> {/* More vertical layout */}
                        <div className="flex items-center space-x-3">
                            <Switch
                                id="required-field"
                                checked={fieldData.required}
                                onCheckedChange={(checked) => handleChange('required', checked)}
                            />
                            <Label
                                htmlFor="required-field"
                                className="text-sm cursor-pointer select-none"
                            >
                                Required field
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="field-description">Description</Label>
                    <Textarea
                        id="field-description"
                        placeholder="Describe what should be extracted (e.g., 'The invoice number, typically found at the top right')"
                        value={fieldData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                    />
                </div>

                {fieldData.type === 'string' && (
                    <div className="space-y-2">
                        <Label htmlFor="field-format">Format (Optional)</Label>
                        <Select
                            value={fieldData.format || 'none'}
                            onValueChange={(value) => handleChange('format', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="field-format">
                                <SelectValue placeholder="Select a format hint for extraction" />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Example Values (Optional)</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add an example value"
                            value={exampleInput}
                            onChange={(e) => setExampleInput(e.target.value)}
                        />
                        <Button type="button" onClick={addExample} size="sm">
                            Add
                        </Button>
                    </div>
                    {examples.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {examples.map((example, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {example}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                                        onClick={() => removeExample(index)}
                                    >
                                        <Trash size={12} />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {fieldData.type === 'object' && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Object Properties</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowProperties(!showProperties)}
                            >
                                {showProperties ? (
                                    <>
                                        <ChevronUp className="mr-1 h-4 w-4" />
                                        Hide Properties
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-1 h-4 w-4" />
                                        Show Properties
                                    </>
                                )}
                            </Button>
                        </div>

                        <Collapsible open={showProperties} onOpenChange={setShowProperties}>
                            <CollapsibleContent className="space-y-2">
                                {fieldData.properties && fieldData.properties.length > 0 ? (
                                    <div className="space-y-2">
                                        {fieldData.properties.map((prop, idx) => (
                                            <Card key={idx} className="overflow-hidden">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">
                                                                {prop.name || <span className="text-muted-foreground">Unnamed property</span>}
                                                            </span>
                                                            <Badge variant={prop.required ? "default" : "outline"}>
                                                                {prop.required ? 'Required' : 'Optional'}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {prop.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-500"
                                                                onClick={() => {
                                                                    const modalField = {...prop};
                                                                    // In a real app, we would open a modal or create a recursive editor
                                                                    // For simplicity, we'll use a basic prompt
                                                                    const name = prompt('Property name:', prop.name);
                                                                    if (name !== null) {
                                                                        modalField.name = name;
                                                                        updateProperty(idx, modalField);
                                                                    }
                                                                }}
                                                            >
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500"
                                                                onClick={() => removeProperty(idx)}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No properties defined
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={addProperty}
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add Property
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </>
            )}

            {fieldData.type === 'array' && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Array Items</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowItems(!showItems)}
                            >
                                {showItems ? (
                                    <>
                                        <ChevronUp className="mr-1 h-4 w-4" />
                                        Hide Item Schema
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-1 h-4 w-4" />
                                        Show Item Schema
                                    </>
                                )}
                            </Button>
                        </div>

                        <Collapsible open={showItems} onOpenChange={setShowItems}>
                            <CollapsibleContent className="space-y-2">
                                {fieldData.items ? (
                                    <Card className="overflow-hidden">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-sm">
                                                        Item Type: {fieldData.items.type}
                                                    </span>
                                                    {fieldData.items.type === 'object' && fieldData.items.properties && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {fieldData.items.properties.length} properties
                                                        </span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500"
                                                    onClick={() => {
                                                        // In a real app, this would open a modal for editing the item schema
                                                        alert('In a complete implementation, this would open the item schema editor');
                                                    }}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No item schema defined
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!fieldData.name.trim()}
                >
                    {isNew ? 'Add Field' : 'Update Field'}
                </Button>
            </div>
        </div>
    );
}