// components/chat/ui/message-input.tsx
import { validateFile } from "@/lib/chat/file-utils";
import { Paperclip, Send, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

interface MessageInputProps {
  onSendMessage: (content?: string, file?: File) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  disabled = false,
}: MessageInputProps) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && !file) || isSending || disabled) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(input, file!);
      setInput("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  return (
    <div className="border-t p-4">
      {file && (
        <div className="mb-3 flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4" />
            <span className="text-sm font-medium truncate">{file.name}</span>
            <span className="text-xs text-gray-500">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={isSending || disabled}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          disabled={isSending || disabled}
        />

        <button
          type="submit"
          disabled={(!input.trim() && !file) || isSending || disabled}
          className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </form>
    </div>
  );
};
