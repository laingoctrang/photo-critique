interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
}

// Recent Conversations
export const RecentConversations = ({ conversations }: { conversations: Conversation[] }) => (
    <div className="border-t border-gray-100 pt-3">
        <div className="p-4 pt-0">
            <div className="sticky top-0 pt-4 pb-3 z-10">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="bg-clip-text text-transparent">
                        Recent Chats
                    </span>
                    {conversations.some((c) => c.unreadCount > 0) && (
                        <span className="ml-2 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[22px] h-5 flex items-center justify-center shadow-sm">
                            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                        </span>
                    )}
                </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {conversations.length === 0 ? (
                    <div className="text-center py-6 px-4 rounded-xl border border-gray-100">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💬</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No recent conversations</p>
                        <p className="text-xs text-gray-400 mt-1">Start a new chat to see them here</p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <ConversationItem key={conversation.id} conversation={conversation} />
                    ))
                )}
            </div>
        </div>
    </div>
);

const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-[0_4px_12px_-2px_rgba(21,184,166,0.1)] border border-transparent hover:border-[#15B8A6]/20 cursor-pointer transition-all duration-300 group">
        <div className="relative flex-shrink-0">
            <div className="relative">
                <img
                    src={conversation.userAvatar || "/default-avatar.png"}
                    alt={conversation.userName}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
                />
                <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${conversation.isOnline
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-gray-300 to-gray-400"
                        }`}
                ></div>
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 truncate">{conversation.userName}</h4>
                <span className="text-xs text-gray-500 font-medium">{conversation.timestamp}</span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{conversation.lastMessage}</p>
        </div>
        {conversation.unreadCount > 0 && (
            <span className="bg-gradient-to-r from-[#15B8A6] to-[#2DD4BF] text-white text-xs font-bold min-w-[22px] h-5 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {conversation.unreadCount}
            </span>
        )}
    </div>
);