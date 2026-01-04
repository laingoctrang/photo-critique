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
      
      // Sort by most recent activity (lastMessage timestamp)
      const sortedData = [...data].sort((a, b) => {
        const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0;
        const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0;
        return timeB - timeA; // Most recent first
      });
      
      setConversations(sortedData);
      
      // Auto-select first conversation if available
      if (sortedData.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedData[0]);
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
            
            // Add new conversation at the beginning (most recent)
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