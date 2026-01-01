import { createClient } from "@supabase/supabase-js";

// Real-time Supabase client with enhanced configuration
export const supabaseRealtime = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "x-application-name": "manufacturing-platform",
      },
    },
  }
);

// Real-time subscription types
export type RealtimeChannel = ReturnType<typeof supabaseRealtime.channel>;

// Create channel for conversation
export const createConversationChannel = (conversationId: string) => {
  return supabaseRealtime.channel(`conversation:${conversationId}`, {
    config: {
      broadcast: { self: true },
      presence: { key: conversationId },
    },
  });
};

// Create channel for user notifications
export const createUserChannel = (userId: string) => {
  return supabaseRealtime.channel(`user:${userId}`, {
    config: {
      broadcast: { self: false },
      presence: { key: userId },
    },
  });
};

// File upload utilities
export const uploadChatFile = async (
  file: File,
  conversationId: string,
  userId: string
): Promise<{ url: string; metadata: any }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${conversationId}/${userId}/${Date.now()}.${fileExt}`;
  const filePath = `chat-files/${fileName}`;

  const { data, error } = await supabaseRealtime.storage
    .from("chat-attachments")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseRealtime.storage.from("chat-attachments").getPublicUrl(filePath);

  return {
    url: publicUrl,
    metadata: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExt,
      uploadedAt: new Date().toISOString(),
    },
  };
};

// Delete file from storage
export const deleteChatFile = async (fileUrl: string) => {
  const filePath = fileUrl.split("/").slice(-3).join("/");

  const { error } = await supabaseRealtime.storage
    .from("chat-attachments")
    .remove([filePath]);

  if (error) {
    console.error("Failed to delete file:", error);
  }
};

// Get file preview URL
export const getFilePreviewUrl = (fileUrl: string) => {
  return fileUrl; // In production, you might generate thumbnails
};

// Check if file is an image
export const isImageFile = (fileType: string) => {
  return fileType.startsWith("image/");
};

// Check if file is a PDF
export const isPDFFile = (fileType: string) => {
  return fileType === "application/pdf";
};

// Get file icon based on type
export const getFileIcon = (fileType: string) => {
  if (isImageFile(fileType)) return "image";
  if (isPDFFile(fileType)) return "pdf";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.includes("spreadsheet") || fileType.includes("excel"))
    return "spreadsheet";
  if (fileType.includes("word") || fileType.includes("document"))
    return "document";
  return "file";
};
