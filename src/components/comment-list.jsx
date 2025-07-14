"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "./comment-item";
import { Loader2 } from "lucide-react";

export function CommentList({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}/comments`);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (!session || !newComment.trim()) return;

    try {
      setSubmitting(true);

      const payload = {
        body: newComment.trim(),
        parentId: replyingTo,
      };

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit comment");
      }

      const newCommentData = await response.json();

      // Update the comments state based on whether it's a reply or top-level comment
      if (replyingTo) {
        // Add the reply to the appropriate parent comment
        setComments((prevComments) => {
          return addReplyToComments(prevComments, replyingTo, newCommentData);
        });
      } else {
        // Add as a top-level comment
        setComments((prevComments) => [...prevComments, newCommentData]);
      }

      // Reset the form
      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError(error.message || "Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to recursively add a reply to nested comments
  const addReplyToComments = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment._id === parentId) {
        // Add the reply to this comment
        return {
          ...comment,
          replies: Array.isArray(comment.replies) ? [...comment.replies, newReply] : [newReply],
        };
      } else if (comment.replies && Array.isArray(comment.replies) && comment.replies.length) {
        // Check nested replies
        return {
          ...comment,
          replies: addReplyToComments(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  // Handle updating a comment
  const handleUpdateComment = async () => {
    if (!editingComment) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/comments/${editingComment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedComment = await response.json();

      // Update the comments state
      setComments((prevComments) => {
        return updateCommentInTree(prevComments, updatedComment);
      });

      // Reset the form
      setNewComment("");
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      setError(error.message || "Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to recursively update a comment in the nested structure
  const updateCommentInTree = (comments, updatedComment) => {
    return comments.map((comment) => {
      if (comment._id === updatedComment._id) {
        return { ...comment, ...updatedComment };
      } else if (comment.replies && Array.isArray(comment.replies) && comment.replies.length) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, updatedComment),
        };
      }
      return comment;
    });
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      const data = await response.json();

      // Update the comments state
      setComments((prevComments) => {
        return updateCommentInTree(prevComments, data);
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError(error.message || "Failed to delete comment");
    }
  };

  // Handle reply button click
  const handleReply = (parentId, newReply = null) => {
    if (newReply) {
      // This is a new reply being added from a nested comment
      setComments((prevComments) => {
        return addReplyToComments(prevComments, parentId, newReply);
      });
    } else {
      // This is setting up to reply
      setReplyingTo(parentId);
      setEditingComment(null);
      setNewComment("");

      // Focus the textarea
      setTimeout(() => {
        document.getElementById("comment-textarea")?.focus();
      }, 0);
    }
  };

  // Handle edit button click
  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
    setNewComment(comment.body);

    // Focus the textarea
    setTimeout(() => {
      document.getElementById("comment-textarea")?.focus();
    }, 0);
  };

  // Handle cancel button click
  const handleCancel = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setNewComment("");
  };

  if (loading && comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

      {/* Comment form */}
      {session && (
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-medium">
            {replyingTo
              ? "Write a reply"
              : editingComment
              ? "Edit your comment"
              : "Leave a comment"}
          </h3>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Textarea
            id="comment-textarea"
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              if (error) setError(null); // Clear error when user starts typing
            }}
            placeholder="What are your thoughts?"
            className="resize-none min-h-[100px]"
          />
          <div className="flex justify-between items-center">
            {/* Aura Points Info */}
            {!editingComment && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-sm font-bold text-primary">+1</span>
                <span>Earn 1 aura point for commenting</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {(replyingTo || editingComment) && (
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={
                  editingComment ? handleUpdateComment : handleSubmitComment
                }
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingComment ? "Updating..." : "Submitting..."}
                  </>
                ) : editingComment ? (
                  "Update"
                ) : replyingTo ? (
                  "Reply"
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="py-8 text-center bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No comments yet</p>
          {session && (
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to share your thoughts!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4 divide-y">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
