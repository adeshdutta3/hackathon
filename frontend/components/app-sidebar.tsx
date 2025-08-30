// app/components/app-sidebar.tsx (replace your file)
"use client";

import { useRouter } from "next/navigation";
import { Home, User2, PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRecoilState, useRecoilValue } from "recoil";
import { darkModeState } from "@/recoil/blackandwhite";
import { openState } from "@/recoil/open";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { chatsState } from "@/recoil/chats";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Profile", url: "/profile", icon: User2 },
];

export function AppSidebar({ onSelectChat }: { onSelectChat?: (chatId: string) => void }) {
  const user = useUser();
  const router = useRouter();
  const darkMode = useRecoilValue(darkModeState);
  const open = useRecoilValue(openState);
const [chatCount, setChatCount] = useState(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("chatCount");
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
}); 
  const [chats, setChats] = useRecoilState(chatsState);
  const [loading, setLoading] = useState(false);

  async function loadChats() {
  try {
    const userId = user.user?.id;
    const res = await fetch(`/api/chats${userId ? `?userId=${userId}` : ""}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setChats(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}


  useEffect(() => {
    loadChats();
  }, []);

useEffect(() => {
  localStorage.setItem("chatCount", chatCount.toString());
}, [chatCount]);

async function createChat() {
  try {
    setLoading(true);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Untitled${chatCount}`,
        userId: user.user?.id,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const newChat = await res.json();

    setChats((prev) => [newChat, ...prev]);
    router.push(`/chatbot/${newChat.id}`);
  } catch (err) {
    console.error("Error creating chat:", err);
  } finally {
    setChatCount((prev) => prev + 1);
    setLoading(false);
  }
}

  return (
    <Sidebar collapsible="icon">
      <div
        className={`px-[11px] pt-5 ${darkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-black"}`}
      >
        <SidebarTrigger
          className={cn(
            "cursor-pointer transition-transform duration-300 ease-in-out",
            open ? "translate-x-[200px]" : "translate-x-0"
          )}
        />
      </div>

      <SidebarContent
        className={cn(
          "flex flex-col h-full justify-between",
          darkMode
            ? "bg-slate-900 text-white border-gray-700"
            : "bg-slate-50 text-gray-700 border-gray-200"
        )}
      >
        {/* Main menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="gap-3 [&>svg]:h-5 [&>svg]:w-5">
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat history */}
        <SidebarGroup className="overflow-auto">
          <SidebarGroupLabel className="flex whitespace-nowrap items-center text-xl justify-between">
            Chat History :
            <button
              onClick={createChat}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              New
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 py-6 overflow-y-auto">
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    className="gap-2 [&>svg]:h-4 [&>svg]:w-4"
                    // IMPORTANT: don't route here - call onSelectChat so the provider can show read-only sidebar view.
                    onClick={() => router.push(`/chatbot/${chat.id}`)}
                  >
                    <button className="text-left truncate w-full">
                      {chat.title}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {chats.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground">
                  No chats yet. Start one!
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User at bottom */}
        <div className="mt-auto flex p-4 items-center gap-4">
          <UserButton />
          {open && (
            <div className={cn("text-xl", darkMode ? "text-white" : "text-black")}>
              {user.user?.firstName} {user.user?.lastName}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
