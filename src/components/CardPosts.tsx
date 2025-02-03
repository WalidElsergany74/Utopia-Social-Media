"use client"
import { toast } from '@/hooks/use-toast'
import { createComment, deletePost, getPosts, toggleLike } from '@/server/_actions/posts'
import { Session } from 'next-auth'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import Link from './link'
import { Avatar, AvatarImage } from './ui/avatar'
import { DeleteAlertDialog } from './DeleteAlertDialog'
import { formatDistanceToNow } from "date-fns";
import Image from 'next/image'
import { Button } from './ui/button'
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Pages, Routes } from '@/constants/enums'

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

const CardPosts = ({ post, userId, session }: { post: Post, userId: string, session: Session | null }) => {
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === userId));
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [isLoadingComments, setIsLoadingComments] = useState(false); 
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false); 
  const user = session?.user;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "You need to be logged in to like the post.",
        description: "Please sign in to interact with this post.",
        className: "text-yellow-500",
      });
      return;
    }
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      console.log(error);
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === userId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast({
          title: "Comment posted successfully",
          className: "text-green-400"
        });
        setNewComment("");
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to comment"
      });
    } finally {
      setIsCommenting(false);
    }
  }

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result?.success) {
        toast({
          title: "Post deleted successfully",
          className: "text-green-400"
        })
      }
      else throw new Error(result?.error);
    } catch (error) {
      console.log(error);
      toast({
        title: "Deleting post failed",
        className: "text-destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      setIsLoadingComments(true);
      setTimeout(() => {
        setIsLoadingComments(false);
      }, 1000); // Simulate initial loading delay
    }
  }, [showComments]);

  const loadMoreComments = () => {
    if (isLoadingMoreComments) return;
    setIsLoadingMoreComments(true);
    setTimeout(() => {
      setVisibleCommentsCount((prev) => prev + 3);
      setIsLoadingMoreComments(false);
    }, 1000); // Simulate loading more comments delay
  };

  return (
    <Card className="overflow-hidden bg-background h-auto w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {userId == post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>

          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <Image  width={500} height={500} src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}

          <div className="flex items-center pt-2 space-x-4">
            {userId ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${
                  hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <Button onClick={handleLike} variant="ghost" size="sm" className="text-muted-foreground gap-2">
                <HeartIcon className="size-5" />
                <span>{optimisticLikes}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* Skeleton Loader for initial load */}
                {isLoadingComments && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display initial comments after loading */}
                {!isLoadingComments && (
                  <>
                    {post.comments.slice(0, visibleCommentsCount).map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="size-8 flex-shrink-0">
                          <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-sm text-muted-foreground">
                              @{comment.author.username}
                            </span>
                            <span className="text-sm text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Skeleton Loader for new comments */}
                {isLoadingMoreComments && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LOAD MORE BUTTON */}
              {visibleCommentsCount < post.comments.length && !isLoadingMoreComments && (
                <div className="flex justify-center">
                  <Button onClick={loadMoreComments} variant="outline" className="gap-2">
                    Load more comments
                  </Button>
                </div>
              )}

              {userId ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.image || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <Link href={`/${Routes.AUTH}/${Pages.LOGIN}`} >
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CardPosts;