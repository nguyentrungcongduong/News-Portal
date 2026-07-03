import Link from 'next/link';
import { getCategories, getMenu } from '@/lib/api';
import AdBanner from './AdBanner';

const Footer = async () => {
    const [{ data: categories }, footer1Menu, footer2Menu, generalFooter] = await Promise.all([
        getCategories(),
        getMenu("footer_1").catch(() => null),
        getMenu("footer_2").catch(() => null),
        getMenu("footer").catch(() => null)
    ]);

    const col1Items = footer1Menu?.items || [];
    const activeFooter2 = footer2Menu?.items?.length ? footer2Menu : generalFooter;
    const col2Items = activeFooter2?.items || [];

    return (
        <footer className="w-full border-t border-border/80 bg-card/60 py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex justify-center">
                    <AdBanner position="footer" className="w-full max-w-[970px]" />
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                    <div className="space-y-5">
                        <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-[-0.05em] text-foreground">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm text-white">NP</div>
                            <span className="font-serif">Daily Edition.</span>
                        </Link>
                        <p className="max-w-md text-sm leading-7 text-muted-foreground">
                            Nen doc tin cong khai cho noi dung thoi su, kinh doanh, cong nghe va xa hoi. Uu tien toc do doc, cau truc ro va boi canh dang tin.
                        </p>
                        <div className="rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                            Cap nhat nhieu dot trong ngay. Moi bai duoc uu tien trinh bay sach, it nhieu va de quet nhanh tren mobile.
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-foreground">
                            {footer1Menu?.name || "Chuyen muc"}
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {col1Items.length > 0 ? (
                                col1Items.map((item: any) => (
                                    <li key={item.id}>
                                        <Link href={item.url || "#"} target={item.target} className="transition-colors hover:text-primary">
                                            {item.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                categories.slice(0, 6).map((cat: any) => (
                                    <li key={cat.id}>
                                        <Link href={`/category/${cat.slug}`} className="transition-colors hover:text-primary">
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-foreground">
                            {activeFooter2?.name || "Ho tro"}
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {col2Items.length > 0 ? (
                                col2Items.map((item: any) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url || "#"}
                                            target={item.target}
                                            className="transition-colors hover:text-primary"
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/support" className="transition-colors hover:text-primary">Ho tro</Link></li>
                                    <li><Link href="/about" className="transition-colors hover:text-primary">Ve chung toi</Link></li>
                                    <li><Link href="/advertising" className="transition-colors hover:text-primary">Lien he quang cao</Link></li>
                                    <li><Link href="/privacy" className="transition-colors hover:text-primary">Chinh sach bao mat</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-foreground">Ket noi</h3>
                        <div className="flex gap-3">
                            <a href="#" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background transition-all hover:border-primary hover:text-primary">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background transition-all hover:border-primary hover:text-primary">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                            </a>
                        </div>
                        <p className="mt-5 text-sm leading-7 text-muted-foreground">
                            Theo doi cac cap nhat bien tap va nhip tin moi trong ngay.
                        </p>
                    </div>
                </div>
                <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    (c) {new Date().getFullYear()} News Portal. Ton trong ban quyen noi dung va trai nghiem doc toi gian.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
