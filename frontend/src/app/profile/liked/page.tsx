import ProfileCollectionPage from '@/components/ProfileCollectionPage';

export default function ProfileLikedPage() {
    return (
        <ProfileCollectionPage
            badge="Tuong tac ca nhan"
            title="Bai viet da thich"
            description="Tong hop nhung bai viet ban da tha tim de doc lai, so sanh va theo doi cac chu de ban quan tam."
            endpoint="/api/public/me/likes"
            emptyTitle="Chua co bai viet nao duoc thich"
            emptyDescription="Khi ban tha tim mot bai viet o trang chi tiet, bai viet do se duoc luu vao danh sach nay."
        />
    );
}
