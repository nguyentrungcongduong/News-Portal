import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | News Portal",
  description:
    "Tìm hiểu cách News Portal thu thập, sử dụng và bảo vệ dữ liệu của bạn theo chuẩn GDPR và Luật An ninh mạng Việt Nam.",
};

const sections = [
  {
    title: "1. Nguyên tắc chung",
    content:
      "News Portal cam kết chỉ thu thập thông tin cần thiết để vận hành dịch vụ, minh bạch mục đích sử dụng và cho phép độc giả kiểm soát dữ liệu của mình.",
  },
  {
    title: "2. Dữ liệu chúng tôi thu thập",
    content:
      "Bao gồm thông tin tài khoản (email, số điện thoại), dữ liệu hành vi (lịch sử đọc, lượt tương tác), và dữ liệu kỹ thuật (thiết bị, trình duyệt). Không thu thập nội dung nhạy cảm nếu không có sự đồng ý rõ ràng.",
  },
  {
    title: "3. Cách sử dụng dữ liệu",
    content:
      "Phục vụ cá nhân hóa nội dung, đảm bảo an ninh hệ thống, phân tích thống kê ẩn danh và tuân thủ yêu cầu pháp lý. Chúng tôi không bán dữ liệu cho bên thứ ba.",
  },
  {
    title: "4. Thời gian lưu trữ",
    content:
      "Thông tin tài khoản được lưu tới khi bạn yêu cầu xóa hoặc tài khoản không hoạt động liên tục 24 tháng. Dữ liệu log kỹ thuật được lưu tối đa 90 ngày.",
  },
  {
    title: "5. Quyền của bạn",
    content:
      "Bạn có quyền truy cập, chỉnh sửa, xuất dữ liệu hoặc yêu cầu xóa tài khoản. Gửi yêu cầu qua privacy@newsportal.vn hoặc trang Hỗ trợ.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/30 dark:to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:py-20">
        <article className="rounded-[32px] border border-slate-200/80 bg-white/90 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-purple-500">Privacy Policy</p>
            <h1 className="mt-4 text-4xl font-black text-slate-900 dark:text-white">Chính sách bảo mật News Portal</h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}.
              Chính sách này tuân thủ Luật An toàn thông tin mạng Việt Nam, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các chuẩn mực GDPR.</p>
          </header>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{section.content}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-100/10 dark:text-amber-50">
            <p className="font-semibold">Liên hệ bảo mật:</p>
            <p className="mt-2">✉ privacy@newsportal.vn</p>
            <p className="mt-1">☎ 028 7300 9999 (phím 3)</p>
            <p className="mt-1">🏢 Phòng Pháp chế & Bảo mật – Tầng 12, Tháp Sáng Tạo, Q.1, TP.HCM</p>
          </section>
        </article>
      </div>
    </div>
  );
}
