import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 📌 Fetch chats
import { auth } from "@clerk/nextjs/server";


export async function GET() {
  const { userId } = await auth(); // <-- synchronous, gives { userId, sessionId, getToken }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      userId: true,
      archived: true,
      createdAt: true,
    },
  });

  return NextResponse.json(chats);
}
/////////////


// 📌 Create chat
export async function POST(req: Request) {
  const body = await req.json();

  const chat = await prisma.chat.create({
    data: {
      title: body.title ?? "New Chat",
      userId: body.userId ?? null,
    },
  });

  return NextResponse.json(chat);
}
