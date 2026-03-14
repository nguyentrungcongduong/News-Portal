import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hỗ trợ | News Portal",
  description:
    "Trung tâm hỗ trợ News Portal: gửi yêu cầu, báo sự cố và kết nối với đội ngũ chăm sóc độc giả 24/7.",
};

const supportChannels = [
  {
    title: "Trò chuyện trực tuyến",
    description:
      "Kết nối ngay với chuyên viên hỗ trợ qua live chat. Chúng tôi phản hồi trung bình trong vòng 2 phút.",
    action: {
      label: "Bắt đầu chat",
      href: "mailto:support@newsportal.vn?subject=Chat%20support",
    },
  },
  {
    title: "Email hỗ trợ",
    description:
      "Gửi yêu cầu chi tiết, đính kèm tài liệu. Phù hợp cho phản hồi chuyên sâu và vấn đề pháp lý.",
    action: {
      label: "support@newsportal.vn",
      href: "mailto:support@newsportal.vn",
    },
  },
  {
    title: "Hotline 24/7",
    description:
      "0981 123 456 (phím 1: độc giả, phím 2: cộng tác viên). Cước phí theo nhà mạng.",
    action: {
      label: "Gọi ngay",
      href: "tel:0981123456",
    },
  },
];

export default function SupportPage() {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl shadow-blue-100/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/40">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-500">
            Support Center
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 dark:text-white lg:text-5xl">
            Cùng bạn xử lý mọi vấn đề trong 1 nơi duy nhất.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Đội ngũ News Portal sẵn sàng hỗ trợ bạn 24/7 về tài khoản, thanh toán, bản quyền nội dung,
            phản ánh sai phạm và các đề xuất hợp tác.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="mailto:support@newsportal.vn"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
            >
              Gửi yêu cầu hỗ trợ
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-white dark:hover:text-white"
            >
              Tìm hiểu về News Portal
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {supportChannels.map((channel) => (
            <div
              key={channel.title}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-blue-400"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
                {channel.title}
              </div>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{channel.description}</p>
              <Link
                href={channel.action.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition group-hover:gap-3 dark:text-blue-400"
              >
                {channel.action.label}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 rounded-3xl border border-amber-100/80 bg-amber-50/80 p-10 text-slate-900 shadow-lg dark:border-amber-400/30 dark:bg-amber-100/10 dark:text-amber-50">
          <div>
            <h2 className="text-2xl font-black">Các chủ đề thường gặp</h2>
            <p className="mt-2 text-slate-600 dark:text-amber-100">
              Chọn tình huống mô tả vấn đề của bạn để xem hướng dẫn tự xử lý.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {["Quên mật khẩu & bảo mật", "Yêu cầu gỡ tin sai sự thật", "Đăng ký làm cộng tác viên", "Hóa đơn & thanh toán quảng cáo"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/50 bg-white/70 px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-white dark:border-amber-50/30 dark:bg-transparent dark:text-amber-100"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
