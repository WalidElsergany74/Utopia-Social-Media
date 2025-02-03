"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const createPost= async(content:string, image:string) => {
   try {
     const session =  await  getServerSession(authOptions)
     if (!session?.user?.id) {
        return { success: false, message: "User is not authenticated" };
      }
     const post = await db.post.create({
        data : {
            content,
            image,
            authorId : session?.user.id,
        }
     })
     revalidatePath("/")
     return {success : true, post}
   } catch (error) {
     console.log(error)
   }
}

export const getPosts = async () => {
   try {
    const posts = await db.post.findMany({
      orderBy : {
        createdAt : "desc"
      },
      include : {
        author : {
          select : {
            id : true,
            username : true,
            name : true,
            image : true
          }
        },
        comments : {
          include : {
            author : {
              select : {
                id : true,
                username : true,
                image : true,
                name :true
              },
            }
          },
          orderBy : {
            createdAt : "asc"
          }
        },
        likes : {
          select : {
            userId : true
          }
        },
        _count : {
          select : {
            likes : true,
            comments : true
          }
        }
      }
      
    })
    return posts
   } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch posts")
   }
}


export async function toggleLike(postId: string) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id

    if (!userId) return;

    // check if like exists
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // unlike
      await db.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await db.$transaction([
        db.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              db.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // recipient (post author)
                  creatorId: userId, // person who liked
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id
    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await db.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    revalidatePath("/notifications");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id

    if (!userId) return;

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

    await db.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
   
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

