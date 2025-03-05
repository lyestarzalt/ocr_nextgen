'use client';

import {useState} from 'react';
import {SchemaField, ProcessResponse} from '@/types';
import {DocumentUpload} from '@/components/document-upload';
import {DocumentPreview} from '@/components/document-preview';
import {SchemaBuilder} from '@/components/schema-builder';
import {ResultsDisplay} from '@/components/results-display';
import {Sparkles} from 'lucide-react';
import confetti from 'canvas-confetti';
import {toast} from "sonner";
import {Card} from '@/components/ui/card';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([
    {name: 'invoice_number', type: 'string', description: 'The invoice number (e.g., INV-12345)', required: true},
    {name: 'date', type: 'string', description: 'The invoice date', format: 'date', required: true},
    {name: 'vendor_name', type: 'string', description: 'The name of the company or person who issued the invoice', required: true},
    {name: 'total_amount', type: 'number', description: 'The total payment amount', required: true},
    {name: 'tax_amount', type: 'number', description: 'The tax amount', required: false}
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ProcessResponse | null>(null);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Reset results when a new file is selected
      setResults(null);
      setSelectedBox(null);
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  // Generate a simplified schema object for the API
  const generateSchemaObject = (): Record<string, string> => {
    return schemaFields.reduce((acc, field) => {
      acc[field.name] = field.type;
      return acc;
    }, {} as Record<string, string>);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (schemaFields.length === 0) {
      toast.error("Please add at least one field to the schema");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('schema', JSON.stringify(generateSchemaObject()));

      // Use our Next.js API route instead of directly calling the external API
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing document');
      }

      const data = await response.json() as ProcessResponse;
      setResults(data);

      // Show success notification
      toast.success("Document processed successfully");

      // Shoot confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {y: 0.6}
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = (index: number) => {
    setSelectedBox(index);

    // Create confetti effect
    const box = document.getElementById(`box-${index}`);
    if (box) {
      const rect = box.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 50,
        spread: 40,
        origin: {x, y},
        colors: ['#26c6da', '#5c6bc0', '#ec407a'],
      });
    }
  };

  return (
    <div className="container-wrapper">
      <div className="container py-4">
        <div className="content-section">
          {/* Increased gap and added more explicit sizing */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 h-full"> {/* Increased gap from 4 to 6 */}
            {/* Schema Builder - Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6"> {/* Changed space-y-4 to gap-6 */}
              <DocumentUpload
                onFileChange={handleFileChange}
                isLoading={loading}
              />

              <SchemaBuilder
                schemaFields={schemaFields}
                setSchemaFields={setSchemaFields}
                onSubmit={handleSubmit}
                isLoading={loading}
                hasFile={!!file}
              />
            </div>

            {/* Document Preview - Center Column */}
            <div className="lg:col-span-3">
              <DocumentPreview
                filePreview={filePreview}
                ocrResults={results?.ocr_results || null}
                isLoading={loading}
                onSelectBox={handleBoxClick}
                selectedBox={selectedBox}
              />
            </div>

            {/* Results Display - Right Column */}
            <div className="lg:col-span-2">
              {results ? (
                <ResultsDisplay results={results} />
              ) : (
                <Card className="h-full flex flex-col items-center justify-center text-center p-4 bg-muted/30 border-dashed">
                  <div className="py-8 space-y-3">
                    <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto">
                      <Sparkles className="h-6 w-6 text-primary/80" />
                    </div>
                    <h3 className="text-lg font-medium">Extraction Results</h3>
                    <p className="text-sm text-muted-foreground max-w-[15rem] mx-auto">
                      Upload a document and process it to see the extracted data here
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}