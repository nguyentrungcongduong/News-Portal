import Image from 'next/image';
import Link from 'next/link';

interface Post {
    id: number;
    title: string;
    slug: string;
    summary: string;
    thumbnail: string;
    category_name?: string;
    category_slug?: string;
    published_at?: string;
}

export default function HeroSection({ main, sub }: { main: Post | null, sub: Post[] }) {
    if (!main) return null;

    return (
        <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main large post */}
                <div className="lg:col-span-8 group relative overflow-hidden rounded-2xl bg-gray-900 aspect-video">
                    <Image
                        src={main.thumbnail || 'https://picsum.photos/800/600'}
                        alt={main.title}
                        fill
                        priority
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 800px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-10">
                        {main.category_name && (
                            <Link
                                href={`/category/${main.category_slug}`}
                                className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4 hover:bg-blue-700 transition"
                            >
                                {main.category_name}
                            </Link>
                        )}
                        <Link href={`/post/${main.slug}`}>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 line-clamp-3 hover:text-blue-200 transition">
                                {main.title}
                            </h1>
                        </Link>
                        <p className="text-gray-300 text-lg line-clamp-2 max-w-2xl hidden md:block">
                            {main.summary}
                        </p>
                    </div>
                </div>

                {/* Sub posts side */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {sub.map((post) => (
                        <div key={post.id} className="flex gap-4 group">
                            <div className="relative w-24 md:w-32 aspect-square shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                <Image
                                    src={post.thumbnail || 'https://picsum.photos/400/400'}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                    sizes="128px"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <Link href={`/category/${post.category_slug}`} className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1 hover:underline">
                                    {post.category_name}
                                </Link>
                                <Link href={`/post/${post.slug}`}>
                                    <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition">
                                        {post.title}
                                    </h3>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
