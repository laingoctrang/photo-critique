import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { messageService, type MessageResponse, type ConversationResponse, type SendMessageRequest } from "../../services";
import { useAuth } from "../../hooks";
import { formatDistanceToNow } from "date-fns";

interface ChatWindowProps {
  conversation: ConversationResponse | null;
  onConversationUpdate?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onConversationUpdate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      markAsRead();
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    setIsLoading(true);
    try {
      const response = await messageService.getMessages(conversation.id);
      setMessages(response.content);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversation) return;
    
    try {
      await messageService.markAsRead(conversation.id);
      onConversationUpdate?.();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!conversation || !newMessage.trim() || isSending) return;

    const request: SendMessageRequest = {
      receiverId: conversation.otherUser.id,
      content: newMessage.trim(),
    };

    setIsSending(true);
    try {
      const sentMessage = await messageService.sendMessage(request);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      onConversationUpdate?.();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.otherUser.profilePicture || "/default-avatar.png"}
              alt={conversation.otherUser.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversation.otherUser.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.otherUser.fullName}</h3>
            <p className={`text-sm ${conversation.otherUser.isOnline ? "text-green-600" : "text-gray-500"}`}>
              {conversation.otherUser.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} gap-2`}
                >
                  {!isOwnMessage && (
                    <img
                      src={conversation.otherUser.profilePicture || "/default-avatar.png"}
                      alt={conversation.otherUser.fullName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[70%]`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? "bg-[#15B8A6] text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                      {message.imageUrls && message.imageUrls.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.imageUrls.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Image ${idx + 1}`}
                              className="max-w-full rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <img
                  src={conversation.otherUser.profilePicture || "/default-avatar.png"}
                  alt={conversation.otherUser.fullName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FaceSmileIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#15B8A6] focus:border-transparent resize-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim() && !isSending
                ? "bg-[#15B8A6] text-white hover:bg-[#0E7C70]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

