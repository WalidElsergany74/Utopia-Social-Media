import { notFound } from "next/navigation";
import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/server/_actions/profile";
import ProfilePageClient from "./ProfilePageClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
};


export async function generateMetadata(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params, searchParams }: Props,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = params; // Get username directly from params
  const user = await getProfileByUsername(username);

  if (!user) {
    return {
      title: "User not found",
      description: "The requested user profile could not be found.",
    };
  }

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params:{ username : string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  const initalSession = await getServerSession(authOptions);

  return (
    <>
      <ProfilePageClient
        initalSession={initalSession}
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
      />
    </>
  );
}

export default ProfilePageServer;
