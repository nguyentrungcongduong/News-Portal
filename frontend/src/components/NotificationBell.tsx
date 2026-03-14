"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  url: string;
  created_at: string;
  is_active: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/api/public/notifications");
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (e: any) {
      // Provide detailed error logging for debugging
      const errorMsg = e?.message || "Failed to fetch notifications";
      const statusCode = e?.response?.status;
      const errorType = e?.code || "UNKNOWN";

      console.warn("Notification API Error:", {
        message: errorMsg,
        status: statusCode,
        code: errorType,
        url: e?.config?.url,
        isNetworkError: errorMsg === "Network Error",
      });

      // Only show error in UI for critical issues
      if (errorMsg === "Network Error" || errorType === "ECONNREFUSED") {
        setError(
          "Backend not responding - make sure Laravel is running on port 8010",
        );
      } else if (statusCode === 404) {
        setError("Endpoint not found - check API route configuration");
      } else if (statusCode === 500) {
        setError("Server error - check Laravel logs");
      }
      // For other errors (like timeouts), silently fail to avoid UI clutter

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        className="relative p-2 text-zinc-600 hover:text-blue-600 transition-colors disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
        type="button"
        disabled={isLoading && notifications.length === 0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden text-left">
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 font-bold text-sm bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
              <span>Thông báo mới</span>
              {isLoading && (
                <span className="text-xs text-zinc-500">Đang tải...</span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs border-b border-red-200 dark:border-red-800">
                  <p className="font-semibold mb-1">⚠️ {error}</p>
                  <p className="text-[11px]">
                    Hệ thống thông báo hiện không khả dụng
                  </p>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  {error ? "Không thể tải thông báo" : "Không có thông báo mới"}
                </div>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    onClick={() => setIsOpen(false)}
                    className="block p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 mt-1 w-2 h-2 rounded-full ${item.type === "breaking_news" ? "bg-red-500" : "bg-blue-500"}`}
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-500 mb-0.5 uppercase tracking-wider">
                          {item.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {new Date(item.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
