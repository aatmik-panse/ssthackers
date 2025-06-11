# Aura Points System

The Aura Points system is designed to encourage positive participation in the SST Hackers community.

## Points Allocation

Users earn Aura Points for the following actions:

- **Creating a post**: +3 points
- **Creating a comment**: +1 point

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