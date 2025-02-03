"use client";

import { useState } from "react";
import { Button } from "./ui/button";

import { toast } from "@/hooks/use-toast";
import { toggleFollow } from "@/server/_actions/users";
import Loader from "./ui/Loader";


function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      toast({
        title : "User followed successfully",
        className : "text-green-400"
      });
    } catch (error) {
        console.log(error)
      toast({
        title : "Error following user",
        className : "text-destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
export default FollowButton;