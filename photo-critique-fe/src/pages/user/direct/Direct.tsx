import React, { useEffect, useState } from "react";
import { messageService, type ConversationResponse } from "../../../services";
import { ConversationList } from "../../../features/chat/ConversationList";
import { ChatWindow } from "../../../features/chat/ChatWindow";
import { Loading, ToastType } from "../../../components";
import { showToast } from "../../../utils";

export const Direct = () => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      // Auto-select first conversation if available
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error?.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdate = () => {
    loadConversations();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading variant="fullscreen" text="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-3xl shadow-sm overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id || null}
        onSelectConversation={handleSelectConversation}
      />
      <ChatWindow
        conversation={selectedConversation}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
};
