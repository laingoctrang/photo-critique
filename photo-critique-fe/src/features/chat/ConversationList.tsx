import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "../../components/common/Input";
import { messageService, type ConversationResponse } from "../../services";
import { useAuth } from "../../hooks";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: ConversationResponse[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationResponse) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      } else if (diffInHours < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("en-US", { weekday: "long" });
      }
    } catch {
      return "";
    }
  };

  return (
    <div className="w-80 flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Chats</h2>
        <Input
          type="text"
          placeholder="Search conversations"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={MagnifyingGlassIcon}
          size="small"
          variant="outline"
          className="w-full"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-gray-500 text-center">
              {searchTerm ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const isLastMessageFromOther = conversation.lastMessage?.senderId !== user?.id;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-[#15B8A6]/5 border-l-4 border-[#15B8A6]" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conversation.otherUser.profilePicture || "/default-avatar.png"}
                      alt={conversation.otherUser.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.otherUser.fullName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content || "[Image]"}
                        </p>
                        {conversation.unreadCount > 0 && isLastMessageFromOther && (
                          <span className="flex-shrink-0 bg-[#15B8A6] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

