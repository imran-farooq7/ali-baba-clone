// lib/db/chat.operations.ts

import { prisma } from "@/prisma/prisma";

// Type Definitions
export interface MessageData {
  id: string;
  content?: string | null;
  senderId: string;
  conversationId: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  type: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string | null;
    type: string;
  };
}

export interface ConversationData {
  id: string;
  title?: string | null;
  lastMessageAt?: Date | null;
  participants: Array<{
    id: string;
    userId: string;
    userRole: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      type: string;
      company?: string | null;
    };
  }>;
  messages: MessageData[];
  brief?: { id: string; title: string; status: string } | null;
  proposal?: { id: string; message: string; status: string } | null;
}

// Pure function to verify user participation
export const verifyUserParticipation = async (
  userId: string,
  conversationId: string
) => {
  return prisma.participant.findUnique({
    where: {
      userId_conversationId: {
        userId,
        conversationId,
      },
    },
  });
};

// Pure function to get user conversations
export const getUserConversations = async (
  userId: string
): Promise<ConversationData[]> => {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              type: true,
              company: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              type: true,
            },
          },
        },
      },
      brief: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      proposal: {
        select: {
          id: true,
          message: true,
          status: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
};

// Pure function to get conversation by ID
export const getConversation = async (
  conversationId: string,
  userId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              type: true,
              company: true,
            },
          },
        },
      },
      brief: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      proposal: {
        select: {
          id: true,
          message: true,
          status: true,
        },
      },
    },
  });

  if (
    !conversation ||
    !conversation.participants.some((p) => p.userId === userId)
  ) {
    return null;
  }

  return conversation;
};

// Pure function to get messages with pagination
export const getMessages = async (
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = 50
) => {
  const participant = await verifyUserParticipation(userId, conversationId);

  if (!participant) {
    return { messages: [], nextCursor: null };
  }

  // Update last read time (side effect wrapped in transaction)
  await prisma.participant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      isDeleted: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
          type: true,
        },
      },
    },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = messages.length > limit;
  const items = hasNextPage ? messages.slice(0, -1) : messages;
  const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

  return {
    messages: items.reverse(),
    nextCursor,
  };
};

// Pure function factory for sending messages
export const createSendMessage =
  (prismaClient: typeof prisma) =>
  async (data: {
    conversationId: string;
    senderId: string;
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }) => {
    const {
      conversationId,
      senderId,
      content,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    } = data;

    return prismaClient.$transaction(async (tx) => {
      // Verify participation
      const participant = await tx.participant.findUnique({
        where: {
          userId_conversationId: {
            userId: senderId,
            conversationId,
          },
        },
      });

      if (!participant) {
        throw new Error("Not a participant in this conversation");
      }

      // Create message
      const message = await tx.message.create({
        data: {
          content,
          conversationId,
          senderId,
          fileUrl,
          fileName,
          fileSize,
          fileType,
          type: fileUrl ? "FILE" : "TEXT",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              type: true,
            },
          },
        },
      });

      // Update conversation
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return message;
    });
  };

// Factory function for creating conversations
export const createConversationCreator =
  (prismaClient: typeof prisma) =>
  async (data: {
    participantIds: string[];
    title?: string;
    briefId?: string;
    proposalId?: string;
    creatorId: string;
  }) => {
    const { participantIds, title, briefId, proposalId, creatorId } = data;

    // Check for existing conversation
    if (briefId) {
      const existing = await prismaClient.conversation.findUnique({
        where: { briefId },
      });
      if (existing) return existing;
    }

    if (proposalId) {
      const existing = await prismaClient.conversation.findUnique({
        where: { proposalId },
      });
      if (existing) return existing;
    }

    // Add creator to participants
    const allParticipantIds = [...new Set([creatorId, ...participantIds])];

    return prismaClient.$transaction(async (tx) => {
      // Get user types
      const users = await tx.user.findMany({
        where: { id: { in: allParticipantIds } },
        select: { id: true, type: true },
      });

      const conversation = await tx.conversation.create({
        data: {
          title,
          briefId,
          proposalId,
          participants: {
            create: allParticipantIds.map((userId) => ({
              userId,
              userRole: users.find((u) => u.id === userId)?.type || "BRAND",
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  type: true,
                  company: true,
                },
              },
            },
          },
        },
      });

      // Link to brief or proposal
      if (briefId) {
        await tx.brief.update({
          where: { id: briefId },
          data: { conversationId: conversation.id },
        });
      }

      if (proposalId) {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { conversationId: conversation.id },
        });
      }

      return conversation;
    });
  };
