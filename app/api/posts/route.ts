import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to create a post." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Invalid post data." },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      ...result.data,
      authorId: userId,
    },
    select: {
      id: true,
      title: true,
      body: true,
      published: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
