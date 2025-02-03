"use client";
import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { UserWithRelations } from "@/types/user";
import { Button } from "./ui/button";
import { ImageIcon, ImageUpIcon, SendIcon, TrashIcon } from "lucide-react";
import Loader from "./ui/Loader";
import { createPost } from "@/server/_actions/posts";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

const CreatePost = ({ user }: { user: UserWithRelations }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // Store the image file temporarily
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const getImageUrl = async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("pathName", "posts_images");
    console.log([...formData.entries()]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/uploadposts`,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the file temporarily
      setImageUrl(URL.createObjectURL(file)); // Create a local URL for preview
      setShowImageUpload(false); // Close the image upload section
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return; // Ensure content or image is present
    setIsPosting(true);
    try {
      let cloudinaryUrl = "";
      if (imageFile) {
        cloudinaryUrl = (await getImageUrl(imageFile)) as string; // Upload the image to Cloudinary only when posting
      }
      const result = await createPost(content, cloudinaryUrl); // Create the post with the content and image URL
      if (result?.success === true) {
        toast({
          title: "Post Created Successfully",
          className: "text-green-400",
        });
        setContent("");
        setImageFile(null);
        setImageUrl("");
        setShowImageUpload(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6 bg-background">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.image || "/avatar.png"} />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px] !resize-none border-none focus:border-none focus:ring-0 focus-visible:ring-0 active:ring-0 p-0.5 text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>

          {/* Custom Image Upload Button */}
          {showImageUpload && (
            <div className="mt-4">
              <label className="cursor-pointer inline-block w-full py-2 px-4 text-center bg-background">
                <Card className="p-5">
                  <CardTitle className="p-4 element-center">
                    <ImageUpIcon className="!w-20 !h-20" />
                  </CardTitle>
                  <CardContent>Upload image</CardContent>
                </Card>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" // Hide the default file input
                />
              </label>
            </div>
          )}

          {/* Display uploaded image preview */}
          {imageUrl && (
            <div className="mt-4 relative">
              <Image
                src={imageUrl}
                alt="Uploaded"
                width={300}
                height={300}
                className="w-full h-auto rounded-md"
              />
              <Button
                className="absolute top-0 right-0 bg-red-500 text-white"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImageUrl("");
                }}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={"ghost"}
                size={"sm"}
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageFile) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader /> Posting...
                </>
              ) : (
                <>
                  <SendIcon /> Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;