"use client";

import AiChatAssistant from "@/components/ai/AiChatAssistant";
import { extractPageContext } from "@/lib/ai/gemini";
import { useState, useEffect, createContext, useContext } from "react";

interface AIAssistantContextType {
  isAssistantOpen: boolean;
  openAssistant: (initialPrompt?: string) => void;
  closeAssistant: () => void;
  sendMessage: (message: string) => void;
  currentContext: any;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(
  undefined
);

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return context;
}

export function AIAssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>();
  const [context, setContext] = useState({});

  // Update context when page changes
  useEffect(() => {
    const updateContext = () => {
      setContext(extractPageContext());
    };

    updateContext();
    window.addEventListener("popstate", updateContext);
    return () => window.removeEventListener("popstate", updateContext);
  }, []);

  const openAssistant = (prompt?: string) => {
    setIsOpen(true);
    if (prompt) {
      setInitialPrompt(prompt);
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
    setInitialPrompt(undefined);
  };

  const sendMessage = (message: string) => {
    // This would integrate with the chat component
    console.log("Sending message:", message);
    // You could use refs or state to communicate with the chat component
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isAssistantOpen: isOpen,
        openAssistant,
        closeAssistant,
        sendMessage,
        currentContext: context,
      }}
    >
      {children}
      <AiChatAssistant
        isOpen={isOpen}
        onClose={closeAssistant}
        initialPrompt={initialPrompt}
      />
    </AIAssistantContext.Provider>
  );
}

// Hook to trigger AI assistant from anywhere
export function useTriggerAIAssistant() {
  const { openAssistant } = useAIAssistant();

  return {
    askAboutBrief: (briefId: string) => {
      openAssistant(
        `Can you analyze brief ${briefId} and suggest improvements?`
      );
    },
    askAboutManufacturer: (manufacturerId: string) => {
      openAssistant(
        `What can you tell me about manufacturer ${manufacturerId}?`
      );
    },
    askAboutProposal: (proposalId: string) => {
      openAssistant(`Please review proposal ${proposalId} and give feedback.`);
    },
    askGeneralQuestion: (question: string) => {
      openAssistant(question);
    },
  };
}
