"use client";

export default function SkeletonCard({ variant = "medium" }: { variant?: "large" | "medium" | "small" | "list" }) {
    if (variant === "large") {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 mb-12 animate-pulse">
                <div className="lg:col-span-8 aspect-[16/9] bg-muted rounded-sm" />
                <div className="lg:col-span-4 space-y-4">
                    <div className="h-2 w-20 bg-muted rounded-full" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                    <div className="h-10 w-3/4 bg-muted rounded-md" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded-md" />
                        <div className="h-4 w-full bg-muted rounded-md" />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "medium") {
        return (
            <div className="space-y-4 pb-8 animate-pulse">
                <div className="aspect-[3/2] bg-muted rounded-sm" />
                <div className="space-y-2">
                    <div className="h-2 w-16 bg-muted rounded-full" />
                    <div className="h-6 w-full bg-muted rounded-md" />
                    <div className="h-6 w-2/3 bg-muted rounded-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 py-4 animate-pulse">
            <div className="flex-1 space-y-2">
                <div className="h-2 w-12 bg-muted rounded-full" />
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-1/2 bg-muted rounded-md" />
            </div>
            <div className="w-20 h-20 shrink-0 bg-muted rounded-sm" />
        </div>
    );
}
