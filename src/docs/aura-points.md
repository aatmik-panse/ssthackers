# Aura Points System

The Aura Points system is designed to encourage positive participation in the SST Hackers community.

## Points Allocation

Users earn Aura Points for the following actions:

- **Creating a post**: +3 points
- **Creating a comment**: +1 point
- **Admin-created posts**: +3 points per post (when an admin creates a post on behalf of a user)

## Points Reduction

Points can be reduced for the following actions:

- **Deleting a post**: -3 points

## Implementation Details

Aura Points are stored in the User schema in the `auraPoints` field, which defaults to 0.

```javascript
// User schema excerpt
auraPoints: {
  type: Number,
  default: 0,
  min: 0
}
```

The points are modified in the following API routes:
- `/api/posts/route.js` - awards 3 points when creating a post
- `/api/posts/[id]/route.js` - deducts 3 points when deleting a post
- `/api/comments/route.js` - awards 1 point when creating a comment
- `/api/posts/[id]/comments/route.js` - awards 1 point when creating a comment
- `/api/admin/posts-for-user/route.js` - awards 3 points when an admin creates a post for a user
- `/api/auth/signup/route.js` - awards 3 points per admin-created post when a user signs up

## Admin-Created Posts

Administrators can create posts on behalf of users using their email address:

1. If the user already exists, the post is created directly for them and they are awarded 3 aura points.
2. If the user doesn't exist yet, the post is still created in the regular posts collection but with the admin as the temporary author and the target user's email stored. When the user signs up with that email address, the post is reassigned to them and they are awarded 3 aura points.

Users can see posts created for them by admins in a special "Admin-Created" tab on their profile page.

## Display

The Aura Points are displayed in:
- User profiles
- Leaderboards
- Information prompts in post and comment forms

## Future Enhancements

Potential future enhancements for the Aura Points system:
- Points for receiving upvotes on posts or comments
- Badges or levels based on Aura Points
- Special privileges for users with high Aura Points 