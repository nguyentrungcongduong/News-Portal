"use client";

import { useMemo, useState } from "react";

interface ShareActionsProps {
    title: string;
    summary?: string;
    slug: string;
    className?: string;
}

export default function ShareActions({
    title,
    summary,
    slug,
    className = "",
}: ShareActionsProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = useMemo(() => {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

        return `${baseUrl.replace(/\/$/, "")}/post/${slug}`;
    }, [slug]);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const shareTargets = [
        {
            key: "facebook",
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.2-1.5 1.6-1.5H16V5.1c-.2 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3V11H8.8v3h2.3v7h2.4z" />
                </svg>
            ),
        },
        {
            key: "x",
            label: "X",
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            icon: (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.3L6.4 22H3.3l7.3-8.3L1 2h6.4l4.4 5.8L18.9 2zm-1.1 18h1.7L6.5 3.9H4.7L17.8 20z" />
                </svg>
            ),
        },
        {
            key: "linkedin",
            label: "LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.9 8.5H3.8V20h3.1V8.5zM5.4 3A1.8 1.8 0 1 0 5.4 6.6 1.8 1.8 0 0 0 5.4 3zM20.2 13.1c0-3.3-1.8-4.9-4.3-4.9-2 0-2.9 1.1-3.4 1.9v-1.6H9.4V20h3.1v-6.4c0-.3 0-.7.1-.9.2-.7.8-1.5 1.9-1.5 1.3 0 1.9 1 1.9 2.5V20h3V13.1z" />
                </svg>
            ),
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (error) {
            console.error("Failed to copy share URL", error);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: summary || title,
                    url: shareUrl,
                });
                return;
            } catch (error: any) {
                if (error?.name === "AbortError") {
                    return;
                }
            }
        }

        await handleCopy();
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
            <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.7 13.3l6.6-3.6M8.7 10.7l6.6 3.6M18 5a2 2 0 110 4 2 2 0 010-4zM6 11a2 2 0 110 4 2 2 0 010-4zM18 15a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
                Chia se
            </button>

            <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    copied
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                }`}
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14L21 3m0 0h-7m7 0v7M14 10l-11 11M8 3H5a2 2 0 00-2 2v3M21 16v3a2 2 0 01-2 2h-3" />
                </svg>
                {copied ? "Da copy link" : "Copy link"}
            </button>

            <div className="flex items-center gap-2">
                {shareTargets.map((target) => (
                    <a
                        key={target.key}
                        href={target.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label={`Chia se len ${target.label}`}
                        title={`Chia se len ${target.label}`}
                    >
                        {target.icon}
                    </a>
                ))}
            </div>
        </div>
    );
}
