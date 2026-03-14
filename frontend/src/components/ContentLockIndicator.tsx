import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ContentLockIndicator({ postId, onLocked }) {
  const [lockStatus, setLockStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check lock status on mount
    checkLockStatus();

    // Poll every 10 seconds
    const interval = setInterval(checkLockStatus, 10000);

    // Update countdown timer
    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev || prev <= 0) return null;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [postId]);

  const checkLockStatus = async () => {
    try {
      const response = await axios.get("/api/content-locks/check", {
        params: {
          lockable_type: "Post",
          lockable_id: postId,
        },
      });

      if (response.data.locked) {
        setLockStatus(response.data.lock);
        const remaining = Math.floor(response.data.lock.remaining_seconds);
        setTimeRemaining(remaining);
        onLocked?.(response.data.lock);
      } else {
        setLockStatus(null);
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error("Error checking lock status:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "Đã hết hạn";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!lockStatus) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-amber-600 text-xl">🔒</div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">
            Bài viết đang được chỉnh sửa
          </h3>
          <p className="text-sm text-amber-800 mt-1">
            Đang được {lockStatus.user_name} chỉnh sửa
          </p>
          <p className="text-sm text-amber-700 mt-2 font-mono">
            ⏱ Còn {formatTime(timeRemaining)} phút
          </p>
        </div>
      </div>
    </div>
  );
}
