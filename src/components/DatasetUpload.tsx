import { useState, useRef } from "react";
import { Upload, Check, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DatasetUploadProps {
  onUploadComplete: (count: number) => void;
}

export function DatasetUpload({ onUploadComplete }: DatasetUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const csvData = await file.text();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-dataset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ csvData, clearExisting: true }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadedFile(file.name);
      onUploadComplete(result.total_in_database || result.records_inserted);
      
      toast({
        title: "Dataset uploaded successfully",
        description: `${result.records_inserted} facilities imported`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card
      className={`relative p-6 transition-all duration-300 ${
        isDragging
          ? "border-primary border-2 bg-primary/5 shadow-glow"
          : uploadedFile
          ? "border-success/50 bg-success/5"
          : "border-dashed border-2 border-muted-foreground/30 hover:border-primary/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        id="csv-upload"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Processing dataset...</p>
        </div>
      ) : uploadedFile ? (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-success/10">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">{uploadedFile}</p>
              <p className="text-sm text-muted-foreground">Dataset loaded</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearUpload}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label htmlFor="csv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>Expected columns: name, specialties, procedures, equipment, region</span>
            </div>
          </div>
        </label>
      )}
    </Card>
  );
}
