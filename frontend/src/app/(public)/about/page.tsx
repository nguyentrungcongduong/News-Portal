import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi | News Portal",
  description:
    "News Portal - tòa soạn số hóa với đội ngũ phóng viên trên khắp Việt Nam, mang tới những góc nhìn đa chiều và chuẩn xác.",
};

const values = [
  {
    title: "Tốc độ & chính xác",
    description:
      "Hệ thống biên tập realtime, AI fact-checking và đội ngũ kiểm chứng giúp tin tức được cập nhật từng phút với độ tin cậy cao.",
  },
  {
    title: "Độc lập & nhân văn",
    description:
      "Chúng tôi ưu tiên các câu chuyện mang giá trị cộng đồng, không bị chi phối bởi lợi ích thương mại hay định kiến.",
  },
  {
    title: "Sáng tạo đa nền tảng",
    description:
      "Podcast, short video, interactive long-form... News Portal liên tục thử nghiệm format mới để kể chuyện hấp dẫn hơn.",
  },
];

const milestones = [
  { year: "2015", label: "Ra mắt phiên bản Beta" },
  { year: "2017", label: "Đạt 10 triệu độc giả/tháng" },
  { year: "2020", label: "Ra mắt studio multimedia & podcast" },
  { year: "2024", label: "Top 3 báo điện tử ảnh hưởng nhất tại VN" },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:py-48">
        <header className="mb-24">
          <div className="inline-block bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-8">
            Established 2015
          </div>
          <h1 className="font-serif text-6xl font-black leading-[0.95] tracking-tighter sm:text-8xl md:text-9xl">
            Reliable.<br />
            Realtime.<br />
            Remote.
          </h1>
        </header>

        <section className="space-y-16">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="font-editorial text-2xl font-medium leading-relaxed italic text-foreground/90 sm:text-3xl mb-12 border-l-4 border-primary pl-8">
              “Làm báo không chỉ là xuất bản nhanh mà còn phải minh bạch, có trách nhiệm và nuôi dưỡng những cuộc đối thoại văn minh.”
            </p>

            <div className="space-y-8 text-lg sm:text-xl text-foreground/70 leading-relaxed font-editorial">
              <p>
                News Portal là tòa soạn kỹ thuật số được xây dựng cho thời đại realtime.
                Chúng tôi vận hành một mạng lưới phóng viên trải dài 30 tỉnh thành, kết hợp công nghệ dữ liệu lớn và trí tuệ nhân tạo để mang đến những bản tin chuẩn xác nhất.
              </p>
              <p>
                Mỗi ngày, News Portal phát hành hơn 120 bài viết, 6 podcast và 3 talkshow trực tiếp, phục vụ hàng triệu độc giả với cam kết về sự trung thực tuyệt đối.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-y border-border py-12 sm:grid-cols-3">
            {[
              { label: "Nhà báo chuyên nghiệp", value: "120+" },
              { label: "Độc giả hàng tháng", value: "30M+" },
              { label: "Độ chính xác kiểm chứng", value: "98%" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-4xl font-black">{stat.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-32 pt-12">
            <section>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-widest mb-12 text-primary">
                Giá trị cốt lõi
              </h2>
              <div className="grid gap-16">
                {values.map((v) => (
                  <div key={v.title} className="group">
                    <h3 className="text-xl font-black mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                      {v.title}
                    </h3>
                    <p className="font-editorial text-foreground/60 text-lg leading-relaxed max-w-2xl">{v.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-widest mb-12 text-primary">
                Hành trình.
              </h2>
              <div className="space-y-0 relative border-b border-border">
                {milestones.map((m) => (
                  <div key={m.year} className="flex group border-t border-border py-6 hover:bg-muted/30 transition-colors px-4 -mx-4">
                    <span className="font-serif font-black text-3xl tabular-nums w-32 shrink-0">{m.year}</span>
                    <span className="font-editorial text-lg text-foreground/80 flex-1">{m.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <footer className="mt-48 pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-start gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <div>© {new Date().getFullYear()} News Portal Media Group</div>
          <div>Saigon • Hanoi • Danang</div>
        </footer>
      </article>
    </div>
  );
}
