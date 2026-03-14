# 🔒 Content Lock System

## Overview

Hệ thống khóa nội dung đảm bảo chỉ **1 người tại 1 thời điểm** có thể edit bài viết.

## Database Schema

```
content_locks:
- id (PK)
- lockable_type: 'Post' (polymorphic)
- lockable_id: ID của resource
- user_id: Ai đang lock
- locked_at: Thời điểm lock
- expires_at: Khi nào unlock (TTL = 10 min)
```

## API Endpoints

### Acquire Lock

```
POST /api/content-locks/acquire
Body: {
  "lockable_type": "Post",
  "lockable_id": 123
}

Response (200):
{
  "acquired": true,
  "lock": { ... },
  "message": "Lock acquired"
}

Response (409):
{
  "acquired": false,
  "lock": {
    "user_id": 5,
    "user_name": "Editor Nguyen",
    "remaining_seconds": 240
  },
  "message": "Resource is locked by another user"
}
```

### Release Lock

```
POST /api/content-locks/release
Body: {
  "lockable_type": "Post",
  "lockable_id": 123
}
```

### Check Status

```
GET /api/content-locks/check?lockable_type=Post&lockable_id=123
```

### Renew Lock (keep-alive)

```
POST /api/content-locks/renew
Body: { "lockable_type": "Post", "lockable_id": 123 }
```

### Force Unlock (Admin)

```
POST /api/content-locks/force-unlock
Admin only! Logs audit trail.
```

## Frontend Integration

### Hook Usage

```typescript
import { useLock } from '@/hooks/useLock';

function EditPostPage() {
  const { isLocked, lockError } = useLock({
    lockable_type: 'Post',
    lockable_id: 123
  });

  if (lockError) {
    return <div className="alert">{lockError}</div>;
  }

  return <PostEditor />;
}
```

### Component Usage

```jsx
<ContentLockIndicator
  postId={123}
  onLocked={(lock) => console.log(lock.user_name)}
/>
```

## Business Logic

### Case 1: User A locks, User B tries to access

- ✅ A gets lock, B gets 409 + lock info
- ✅ B can view read-only
- ✅ Lock expires in 10 min

### Case 2: Lock expires

- ✅ Auto-cleanup on next check
- ✅ User A auto-retained if still editing
- ✅ User B can takeover after expiry

### Case 3: Same user, multiple tabs

- ✅ Both tabs share same lock
- ✅ Lock renews on each tab action
- ✅ Release only when last tab closes

### Case 4: Admin force unlock

- ✅ Original user's lock deleted
- ✅ Audit log created
- ✅ New user can acquire

## Security

- ✅ User context checked (auth:sanctum)
- ✅ Force unlock requires admin role
- ✅ All actions logged
- ✅ No data modification, just lock state

## TTL Configuration

Default: **10 minutes**

Edit in `ContentLock::LOCK_DURATION_MINUTES`

## Polymorphism

Có thể extend cho:

- Pages
- Settings
- Templates
- Bất kỳ resource nào

Chỉ cần set `lockable_type` khác.
