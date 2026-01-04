import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { messageService, uploadService, type MessageResponse, type ConversationResponse, type SendMessageRequest } from "../../services";
import { useAuth } from "../../hooks";
import { FileUpload, Loading, ImageCarousel } from "../../components";
import type { FileUploadItemData } from "../../components/FileUpload/FileUploadItem";

interface ChatWindowProps {
  conversation: ConversationResponse | null;
  onConversationUpdate?: () => void;
}

interface PreviewImage {
  file: File;
  preview: string; // Server URL after upload
  serverUrl: string; // Server URL for sending message
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onConversationUpdate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItemData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUploadingRef = useRef(false);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      markAsRead();
      // Clear preview images and uploaded files when conversation changes
      setPreviewImages([]);
      setUploadedFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);


  useEffect(() => {
    // Auto scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    setIsLoading(true);
    try {
      const response = await messageService.getMessages(conversation.id);
      setMessages(response.content);
      // Scroll to bottom after messages load
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100);
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

  const handleFilesChange = async (files: FileUploadItemData[]) => {
    // Prevent concurrent uploads
    if (isUploadingRef.current || files.length === 0) return;
    
    // Extract File objects from FileUploadItemData
    const imageFiles = files
      .map(item => item.file)
      .filter((file): file is File => file instanceof File && file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    // Prevent duplicates by checking file name and size
    const existingFiles = new Set(previewImages.map(img => `${img.file.name}-${img.file.size}`));
    const newFiles = imageFiles.filter(file => !existingFiles.has(`${file.name}-${file.size}`));
    
    if (newFiles.length === 0) return;

    isUploadingRef.current = true;
    setIsUploading(true);
    try {
      // Upload files first
      const uploadedImages = await uploadService.uploadFiles(newFiles, undefined, 'chat');
      
      // Create preview entries with server URLs after upload
      const newPreviews: PreviewImage[] = newFiles.map((file, index) => {
        const uploadedImage = uploadedImages[index];
        return {
          file,
          preview: uploadedImage.url, // Use server URL for preview
          serverUrl: uploadedImage.url
        };
      });
      
      setPreviewImages(prev => [...prev, ...newPreviews]);
      // Clear FileUpload component by setting empty array
      setUploadedFiles([]);
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
      isUploadingRef.current = false;
    }
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSendMessage = async () => {
    if (!conversation || (!newMessage.trim() && previewImages.length === 0) || isSending) return;

    setIsSending(true);
    try {
      // Get server URLs from preview (already uploaded)
      const imageUrls = previewImages.length > 0 
        ? previewImages.map(img => img.serverUrl)
        : undefined;

      const request: SendMessageRequest = {
        receiverId: conversation.otherUser.id,
        content: newMessage.trim() || undefined,
        imageUrls: imageUrls,
      };

      console.log("Sending message with request:", request); // Debug log

      const sentMessage = await messageService.sendMessage(request);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      
      // Clear preview images and uploaded files
      setPreviewImages([]);
      setUploadedFiles([]);
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      
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
          <Loading variant="inline" text="Loading messages..." />
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
                  <div className={`flex flex-col gap-2 ${isOwnMessage ? "items-end" : "items-start"} max-w-[70%]`}>
                    <div
                      className={`px-4 py-2 rounded-3xl ${
                        isOwnMessage
                          ? "bg-[#15B8A6] text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                      {message.imageUrls && message.imageUrls.length > 0 && (
                        <div className="w-full max-w-sm">
                          <div className="w-full h-64">
                            <ImageCarousel
                              images={message.imageUrls}
                              fitMode="cover"
                              showPreview={true}
                              hideNavigation={message.imageUrls.length === 1}
                              className="rounded-3xl"
                            />
                          </div>
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        {/* Uploading Indicator */}
        {isUploading && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#15B8A6]"></div>
            <span>Uploading images...</span>
          </div>
        )}
        
        {/* Image Preview - Only show after upload */}
        {previewImages.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePreviewImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FileUpload
              files={uploadedFiles}
              variant="icon"
              onFilesChange={handleFilesChange}
              className="p-0 border-none"
              itemClassName="rounded"
              maxFiles={10}
              acceptedTypes="image/jpeg, image/png, image/jpg, image/gif, image/webp"
              maxSize={10 * 1024 * 1024}
            />
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
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && previewImages.length === 0) || isSending}
            className={`p-3 rounded-full transition-colors ${
              (newMessage.trim() || previewImages.length > 0) && !isSending
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

