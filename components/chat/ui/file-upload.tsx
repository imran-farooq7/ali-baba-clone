"use client";

import { useState, useRef, DragEvent } from "react";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export default function FileUpload({
  onFileSelect,
  onCancel,
  maxSize = 10,
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "File type not supported. Please upload images, PDFs, or Office documents."
      );
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      await onFileSelect(file);
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return <ImageIcon className="h-12 w-12 text-blue-500" />;
    if (fileType === "application/pdf")
      return <FileText className="h-12 w-12 text-red-500" />;
    if (fileType.startsWith("video/"))
      return <Film className="h-12 w-12 text-purple-500" />;
    if (fileType.startsWith("audio/"))
      return <Music className="h-12 w-12 text-green-500" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl border shadow-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Upload images, PDFs, or documents (Max {maxSize}MB)
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Select Files
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File preview */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {file.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • {file.type}
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image preview */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-cover w-full"
                />
              </div>
            )}
          </div>

          {/* Upload status */}
          {uploading ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Uploading...</div>
                <div className="text-sm text-blue-700">
                  Please don't close this window
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">
                  Ready to upload
                </div>
                <div className="text-sm text-green-700">
                  File validated successfully
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={removeFile}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInput}
        className="hidden"
        accept={allowedTypes.join(",")}
      />

      {/* File type hints */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Supported file types
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <ImageIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Images</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <FileText className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <div className="text-xs text-gray-600">PDFs</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <File className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Documents</div>
          </div>
        </div>
      </div>
    </div>
  );
}
