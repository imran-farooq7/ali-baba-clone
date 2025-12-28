// components/chat/utils/validators.ts
// Pure validation functions
export const validateMessageInput = (
  content?: string,
  file?: File
): { valid: boolean; error?: string } => {
  if (!content?.trim() && !file) {
    return { valid: false, error: "Message content or file is required" };
  }

  if (content && content.length > 5000) {
    return { valid: false, error: "Message too long (max 5000 characters)" };
  }

  return { valid: true };
};

export const validateConversationCreation = (
  participantIds: string[]
): { valid: boolean; error?: string } => {
  if (!participantIds || participantIds.length === 0) {
    return { valid: false, error: "At least one participant is required" };
  }

  if (participantIds.length > 10) {
    return { valid: false, error: "Too many participants (max 10)" };
  }

  return { valid: true };
};
