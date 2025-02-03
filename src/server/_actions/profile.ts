"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { revalidatePath } from "next/cache";
import { Routes } from "@/constants/enums";
import { updateProfileSchema } from "@/validation/profile";



export async function getProfileByUsername(username: string) {
  try {
    const user = await db.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        email : true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await db.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await db.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return likedPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

// export async function updateProfile(formData: FormData) {
//   try {
//     const session = await getServerSession(authOptions)
//            const userId = session?.user.id
//            if(!userId) throw new Error("failed")

//     const name = formData.get("name") as string;
//     const bio = formData.get("bio") as string;
//     const location = formData.get("location") as string;
//     const website = formData.get("website") as string;
//     const image = formData.get("image") as File
    
//     const imageFile = image as File;
//     const imageUrl = Boolean(imageFile.size)
//       ? await getImageUrl(imageFile)
//       : undefined;
  

//     const user = await db.user.update({
//       where: { id : userId },
//       data: {
//         name,
//         bio,
//         location,
//         website,
//         image : imageUrl ?? session?.user.image
//       },
//     });

//     revalidatePath("/profile");
//     return { success: true, user };
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     return { success: false, error: "Failed to update profile" };
//   }
// }

// export async function updateProfile(formData: FormData) {
//   try {
//     const session = await getServerSession(authOptions);
//     const userId = session?.user.id;
//     if (!userId) throw new Error("failed");

//     const name = formData.get("name") as string;
//     const bio = formData.get("bio") as string;
//     const location = formData.get("location") as string;
//     const website = formData.get("website") as string;
//     const image = formData.get("image") as File | null;

//     let imageUrl = session?.user.image; // الصورة الافتراضية

//     if (image && image.size > 0) {
//       imageUrl = await getImageUrl(image); // رفع الصورة وإرجاع رابطها
//     }

//     const user = await db.user.update({
//       where: { id: userId },
//       data: {
//         name,
//         bio,
//         location,
//         website,
//         image: imageUrl,
//       },
//     });

//     revalidatePath("/profile");
//     return { success: true, user };
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     return { success: false, error: "Failed to update profile" };
//   }
// }

export const updateProfile = async (

  prevState: unknown,
  formData: FormData
) => {
  
  
  const result = updateProfileSchema().safeParse(
    Object.fromEntries(formData.entries())
  );

  if (result.success === false) {
    return {
      error: result.error.formErrors.fieldErrors,
      formData,
    };
  }
  const data = result.data;
  console.log(data)
  const imageFile = data.image as File;
  const imageUrl = Boolean(imageFile.size)
    ? await getImageUrl(imageFile)
    : undefined;

  try {
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      return {
        message: "User not found",
        status: 401,
        formData,
      };
    }
    await db.user.update({
      where: {
        email: user.email,
      },
      data: {
        ...data,
        image: imageUrl ?? user.image,
        
      },
    });
    revalidatePath(`/${Routes.PROFILE}`);
    revalidatePath(`/${Routes.PROFILE}/${user.username}`);
    revalidatePath(`/`);

    return {
      status: 200,
      message: "Profile updated suceefully",
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "unexpected Error"
    };
  }
};



export async function isFollowing(userid: string) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id
    if(!userId) return false;

    const follow = await db.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: userid,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

const getImageUrl = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("pathName", "profile_images");
  console.log([...formData.entries()]);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const image = (await response.json()) as { url: string };
    return image.url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
  }
};