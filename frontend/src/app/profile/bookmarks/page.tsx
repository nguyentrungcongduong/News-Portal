import ProfileCollectionPage from '@/components/ProfileCollectionPage';

export default function ProfileBookmarksPage() {
    return (
        <ProfileCollectionPage
            badge="Thu vien doc"
            title="Bai viet da luu"
            description="Danh sach nay luu nhung bai ban muon doc lai sau. Bookmark duoc dong bo theo tai khoan."
            endpoint="/api/public/me/bookmarks"
            emptyTitle="Chua co bai nao duoc luu"
            emptyDescription="Khi ban bam luu bai o trang chi tiet hoac danh sach, bai viet se xuat hien o day."
        />
    );
}
