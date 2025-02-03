"use client"
import { useClientSession } from '@/hooks/useClientSession';
import { getProfileByUsername, getUserPosts, updateProfile } from '@/server/_actions/profile';
import { toggleFollow } from '@/server/_actions/users';
import { Session } from 'next-auth';
import React, { useActionState, useEffect, useState } from 'react'
import { format } from "date-fns";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CameraIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapPinIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from './_components/PostCard';
import { toast } from '@/hooks/use-toast';
import Loader from '@/components/ui/Loader';
import Image from 'next/image';
import { ValidationErrors } from '@/validation';
import useFormFields from '@/hooks/useFormFields';
import { InputTypes, Routes } from '@/constants/enums';
import FormFields from '@/components/form-fields/FormFields';
import { IFormField } from '@/types';


type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  initalSession : Session | null
}
const ProfilePageClient = ({user,posts,likedPosts,isFollowing : initialIsFollowing ,initalSession} : ProfilePageClientProps) => {
    const currentUser = useClientSession(initalSession)
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const [selectedImage, setSelectedImage] = useState(user.image ?? "");
    const formData = new FormData();
    
    Object.entries(user).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "image") {
        formData.append(key, value.toString());
      }
    });

    const initialState: {
      message?: string;
      error?: ValidationErrors;
      status?: number | null;
      formData?: FormData | null;
    } = {
      message: "",
      error: {},
      status: null,
      formData,
    };
    const [state, action, pending] = useActionState(updateProfile,initialState );
    const { getFormFields } = useFormFields({
      slug: Routes.PROFILE,
    
    });

  
    // const handleEditSubmit = async () => {
    //    try {
    //     setIsUpdating(true)
    //     const formData = new FormData();
    //     Object.entries(editForm).forEach(([key, value]) => {
    //       formData.append(key, value);
    //     });
    
    //     const result = await updateProfile(formData);
    //     if (result.success) {
    //       setShowEditDialog(false);
    //       toast({
    //           title : "Profile updated successfully",
    //           className : "text-primary"
    //       });
    //     }
    //    } catch (error) {
    //     console.log(error)
    //    }finally {
    //     setIsUpdating(false)
    //    }
    // };
  
    const handleFollow = async () => {
      if (!currentUser) return;
  
      try {
        setIsUpdatingFollow(true);
        await toggleFollow(user.id);
        setIsFollowing(!isFollowing);
      } catch (error) {
        console.log(error)
        toast({
            title : "Failed to update follow status",
            className : "text-destructive"
        });
      } finally {
        setIsUpdatingFollow(false);
      }
    };
  
    const isOwnProfile = currentUser?.data?.user.username === user.username
    const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");
    useEffect(() => {
      if (state.message && state.status && !pending) {
        toast({
          title: state.message,
          className: state.status === 200 ? "text-green-400" : "text-destructive",
        });
      }
    }, [pending, state.message, state.status]);
  
    useEffect(() => {
      setSelectedImage(user.image as string);
    }, [user.image]);
  return (
     <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-background">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-[130px] h-[130px]">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold">{user._count.following}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                    <Separator  orientation="vertical" />
                    <div>
                      <div className="font-semibold">{user._count.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">{user._count.posts}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {!currentUser ? (
                  
                    <Button className="w-full mt-4">Follow</Button>
                  
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} userId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post} userId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form action={action} className="flex flex-col md:flex-row gap-10">
                    <div className="group relative w-24 h-24 overflow-hidden rounded-full mx-auto">
                        {selectedImage && (
                            <Image
                                src={selectedImage}
                                alt={user?.name as string}
                                width={96}
                                height={96}
                                className="rounded-full object-cover"
                            />
                        )}
                           <div
          className={`${
            selectedImage
              ? "group-hover:opacity-[1] opacity-0  transition-opacity duration-200"
              : ""
          } absolute top-0 left-0 w-full h-full bg-gray-50/40`}
        >
          <UploadImage setSelectedImage={setSelectedImage} />
        </div>
                    </div>
                    <div className="flex-1">
                    {getFormFields().map((field: IFormField) => {
          const fieldValue =
            state?.formData?.get(field.name) ?? formData.get(field.name);
          return (
            <div key={field.name} className="mb-3">
              <FormFields
                {...field}
                defaultValue={fieldValue as string}
                error={state?.error}
                readOnly={field.type === InputTypes.EMAIL}
              />
            </div>
          );
        })}

                        <Button type="submit" className="w-full">
                            {pending ? <Loader /> : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProfilePageClient;



const UploadImage = ({
  setSelectedImage,
}: {
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };
  return (
    <>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleImageChange}
        name="image"
      />
      <label
        htmlFor="image-upload"
        className="border rounded-full w-[96px] h-[96px] element-center cursor-pointer"
      >
        <CameraIcon className="!w-8 !h-8 text-accent" />
      </label>
    </>
  );
};
