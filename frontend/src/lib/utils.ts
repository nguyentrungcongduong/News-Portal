const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

export function formatVietnameseDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VN_TIMEZONE,
      ...options,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Less than 1 hour
    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `${minutes} phút trước`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} giờ trước`;
    }

    // Less than 7 days
    if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} ngày trước`;
    }

    // Default to formatted date
    return formatVietnameseDate(dateString);
  } catch {
    return dateString;
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");
}
