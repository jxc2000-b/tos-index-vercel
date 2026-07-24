"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Not authorized.");
  }
  return session.user;
}

export async function toggleAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");

  // Guard against locking yourself out.
  if (!userId || userId === admin.id) {
    return;
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  if (!target) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: !target.isAdmin },
  });

  revalidatePath("/admin");
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) {
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { published: true },
  });
  if (!post) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { published: !post.published },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) {
    return;
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/admin");
  revalidatePath("/");
}
