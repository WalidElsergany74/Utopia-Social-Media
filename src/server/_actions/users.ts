"use server"
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { revalidatePath } from "next/cache";

export async function getRandomUsers() {
    try {
      const session = await getServerSession(authOptions)
      const userId = session?.user.id
  
      if (!userId) return [];
  
      // get 3 random users exclude ourselves & users that we already follow
      const randomUsers = await db.user.findMany({
        where: {
          AND: [
            { NOT: { id: userId } },
            {
              NOT: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          _count: {
            select: {
              followers: true,
            },
          },
        },
        take: 3,
      });
  
      return randomUsers;
    } catch (error) {
      console.log("Error fetching random users", error);
      return [];
    }
  }
  
  export async function toggleFollow(targetUserId: string) {
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user.id;
  
      if (!userId) return;
  
      if (userId === targetUserId) throw new Error("You cannot follow yourself");
  
      const existingFollow = await db.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
  
      if (existingFollow) {
        // unfollow
        await db.follows.delete({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetUserId,
            },
          },
        });
      } else {
        // follow
        await db.$transaction([
          db.follows.create({
            data: {
              followerId: userId,
              followingId: targetUserId,
            },
          }),
          db.notification.create({
            data: {
              type: "FOLLOW",
              userId: targetUserId, // user being followed
              creatorId: userId, // user following
            },
          }),
        ]);
      }
  
     
   
      revalidatePath(`/profile/${targetUserId}`);
      revalidatePath("/notifications")
      revalidatePath("/");
  
      return { success: true };
    } catch (error) {
      console.log("Error in toggleFollow", error);
      return { success: false, error: "Error toggling follow" };
    }
  }
  
  
  
  
  