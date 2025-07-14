import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Vote from "@/models/Vote";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User";

// Function to build a tree of comments
function buildCommentTree(comments, parentId = null, depth = 0) {
  console.log(`Building comment tree at depth ${depth}, parentId: ${parentId}, comments count: ${comments.length}`);
  const result = [];
  const childrenMap = {};

  // First pass: categorize comments by parent ID
  comments.forEach((comment) => {
    // Ensure we have a string ID for consistency
    const id = comment._id.toString();

    if (!childrenMap[id]) {
      childrenMap[id] = [];
    }

    if (comment.parent) {
      // Convert parent ID to string for consistent comparison
      const parentIdStr = typeof comment.parent === "object"
        ? comment.parent.toString()
        : comment.parent.toString();
      
      console.log(`Comment ${id} has parent ${parentIdStr}`);

      if (!childrenMap[parentIdStr]) {
        childrenMap[parentIdStr] = [];
      }
      childrenMap[parentIdStr].push(comment);
    }
  });

  // Log the childrenMap structure
  console.log('ChildrenMap structure:');
  Object.keys(childrenMap).forEach(key => {
    console.log(`Parent ${key} has ${childrenMap[key].length} children`);
  });

  // Second pass: find top-level comments and build tree recursively
  const processedComments = [];
  
  comments.forEach((comment) => {
    // Convert IDs to strings for consistent comparison
    const commentId = comment._id.toString();
    const commentParentId = comment.parent
      ? (typeof comment.parent === "object" ? comment.parent.toString() : comment.parent.toString())
      : null;
    
    // Check if this comment belongs at this level of the tree
    const isTopLevel = parentId === null && !comment.parent;
    const isChildOfCurrentParent = parentId !== null && commentParentId === parentId;
    
    if (isTopLevel || isChildOfCurrentParent) {
      // Track that we've processed this comment
      processedComments.push(commentId);
      
      // Handle both Mongoose documents (with toJSON) and plain objects
      const commentObj = typeof comment.toJSON === "function" ? comment.toJSON() : { ...comment };
      
      // Ensure parent ID is preserved as a string
      if (commentObj.parent) {
        commentObj.parent = commentObj.parent.toString();
      }

      // Add replies to this comment
      const childComments = childrenMap[commentId] || [];
      console.log(`Comment ${commentId} has ${childComments.length} child comments`);
      
      if (childComments.length > 0) {
        commentObj.replies = buildCommentTree(
          childComments,
          commentId,
          depth + 1
        );
        console.log(`Added ${commentObj.replies.length} replies to comment ${commentId}`);
      } else {
        commentObj.replies = [];
      }

      result.push(commentObj);
    }
  });

  console.log(`Returning ${result.length} comments at depth ${depth}`);
  return result;
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Post slug is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get session for user votes
    const session = await getServerSession(authOptions);

    // Try to find post by slug first, then fallback to ID
    let post = await Post.findOne({ slug });

    if (!post && slug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(slug);
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch all comments for the post
    const comments = await Comment.find({
      post: post._id,
      isDeleted: { $ne: true }, // Exclude explicitly deleted comments
    })
      .populate("author", "username name email image")
      .sort({ createdAt: 1 });
      
    console.log(`Found ${comments.length} total comments for post ${post._id}`);
    
    // Debug: Log all comments with their parent relationships
    comments.forEach(comment => {
      console.log(`Comment ID: ${comment._id}, Parent: ${comment.parent || 'null'}, Depth: ${comment.depth}`);
    });

    // Get user votes if session exists
    let userVotes = {};
    if (session?.user?.id) {
      const votes = await Vote.find({
        user: session.user.id,
        comment: { $in: comments.map((c) => c._id) },
      });

      userVotes = votes.reduce((acc, vote) => {
        acc[vote.comment.toString()] = vote.type;
        return acc;
      }, {});
    }

    // Add user vote information to all comments
    const commentsWithVotes = comments.map((comment) => {
      const commentObj = comment.toJSON();
      commentObj.userVote = userVotes[comment._id.toString()] || null;
      return commentObj;
    });

    // Build comment tree using the comments with votes
    const commentTree = buildCommentTree(commentsWithVotes);

    return NextResponse.json(commentTree);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Post slug is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to find post by slug first, then fallback to ID
    let post = await Post.findOne({ slug });

    if (!post && slug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(slug);
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data = await request.json();
    const { body, parentId } = data;

    if (!body?.trim()) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    // Create comment object
    const commentData = {
      body: body.trim(),
      author: session.user.id,
      post: post._id,
    };

    // If this is a reply, set parent and fetch its depth
    if (parentId) {
      console.log(`Creating a reply to parent comment: ${parentId}`);
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        console.error(`Parent comment not found: ${parentId}`);
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
      
      console.log(`Found parent comment: ${parentComment._id}, depth: ${parentComment.depth}`);
      commentData.parent = parentId;
      commentData.depth = parentComment.depth + 1;
      console.log(`Setting reply depth to: ${commentData.depth}`);
    } else {
      console.log('Creating a top-level comment');
      commentData.depth = 0;
    }

    // Create and save the comment
    const comment = new Comment(commentData);
    await comment.save();

    // Increment comment count on the post
    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    // Award 1 aura point to the user for commenting
    await User.findByIdAndUpdate(session.user.id, { $inc: { auraPoints: 1 } });

    // Populate author data
    await comment.populate("author", "username name email image");
    
    // Convert to plain object and ensure proper structure
    const commentObj = comment.toJSON();
    
    // Ensure parent is a string if it exists
    if (commentObj.parent) {
      commentObj.parent = commentObj.parent.toString();
      console.log(`Converted parent ID to string: ${commentObj.parent}`);
    }
    
    // Initialize empty replies array
    commentObj.replies = [];
    
    console.log('Returning new comment/reply:', JSON.stringify({
      _id: commentObj._id,
      parent: commentObj.parent,
      depth: commentObj.depth,
      replies: commentObj.replies
    }));

    return NextResponse.json(commentObj, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
