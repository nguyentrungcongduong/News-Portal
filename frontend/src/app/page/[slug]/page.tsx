import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageData } from "@/lib/api";
import PublicBlockRenderer from "@/components/PublicBlockRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalBreakingNews from "@/components/GlobalBreakingNews";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Dynamic metadata from page SEO data
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) {
        return {
            title: "Trang không tồn tại | News Portal",
        };
    }

    const seo = page.seo || {};

    return {
        title: seo.title || page.title || "News Portal",
        description: seo.description || "",
        keywords: seo.keywords || "",
        openGraph: {
            title: seo.title || page.title,
            description: seo.description || "",
            images: seo.og_image ? [seo.og_image] : [],
        },
        ...(seo.canonical_url ? { alternates: { canonical: seo.canonical_url } } : {}),
    };
}

export default async function StaticPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) {
        notFound();
    }

    return (
        <>
            <Navbar />
            <GlobalBreakingNews />
            <main className="flex-grow min-h-screen">
                {/* SEO structured data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            name: page.seo?.title || page.title,
                            description: page.seo?.description || "",
                            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/page/${slug}`,
                            dateModified: page.updated_at,
                        }),
                    }}
                />

                {/* Render JSON blocks → React components */}
                <PublicBlockRenderer blocks={page.blocks || []} />
            </main>
            <Footer />
        </>
    );
}
