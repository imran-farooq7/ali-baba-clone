// components/chat/utils/file-utils.ts
// Pure file-related functions
export const getFileIconType = (fileType?: string): string => {
  if (!fileType) return "document";
  if (fileType.startsWith("image/")) return "image";
  if (fileType === "application/pdf") return "pdf";
  if (fileType.includes("word") || fileType.includes("document")) return "word";
  if (fileType.includes("excel") || fileType.includes("spreadsheet"))
    return "excel";
  return "document";
};

export const getFileIconComponent = (fileType?: string) => {
  const type = getFileIconType(fileType);
  // Return appropriate icon component based on type
  return type;
};

export const getAllowedFileTypes = (): string[] => [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = getAllowedFileTypes();

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
};
