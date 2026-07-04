'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from '@/components/EmptyState';

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="mb-10 space-y-3 border-b border-border pb-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Ho so ca nhan</div>
                    <h1 className="text-4xl font-serif font-black tracking-[-0.03em] text-foreground md:text-5xl">
                        Thu vien cua ban
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                        Quan ly bai viet da bookmark, bai viet da thich va cac loi tat ca nhan trong mot noi.
                    </p>
                </div>

                {!isLoading && !isAuthenticated && (
                    <EmptyState
                        icon="inbox"
                        title="Ban chua dang nhap"
                        description="Dang nhap de xem profile, bookmark va lich su tuong tac cua ban."
                        action={{ label: 'Dang nhap', href: '/login' }}
                    />
                )}

                {isAuthenticated && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <section className="rounded-[2rem] border border-border/80 bg-card p-6 lg:col-span-1">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Tai khoan</div>
                            <h2 className="mt-4 text-2xl font-serif font-black">{user?.name}</h2>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                Vai tro hien tai: <span className="font-semibold text-foreground">{user?.role}</span>
                            </p>

                            <div className="mt-6 space-y-3">
                                <Link
                                    href="/profile/bookmarks"
                                    className="block rounded-[1.25rem] border border-border bg-background/70 px-4 py-4 transition-colors hover:border-primary/40"
                                >
                                    <div className="text-lg font-serif font-black">Bookmark</div>
                                    <div className="mt-1 text-sm text-muted-foreground">Cac bai viet ban muon doc lai sau.</div>
                                </Link>
                                <Link
                                    href="/profile/liked"
                                    className="block rounded-[1.25rem] border border-border bg-background/70 px-4 py-4 transition-colors hover:border-primary/40"
                                >
                                    <div className="text-lg font-serif font-black">Bai viet da thich</div>
                                    <div className="mt-1 text-sm text-muted-foreground">Tong hop cac bai viet ban da tha tim.</div>
                                </Link>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-border/80 bg-card p-6 lg:col-span-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Loi tat</div>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <Link
                                    href="/profile/bookmarks"
                                    className="rounded-[1.5rem] border border-border p-5 transition-colors hover:border-primary/40"
                                >
                                    <div className="text-xl font-serif font-black">Mo danh sach bookmark</div>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">Xem nhanh cac bai da luu tu trang chi tiet va danh sach bai viet.</p>
                                </Link>
                                <Link
                                    href="/profile/liked"
                                    className="rounded-[1.5rem] border border-border p-5 transition-colors hover:border-primary/40"
                                >
                                    <div className="text-xl font-serif font-black">Mo danh sach da thich</div>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">Quay lai nhung bai viet ban da tuong tac truoc do.</p>
                                </Link>
                                {user?.role === 'author' && (
                                    <Link
                                        href="/author"
                                        className="rounded-[1.5rem] border border-border p-5 transition-colors hover:border-primary/40 md:col-span-2"
                                    >
                                        <div className="text-xl font-serif font-black">Vao kenh tac gia</div>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">Sidebar author da co them loi tat den bookmark va bai viet da thich.</p>
                                    </Link>
                                )}
                                {user?.role === 'user' && (
                                    <Link
                                        href="/become-author"
                                        className="rounded-[1.5rem] border border-border p-5 transition-colors hover:border-primary/40 md:col-span-2"
                                    >
                                        <div className="text-xl font-serif font-black">Dang ky tro thanh tac gia</div>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">Khi len author, ban van giu nguyen bookmark va danh sach da thich.</p>
                                    </Link>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}
