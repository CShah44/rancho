"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chat } from "@/lib/db/schema";

interface EditableChatItemProps {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}

export function EditableChatItem({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: EditableChatItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChatClick = () => {
    if (isEditing) return;
    setOpenMobile(false);
    router.push(`/chat/${chat.id}`);
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(chat.title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(chat.title);
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || editTitle === chat.title) {
      handleEditCancel();
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/chat/${chat.id}/title`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update chat title");
      }

      toast.success("Chat title updated");
      setIsEditing(false);

      setCurrentTitle(editTitle.trim());

      // Refresh the page to update the sidebar
      router.refresh();
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update chat title");
      setEditTitle(chat.title);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat.id);
  };

  return (
    <SidebarMenuItem>
      <div className="group relative w-full">
        {isEditing ? (
          // Editing mode
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/50">
            <div
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                isActive ? "bg-blue-400" : "bg-zinc-500"
              )}
            />
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditSave}
              className="flex-1 bg-zinc-700/50 text-white text-sm px-2 py-1 rounded-md border border-zinc-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
              disabled={isUpdating}
              maxLength={100}
              placeholder="Enter chat title..."
            />
            {/* <div className="flex items-center gap-1">
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="p-1 hover:bg-zinc-600/50 rounded text-green-400 hover:text-green-300 transition-colors"
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isUpdating}
                className="p-1 hover:bg-zinc-600/50 rounded text-red-400 hover:text-red-300 transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div> */}
          </div>
        ) : (
          // Normal mode
          <SidebarMenuButton
            onClick={handleChatClick}
            className={cn(
              "w-full justify-start text-left font-normal px-3 py-2 h-auto min-h-[2.5rem] rounded-xl",
              "hover:bg-zinc-700/50 transition-all duration-200",
              "group-hover:pr-10", // Make space for the menu button
              isActive && "bg-zinc-700/70 text-white"
            )}
          >
            <div className="flex items-center w-full min-w-0">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mr-3 flex-shrink-0",
                  isActive ? "bg-blue-400" : "bg-zinc-500"
                )}
              />
              <span className="truncate text-sm text-zinc-300 group-hover:text-white transition-colors">
                {currentTitle}
              </span>
            </div>
          </SidebarMenuButton>
        )}

        {/* Menu button - only show when not editing */}
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "hover:bg-zinc-600/50 text-zinc-400 hover:text-white",
                  isActive && "opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-800 border-zinc-700 text-white min-w-[140px]"
            >
              <DropdownMenuItem
                onClick={handleEditStart}
                className="hover:bg-zinc-700 focus:text-white hover:text-white cursor-pointer focus:bg-zinc-700"
              >
                <Edit3 size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="hover:bg-zinc-700 cursor-pointer text-red-400 hover:text-red-500 focus:bg-zinc-700 focus:text-red-500"
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SidebarMenuItem>
  );
}
