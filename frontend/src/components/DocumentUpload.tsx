import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface DocumentUploadProps {
  onUploadSuccess: (sessionId: string, fileName: string) => void;
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await api.uploadDocument(file);
      setUploadedFile(file.name);
      onUploadSuccess(result.sessionId, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-accent px-4 py-3 animate-slide-up">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{uploadedFile}</p>
          <p className="text-xs text-muted-foreground">Ready to query</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12
          cursor-pointer transition-all duration-300
          ${isDragging
            ? "border-primary bg-accent scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            {isDragging ? (
              <FileText className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-base font-medium">
            {isUploading ? "Processing document..." : "Drop your PDF here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isUploading ? "Extracting text & creating embeddings" : "or click to browse"}
          </p>
        </div>
      </label>

      {error && (
        <p className="mt-3 text-sm text-destructive text-center animate-slide-up">{error}</p>
      )}
    </div>
  );
};

export default DocumentUpload;
