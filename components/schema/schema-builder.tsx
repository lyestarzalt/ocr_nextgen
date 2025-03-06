import {useState} from 'react';
import {SchemaField, SCHEMA_TEMPLATES} from '@/types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
} from '@/components/ui/collapsible';
import {FieldEditor} from '@/components/schema/field-editor';
import {SchemaFieldItem} from '@/components/schema/schema-field-item';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Code} from 'lucide-react';

interface SchemaBuilderProps {
    schemaFields: SchemaField[];
    setSchemaFields: (fields: SchemaField[]) => void;
    onSubmit: () => void;
    isLoading: boolean;
    hasFile: boolean;
}

export function SchemaBuilder({
    schemaFields,
    setSchemaFields,
    onSubmit,
    isLoading,
    hasFile
}: SchemaBuilderProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<SchemaField | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isAddingField, setIsAddingField] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
    const [showSchemaJson, setShowSchemaJson] = useState(false);

    // Apply a schema template
    const applyTemplate = (templateName: string) => {
        if (templateName === 'custom') {
            return; // Keep current schema
        }

        // Option to merge or replace
        const mergeStrategy = confirm('Do you want to merge this template with existing fields?');

        if (mergeStrategy) {
            // Merge template fields, avoiding duplicates
            const templateFields = SCHEMA_TEMPLATES[templateName as keyof typeof SCHEMA_TEMPLATES] || [];
            const newFields = [...schemaFields];

            templateFields.forEach(templateField => {
                const existingFieldIndex = newFields.findIndex(f => f.name === templateField.name);
                if (existingFieldIndex === -1) {
                    newFields.push(templateField);
                }
            });

            setSchemaFields(newFields);
        } else {
            setSchemaFields(SCHEMA_TEMPLATES[templateName as keyof typeof SCHEMA_TEMPLATES] || []);
        }
    };

    // Start adding a new field
    const startAddField = () => {
        setIsAddingField(true);
        setEditingField({
            name: '',
            type: 'string',
            required: true
        });
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    // Start editing a field
    const startEditField = (field: SchemaField, index: number) => {
        setIsAddingField(false);
        setEditingField({...field});
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    // Save a field (new or edited)
    const saveField = (field: SchemaField) => {
        if (isAddingField) {
            setSchemaFields([...schemaFields, field]);
        } else if (editingIndex !== null) {
            const newFields = [...schemaFields];
            newFields[editingIndex] = field;
            setSchemaFields(newFields);
        }
        setIsDialogOpen(false);
    };

    // Remove a field from the schema
    const removeSchemaField = (index: number) => {
        if (confirm('Are you sure you want to remove this field?')) {
            setSchemaFields(schemaFields.filter((_, i) => i !== index));
        }
    };

    // Convert schema fields to JSON schema
    const generateJsonSchema = (): Record<string, any> => {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        // Process each field
        schemaFields.forEach(field => {
            // Add to required list if needed
            if (field.required) {
                required.push(field.name);
            }

            // Create the property schema
            const propSchema: Record<string, any> = {
                type: field.type
            };

            // Add description if present
            if (field.description) {
                propSchema.description = field.description;
            }

            // Add format if present (for string fields)
            if (field.type === 'string' && field.format) {
                propSchema.format = field.format;
            }

            // Add examples if present
            if (field.examples && field.examples.length > 0) {
                propSchema.examples = field.examples;
            }

            // Handle object type
            if (field.type === 'object' && field.properties && field.properties.length > 0) {
                propSchema.properties = {};
                const objRequired: string[] = [];

                field.properties.forEach(prop => {
                    propSchema.properties[prop.name] = {type: prop.type};

                    if (prop.required) {
                        objRequired.push(prop.name);
                    }

                    if (prop.description) {
                        propSchema.properties[prop.name].description = prop.description;
                    }
                });

                if (objRequired.length > 0) {
                    propSchema.required = objRequired;
                }

                propSchema.additionalProperties = false;
            }

            // Handle array type
            if (field.type === 'array' && field.items) {
                propSchema.items = {
                    type: field.items.type
                };

                if (field.items.description) {
                    propSchema.items.description = field.items.description;
                }

                // Handle object items
                if (field.items.type === 'object' && field.items.properties && field.items.properties.length > 0) {
                    propSchema.items.properties = {};
                    const itemsRequired: string[] = [];

                    field.items.properties.forEach(prop => {
                        propSchema.items.properties[prop.name] = {type: prop.type};

                        if (prop.required) {
                            itemsRequired.push(prop.name);
                        }

                        if (prop.description) {
                            propSchema.items.properties[prop.name].description = prop.description;
                        }
                    });

                    if (itemsRequired.length > 0) {
                        propSchema.items.required = itemsRequired;
                    }

                    propSchema.items.additionalProperties = false;
                }
            }

            // Add the property to the schema
            properties[field.name] = propSchema;
        });

        // Build the complete schema
        return {
            type: "object",
            properties: properties,
            required: required,
            additionalProperties: false
        };
    };

    return (
        <>
            <Card className="w-full flex-grow"> {/* Added w-full and flex-grow */}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Schema Definition</CardTitle>
                            <CardDescription>Define the data fields to extract from the document</CardDescription>
                        </div>
                        <Select
                            value={selectedTemplate}
                            onValueChange={(value) => {
                                setSelectedTemplate(value);
                                applyTemplate(value);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Custom Schema</SelectItem>
                                <SelectItem value="invoice">Invoice Template</SelectItem>
                                <SelectItem value="receipt">Receipt Template</SelectItem>
                                <SelectItem value="business_card">Business Card Template</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 w-full"> {/* Added w-full */}
                    <div className="space-y-2">
                        {schemaFields.length > 0 ? (
                            schemaFields.map((field, index) => (
                                <SchemaFieldItem
                                    key={index}
                                    field={field}
                                    onEdit={() => startEditField(field, index)}
                                    onRemove={() => removeSchemaField(index)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No fields defined. Add fields or select a template.
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={startAddField}
                    >
                        Add Field
                    </Button>

                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSchemaJson(!showSchemaJson)}
                            className="flex items-center gap-1"
                        >
                            <Code size={16} />
                            {showSchemaJson ? 'Hide Schema JSON' : 'Show Schema JSON'}
                        </Button>
                    </div>

                    <Collapsible open={showSchemaJson} onOpenChange={setShowSchemaJson}>
                        <CollapsibleContent>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                <pre className="text-xs font-mono">
                                    {JSON.stringify(generateJsonSchema(), null, 2)}
                                </pre>
                            </ScrollArea>
                        </CollapsibleContent>
                    </Collapsible>

                    <Button
                        className="w-full"
                        onClick={onSubmit}
                        disabled={!hasFile || isLoading || schemaFields.length === 0}
                    >
                        {isLoading ? 'Processing...' : 'Process Document'}
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isAddingField ? 'Add New Field' : 'Edit Field'}</DialogTitle>
                    </DialogHeader>
                    {editingField && (
                        <FieldEditor
                            field={editingField}
                            onUpdate={saveField}
                            onCancel={() => setIsDialogOpen(false)}
                            isNew={isAddingField}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}