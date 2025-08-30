// app/api/chats/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, role, userId, chatId } = body as {
      text: string;
      role: string;
      userId?: string;
      chatId?: string; // ✅ fix: use string (UUID), not number
    };

    if (!text || !role) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let actualChatId = chatId;

    if (!actualChatId) {
      // create chat first
      const newChat = await prisma.chat.create({
        data: { title: "New Chat", userId: userId ?? null },
      });
      actualChatId = newChat.id; // ✅ this is a UUID string
    }

    await prisma.message.create({
      data: {
        chatId: actualChatId, // ✅ string UUID now matches schema
        role,
        content: text,
      },
    });

    return NextResponse.json({ chatId: actualChatId });
  } catch (err) {
    console.error("Error in /api/chats/send:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
