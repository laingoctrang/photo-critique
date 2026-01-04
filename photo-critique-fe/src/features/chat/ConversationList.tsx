import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Input } from "../../components/common/Input";
import { messageService, type ConversationResponse, type UserListItemResponse } from "../../services";
import { useAuth } from "../../hooks";
import { Loading } from "../../components/Loading";
import { formatTimeAgo } from "../../utils";

interface ConversationListProps {
  conversations: ConversationResponse[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationResponse) => void;
  onNewConversation?: (conversation: ConversationResponse) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchResults, setSearchResults] = useState<UserListItemResponse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingUsers(true);
        try {
          // Search users using messageService with pagination
          const response = await messageService.searchUsersForChat(searchTerm.trim(), 0, 20);
          const userResults = response.content;
          
          // Filter out current user and users already in conversations
          const conversationUserIds = new Set(conversations.map(c => c.otherUser.id));
          const filteredResults = userResults.filter(
            (u: UserListItemResponse) => u.id !== user?.id && !conversationUserIds.has(u.id)
          );
          setSearchResults(filteredResults);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Failed to search:", error);
          setSearchResults([]);
        } finally {
          setIsSearchingUsers(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, conversations, user?.id]);

  const handleSelectUser = async (selectedUser: UserListItemResponse) => {
    try {
      const conversation = await messageService.getOrCreateConversation(selectedUser.id);
      setSearchTerm("");
      setShowSearchResults(false);
      setSearchResults([]);
      onSelectConversation(conversation);
      onNewConversation?.(conversation);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  // Filter conversations locally by fullName or username
  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 flex flex-col bg-white border-r border-gray-200 relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Chats</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={MagnifyingGlassIcon}
            size="small"
            variant="outline"
            className="w-full"
          />
          
          {/* Search Results Dropdown for New Users */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {isSearchingUsers ? (
                <div className="p-4 text-center">
                  <Loading variant="inline" />
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Start new conversation
                  </div>
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={user.profilePicture || "/default-avatar.png"}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </div>
                      </div>
                      <UserPlusIcon className="w-5 h-5 text-[#15B8A6] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
                    isSelected ? "bg-[#15B8A6]/10 border-l-4 border-[#15B8A6]" : ""
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
                          {formatTimeAgo(conversation.lastMessage.sentAt)}
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