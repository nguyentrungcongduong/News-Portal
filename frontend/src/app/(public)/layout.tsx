import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalBreakingNews from "@/components/GlobalBreakingNews";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <GlobalBreakingNews />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </>
    );
}
