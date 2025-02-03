"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    if (!userId) return [];

    const notifications = await db.notification.findMany({
      where: { userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

  

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}


export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await db.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });
    revalidatePath("/")
    revalidatePath("/notification")
    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
}