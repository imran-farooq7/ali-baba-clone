// components/manufacturer/CertificationUpload.tsx
"use client";

import { useState } from "react";
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: "uploading" | "success" | "error";
}

export default function CertificationUpload({
  manufacturerId,
}: {
  manufacturerId: string;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const fileId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        status: "uploading",
      };
      newFiles.push(newFile);

      // Simulate upload
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "success" } : f))
        );
      }, 1000);
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Submit files
  const submitFiles = async () => {
    if (files.length === 0) return;

    try {
      // In real app, upload to Supabase Storage
      const response = await fetch("/api/manufacturers/certifications/upload", {
        method: "POST",
        body: JSON.stringify({
          manufacturerId,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url,
          })),
        }),
      });

      if (response.ok) {
        alert("Certifications uploaded successfully!");
      }
    } catch (error) {
      alert("Failed to upload certifications");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Upload Certifications
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload quality certifications, licenses, and compliance documents to
          build trust with brands.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload
          className={`h-12 w-12 mx-auto mb-4 ${
            dragActive ? "text-green-500" : "text-gray-400"
          }`}
        />
        <p className="text-sm text-gray-600 mb-2">
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-green-600 hover:text-green-800"
          >
            Click to upload
          </label>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PDF, JPG, PNG files up to 10MB each
        </p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {file.status === "uploading" && (
                    <div className="flex items-center text-yellow-600">
                      <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-xs">Uploading...</span>
                    </div>
                  )}
                  {file.status === "success" && (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  )}
                  {file.status === "error" && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Failed</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      {files.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={submitFiles}
            disabled={files.some((f) => f.status === "uploading")}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Upload All Certifications
          </button>
        </div>
      )}

      {/* Accepted certifications */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Common Certifications
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            "ISO 9001",
            "ISO 14001",
            "ISO 45001",
            "AS9100",
            "IATF 16949",
            "FDA Registration",
            "CE Marking",
            "UL Certification",
            "RoHS Compliance",
            "REACH Compliance",
          ].map((cert) => (
            <div key={cert} className="flex items-center gap-2 text-gray-600">
              <Check className="h-3 w-3 text-green-500" />
              {cert}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
