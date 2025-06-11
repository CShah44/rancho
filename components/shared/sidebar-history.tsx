"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import { EditableChatItem } from "./editable-chat-item";
import useSWRInfinite from "swr/infinite";
import { LoaderIcon, X, MessageSquare, Clock } from "lucide-react";
import { Button } from "../ui/button";

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

// Enhanced Delete Confirmation Modal
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-zinc-900 border border-zinc-700/50 text-white p-6 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <MessageSquare size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Delete Chat</h2>
            <p className="text-sm text-zinc-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-zinc-300 mb-6 leading-relaxed">
          Are you sure you want to delete this chat? This will permanently
          remove the conversation and all its messages from our servers.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            Delete Chat
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-3 px-3 py-2">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl p-3 bg-zinc-800/30 animate-pulse"
          >
            <div className="h-4 w-4 rounded-full bg-zinc-700/60" />
            <div
              className="h-4 rounded-md bg-zinc-700/60"
              style={{ width: "70%" }}
            />
          </div>
        ))}
    </div>
  );
}

// Empty state component
function EmptyState({ user, message }: { user?: User; message: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="px-4 py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare size={20} className="text-zinc-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
              {message}
            </p>
            {!user && (
              <p className="text-xs text-zinc-500">
                Login to save your conversations
              </p>
            )}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();

  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
    fallbackData: [],
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some((page) => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : false;

  const handleDelete = async () => {
    if (!deleteId) return;

    const chatIdToDelete = deleteId;
    const isCurrentChat = chatIdToDelete === id;

    const deletePromise = fetch(`/api/chat?id=${chatIdToDelete}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((chatHistories) => {
          if (!chatHistories) return chatHistories;

          return chatHistories.map((chatHistory) => ({
            ...chatHistory,
            chats: chatHistory.chats.filter(
              (chat) => chat.id !== chatIdToDelete
            ),
          }));
        });

        if (isCurrentChat) {
          router.push("/");
        }

        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setDeleteId(null);
  };

  // Loading state
  if (isLoading || (!paginatedChatHistories && isValidating)) {
    return (
      <SidebarGroup>
        <div className="px-3 py-2 text-xs text-zinc-400 font-medium flex items-center gap-2">
          <Clock size={12} />
          Loading chats
        </div>
        <SidebarGroupContent>
          <LoadingSkeleton />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Not logged in state
  if (!user && !isLoading && !paginatedChatHistories && !isValidating) {
    return (
      <EmptyState
        user={user}
        message="Login to save and revisit previous chats!"
      />
    );
  }

  // Empty chat history state
  if (hasEmptyChatHistory) {
    return (
      <EmptyState
        user={user}
        message="Your conversations will appear here once you start chatting!"
      />
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            {paginatedChatHistories &&
              (() => {
                const chatsFromHistory = paginatedChatHistories.flatMap(
                  (paginatedChatHistory) => paginatedChatHistory.chats
                );

                const groupedChats = groupChatsByDate(chatsFromHistory);

                return (
                  <div className="space-y-6">
                    {groupedChats.today.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
                          Today
                        </div>
                        <div className="space-y-1">
                          {groupedChats.today.map((chat) => (
                            <EditableChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={chat.id === id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteModal(true);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
                          Yesterday
                        </div>
                        <div className="space-y-1">
                          {groupedChats.yesterday.map((chat) => (
                            <EditableChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={chat.id === id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteModal(true);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
                          Last 7 days
                        </div>
                        <div className="space-y-1">
                          {groupedChats.lastWeek.map((chat) => (
                            <EditableChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={chat.id === id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteModal(true);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
                          Last 30 days
                        </div>
                        <div className="space-y-1">
                          {groupedChats.lastMonth.map((chat) => (
                            <EditableChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={chat.id === id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteModal(true);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedChats.older.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
                          Older
                        </div>
                        <div className="space-y-1">
                          {groupedChats.older.map((chat) => (
                            <EditableChatItem
                              key={chat.id}
                              chat={chat}
                              isActive={chat.id === id}
                              onDelete={(chatId) => {
                                setDeleteId(chatId);
                                setShowDeleteModal(true);
                              }}
                              setOpenMobile={setOpenMobile}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>

          {/* Infinite scroll trigger */}
          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !hasReachedEnd) {
                setSize((size) => size + 1);
              }
            }}
          />

          {/* Loading more indicator */}
          {!hasReachedEnd && !isLoading && (
            <div className="p-4 text-zinc-500 flex flex-row gap-2 items-center justify-center">
              <div className="animate-spin">
                <LoaderIcon size={14} />
              </div>
              <div className="text-xs">Loading more chats...</div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Enhanced Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
export default SidebarHistory;
