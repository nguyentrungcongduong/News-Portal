import React, { useEffect, useState } from "react";
import axios from "axios";

interface EditorialNote {
  id: number;
  content: string;
  author: string;
  author_id: number;
  visibility: "editor" | "admin";
  created_at: string;
  updated_at: string;
}

interface EditorialNotesProps {
  postId: number;
  canEdit: boolean;
  userRole: "admin" | "editor" | "author";
}

export default function EditorialNotes({
  postId,
  canEdit,
  userRole,
}: EditorialNotesProps) {
  const [notes, setNotes] = useState<EditorialNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [visibility, setVisibility] = useState<"editor" | "admin">("editor");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadNotes();

    // Poll every 30 seconds
    const interval = setInterval(loadNotes, 30000);
    return () => clearInterval(interval);
  }, [postId]);

  const loadNotes = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}/editorial-notes`);
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `/api/posts/${postId}/editorial-notes`,
        {
          note: newNote,
          visibility,
        },
      );

      setNotes([response.data, ...notes]);
      setNewNote("");
      setVisibility("editor");
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi tạo ghi chú");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (noteId: number) => {
    setSubmitting(true);
    try {
      await axios.put(`/api/posts/${postId}/editorial-notes/${noteId}`, {
        note: editContent,
        visibility,
      });

      setNotes(
        notes.map((n) =>
          n.id === noteId ? { ...n, content: editContent, visibility } : n,
        ),
      );
      setEditingId(null);
      setEditContent("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi cập nhật ghi chú");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm("Xóa ghi chú này?")) return;

    try {
      await axios.delete(`/api/posts/${postId}/editorial-notes/${noteId}`);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi xóa ghi chú");
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 mb-4">📝 Biên tập nội bộ</h3>

      {/* Add Note Form */}
      {canEdit && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-3 bg-white rounded border border-blue-100"
        >
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Thêm ghi chú..."
            className="w-full p-2 border rounded mb-2 text-sm"
            rows={2}
          />

          <div className="flex gap-2 items-center">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="editor">👁 Editor chỉ</option>
              <option value="admin">🔐 Admin chỉ</option>
            </select>

            <button
              type="submit"
              disabled={submitting || !newNote.trim()}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-blue-700">Đang tải...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-blue-700">Chưa có ghi chú</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-3 rounded border border-blue-100 text-sm"
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(note.id)}
                      disabled={submitting}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-blue-900">
                      {note.author}
                    </span>
                    <span className="text-xs text-blue-600">
                      {note.visibility === "admin" ? "🔐 Admin" : "👁 Editor"}
                    </span>
                  </div>
                  <p className="text-blue-900 mb-2">{note.content}</p>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                    <span className="text-blue-400 ml-auto">
                      {new Date(note.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
