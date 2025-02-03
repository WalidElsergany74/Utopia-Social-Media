import { db } from "@/lib/prisma";

export const getUser = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
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
};