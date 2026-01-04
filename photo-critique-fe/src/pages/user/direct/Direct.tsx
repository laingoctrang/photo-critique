import { useEffect, useState } from "react";
import { messageService, type ConversationResponse } from "../../../services";
import { ConversationList } from "../../../features/chat/ConversationList";
import { ChatWindow } from "../../../features/chat/ChatWindow";
import { ToastType } from "../../../components";
import { showToast } from "../../../utils";

export const Direct = () => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      // Auto-select first conversation if available
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error: any) {
      showToast(ToastType.ERROR, error?.message || "Failed to load conversations");
    }
  };

  const handleSelectConversation = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdate = () => {
    loadConversations();
  };

  return (
    <div className="flex h-full bg-white rounded-3xl shadow-sm overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewConversation={(newConv) => {
          setConversations((prev) => {
            // Check if conversation already exists
            const exists = prev.find(c => c.id === newConv.id);
            if (exists) return prev;
            // Add new conversation at the beginning
            return [newConv, ...prev];
          });
          setSelectedConversation(newConv);
        }}
      />
      <ChatWindow
        conversation={selectedConversation}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
};
