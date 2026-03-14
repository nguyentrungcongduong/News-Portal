# 📝 Editorial Notes System

## Overview

Ghi chú biên tập **nội bộ** - không công khai, chỉ dành cho Editor/Admin.

## Database Schema

```
editorial_notes:
- id (PK)
- post_id (FK)
- user_id: Ai viết note
- note: Nội dung ghi chú
- visibility: 'editor' | 'admin'
- created_at, updated_at
```

## Visibility Rules

| Role   | editor | admin |
| ------ | ------ | ----- |
| Author | ❌     | ❌    |
| Editor | ✅     | ❌    |
| Admin  | ✅     | ✅    |

## API Endpoints

### List Notes

```
GET /api/posts/{postId}/editorial-notes

Response:
{
  "notes": [
    {
      "id": 1,
      "content": "Cần bổ sung nguồn",
      "author": "Nguyen Editor",
      "author_id": 5,
      "visibility": "editor",
      "created_at": "2026-01-21T10:00:00Z"
    }
  ],
  "total": 1
}
```

### Create Note

```
POST /api/posts/{postId}/editorial-notes
Required roles: editor, admin

Body: {
  "note": "Tiêu đề quá giật, cân nhắc lại",
  "visibility": "editor" | "admin"
}

Response (201):
{
  "id": 2,
  "content": "...",
  "visibility": "editor",
  "created_at": "2026-01-21T10:05:00Z"
}
```

### Update Note

```
PUT /api/posts/{postId}/editorial-notes/{noteId}
Author hoặc Admin

Body: {
  "note": "Updated content",
  "visibility": "admin"
}
```

### Delete Note

```
DELETE /api/posts/{postId}/editorial-notes/{noteId}
Author hoặc Admin
```

### Count Notes

```
GET /api/posts/{postId}/editorial-notes/count

Response: { "count": 3 }
```

## Frontend Component

```tsx
<EditorialNotes postId={123} canEdit={true} userRole="editor" />
```

## Use Cases

### Case 1: Sửa lỗi chính tả

```
Note: "Dòng 3 'công ty' viết sai 'công ty', sửa đi"
Visibility: editor (tất cả biên tập viên thấy)
```

### Case 2: Vấn đề pháp lý

```
Note: "Cân nhắc lại nội dung đoạn 2, có thể vi phạm quy định quảng cáo"
Visibility: admin (chỉ admin thấy)
```

### Case 3: Gợi ý cải thiện

```
Note: "Ảnh header tối quá, tìm ảnh sáng hơn"
Visibility: editor
```

## History & Audit

- ✅ Tất cả notes lưu created_at, updated_at
- ✅ Mỗi note ghi user_id (ai viết)
- ✅ Edit trail không giữ history (optional: thêm versions table)

## Notification (Future)

Có thể thêm:

- 🔔 Notify editor khi có note mới
- 📧 Email summary hàng ngày

## Differences vs Review Comments

| Feature         | Editorial Notes | Review Comments    |
| --------------- | --------------- | ------------------ |
| Hiển thị        | Sidebar panel   | Inline popup       |
| Mục đích        | Trao đổi nội bộ | Feedback công khai |
| Visibility      | Limited         | Public (author)    |
| Xóa khi publish | Không           | Có (optional)      |
