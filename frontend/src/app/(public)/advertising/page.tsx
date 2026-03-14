import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Liên hệ quảng cáo | News Portal",
  description:
    "Giải pháp quảng cáo đa nền tảng tại News Portal: Native Ads, video, podcast, branded content và dữ liệu độc giả chuyên sâu.",
};

const packages = [
  {
    name: "Momentum",
    price: "120 triệu/tháng",
    description: "Độc quyền vị trí hero + banner động trang chủ, 25M impressions.",
    features: ["Hero take-over 2 ngày/tuần", "Banner 970x250 & 300x600", "Báo cáo realtime"],
  },
  {
    name: "Pulse",
    price: "75 triệu/tháng",
    description: "Native articles + social amplification, 12M impressions.",
    features: ["4 bài branded content", "Video short-form 60s", "Livestream plug (nếu có)"]
  },
  {
    name: "Studio+",
    price: "Theo brief",
    description: "Thiết kế chiến dịch 360° gồm podcast, documentary và microsite.",
    features: ["Workshop cùng biên tập viên", "Sản xuất podcast series", "Microsite, newsletter riêng"],
  },
];

export default function AdvertisingPage() {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold uppercase tracking-[0.5em] text-amber-500">Brand Partnership</p>
          <h1 className="mt-5 text-4xl font-black text-slate-900 dark:text-white lg:text-5xl">
            Kết nối thương hiệu với 30 triệu độc giả chất lượng.
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            News Portal sở hữu bộ giải pháp Native Ads, Video-first và Data-driven targeting giúp thông điệp của bạn xuất hiện đúng thời điểm, đúng ngữ cảnh
            và đo được hiệu quả thật sự.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="mailto:ads@newsportal.vn"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-amber-300/50 transition hover:bg-amber-400"
            >
              Đặt lịch tư vấn
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-white dark:hover:text-white"
            >
              Trung tâm hỗ trợ thương hiệu
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-amber-50/60 transition hover:-translate-y-1 hover:border-amber-500 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{pkg.name}</p>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{pkg.price}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{pkg.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/70">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dữ liệu độc giả chuyên sâu</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                68% độc giả nằm trong nhóm thu nhập khá trở lên, 72% là người ra quyết định mua sắm trong gia đình, 40% là lãnh đạo doanh nghiệp vừa và nhỏ.
                Chúng tôi sử dụng CDP riêng để target theo hành vi, không phụ thuộc cookie bên thứ ba.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Đặt lịch gặp gỡ:</p>
              <p className="mt-2">☎ 0903 456 789 (Ms. Quỳnh) – Media Sales Director</p>
              <p className="mt-2">✉ ads@newsportal.vn</p>
              <p className="mt-2">🏢 Tầng 15, Tháp Sáng Tạo, 212 Nguyễn Trãi, Q.1, TP.HCM</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
