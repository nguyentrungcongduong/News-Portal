-- SQL Script để insert dữ liệu mẫu vào Neon Database
-- Chạy từng phần trong Neon SQL Editor

-- ============================================
-- PHẦN 1: INSERT CATEGORIES (10 chuyên mục)
-- ============================================

INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES
('Kinh doanh', 'kinh-doanh', 'active', NOW(), NOW()),
('Công nghệ', 'cong-nghe', 'active', NOW(), NOW()),
('Thể thao', 'the-thao', 'active', NOW(), NOW()),
('Giải trí', 'giai-tri', 'active', NOW(), NOW()),
('Thế giới', 'the-gioi', 'active', NOW(), NOW()),
('Sức khỏe', 'suc-khoe', 'active', NOW(), NOW()),
('Giáo dục', 'giao-duc', 'active', NOW(), NOW()),
('Du lịch', 'du-lich', 'active', NOW(), NOW()),
('Ô tô - Xe máy', 'o-to-xe-may', 'active', NOW(), NOW()),
('Bất động sản', 'bat-dong-san', 'active', NOW(), NOW());

-- ============================================
-- PHẦN 2: INSERT POSTS (40 bài viết)
-- ============================================
-- Lưu ý: Cần có ít nhất 1 user trong bảng users với id=1 (author_id)
-- Nếu chưa có, hãy tạo user trước hoặc thay đổi author_id phù hợp

INSERT INTO posts (author_id, title, slug, summary, content, thumbnail, status, published_at, views, created_at, updated_at) VALUES
-- Kinh doanh (4 bài)
(1, 'Vingroup công bố kết quả kinh doanh quý 4/2023, lợi nhuận tăng trưởng đột phá 45%', 'vingroup-cong-bo-ket-qua-kinh-doanh-quy-4-2023', 'Tập đoàn Vingroup vừa công bố báo cáo tài chính quý 4/2023 với những con số ấn tượng, cho thấy sự phục hồi mạnh mẽ của thị trường bất động sản và bán lẻ.', 'Nội dung chi tiết bài viết về Vingroup...', 'https://via.placeholder.com/800x450/ff6b6b/ffffff?text=Vingroup+Business', 'published', NOW() - INTERVAL '2 hours', 1250, NOW(), NOW()),

(1, 'FPT Software ký hợp đồng tỷ đô với đối tác Nhật Bản', 'fpt-software-ky-hop-dong-ty-do-nhat-ban', 'FPT Software vừa ký kết hợp đồng trị giá hơn 1 tỷ USD với đối tác hàng đầu Nhật Bản.', 'Nội dung chi tiết về hợp đồng FPT Software...', 'https://via.placeholder.com/800x450/4ecdc4/ffffff?text=FPT', 'published', NOW() - INTERVAL '3 hours', 980, NOW(), NOW()),

(1, 'Vietcombank giảm lãi suất cho vay doanh nghiệp xuống 6%/năm', 'vietcombank-giam-lai-suat-cho-vay-doanh-nghiep', 'Vietcombank công bố giảm lãi suất cho vay doanh nghiệp nhằm hỗ trợ phục hồi kinh tế.', 'Nội dung chi tiết về chính sách lãi suất mới...', 'https://via.placeholder.com/800x450/45b7d1/ffffff?text=Bank', 'published', NOW() - INTERVAL '5 hours', 750, NOW(), NOW()),

(1, 'VinFast chuẩn bị IPO tại Mỹ với định giá 50 tỷ USD', 'vinfast-chuan-bi-ipo-tai-my', 'VinFast dự kiến IPO tại thị trường Mỹ với định giá kỷ lục 50 tỷ USD.', 'Nội dung chi tiết về kế hoạch IPO của VinFast...', 'https://via.placeholder.com/800x450/f39c12/ffffff?text=VinFast', 'published', NOW() - INTERVAL '6 hours', 2100, NOW(), NOW()),

-- Công nghệ (4 bài)
(1, 'OpenAI ra mắt GPT-5 với khả năng suy luận logic vượt trội', 'openai-ra-mat-gpt-5', 'Phiên bản GPT-5 mới nhất được cho là có khả năng suy luận logic và xử lý hình ảnh tốt hơn gấp 10 lần.', 'Nội dung chi tiết về GPT-5...', 'https://via.placeholder.com/800x450/9b59b6/ffffff?text=GPT-5+AI', 'published', NOW() - INTERVAL '1 hour', 3200, NOW(), NOW()),

(1, 'Apple Vision Pro 2 sẽ có giá rẻ hơn 50% so với thế hệ đầu', 'apple-vision-pro-2-gia-re-hon', 'Apple dự kiến ra mắt Vision Pro 2 với mức giá dễ tiếp cận hơn.', 'Nội dung chi tiết về Apple Vision Pro 2...', 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Apple', 'published', NOW() - INTERVAL '4 hours', 1500, NOW(), NOW()),

(1, 'Google Gemini vượt qua ChatGPT trong benchmark mới nhất', 'google-gemini-vuot-chatgpt', 'Google Gemini đã đạt kết quả vượt trội trong các bài kiểm tra benchmark mới nhất.', 'Nội dung chi tiết về Gemini vs ChatGPT...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=Gemini', 'published', NOW() - INTERVAL '7 hours', 1800, NOW(), NOW()),

(1, 'Microsoft tích hợp Copilot sâu hơn vào Windows 12', 'microsoft-copilot-windows-12', 'Microsoft đang phát triển Windows 12 với tích hợp AI Copilot sâu hơn.', 'Nội dung chi tiết về Windows 12 và Copilot...', 'https://via.placeholder.com/800x450/2ecc71/ffffff?text=Windows', 'published', NOW() - INTERVAL '8 hours', 1100, NOW(), NOW()),

-- Thể thao (4 bài)
(1, 'Đội tuyển Việt Nam thắng Thái Lan 3-0, giành vé World Cup 2026', 'viet-nam-thang-thai-lan-3-0', 'Đội tuyển Việt Nam có chiến thắng thuyết phục trước Thái Lan, chính thức giành vé World Cup.', 'Nội dung chi tiết về trận đấu...', 'https://via.placeholder.com/800x450/e67e22/ffffff?text=Vietnam+Football', 'published', NOW() - INTERVAL '30 minutes', 5600, NOW(), NOW()),

(1, 'Quang Hải lập hat-trick, được bình chọn cầu thủ xuất sắc nhất trận', 'quang-hai-lap-hat-trick', 'Nguyễn Quang Hải thi đấu xuất sắc với hat-trick trong trận đấu quan trọng.', 'Nội dung chi tiết về phong độ của Quang Hải...', 'https://via.placeholder.com/800x450/16a085/ffffff?text=Quang+Hai', 'published', NOW() - INTERVAL '2 hours', 3400, NOW(), NOW()),

(1, 'V-League 2025 có 14 đội tham dự với format mới', 'v-league-2025-format-moi', 'V-League mùa giải 2025 sẽ có sự thay đổi lớn về format thi đấu.', 'Nội dung chi tiết về format mới của V-League...', 'https://via.placeholder.com/800x450/c0392b/ffffff?text=V-League', 'published', NOW() - INTERVAL '4 hours', 890, NOW(), NOW()),

(1, 'Công Phượng trở lại ĐTQG sau 2 năm vắng bóng', 'cong-phuong-tro-lai-dtqg', 'Nguyễn Công Phượng được triệu tập trở lại đội tuyển quốc gia sau thờigian dài.', 'Nội dung chi tiết về Công Phượng...', 'https://via.placeholder.com/800x450/8e44ad/ffffff?text=Cong+Phuong', 'published', NOW() - INTERVAL '5 hours', 1200, NOW(), NOW()),

-- Giải trí (4 bài)
(1, 'Phim Việt đạt doanh thu kỷ lục 500 tỷ đồng sau 10 ngày công chiếu', 'phim-viet-ky-luc-doanh-thu', 'Bộ phim hành động Việt Nam mới nhất đã phá vỡ mọi kỷ lục doanh thu phòng vé.', 'Nội dung chi tiết về thành công của phim Việt...', 'https://via.placeholder.com/800x450/e84393/ffffff?text=Vietnamese+Movie', 'published', NOW() - INTERVAL '1 hour', 2800, NOW(), NOW()),

(1, 'Sơn Tùng M-TP công bố album mới sau 3 năm im ắng', 'son-tung-mtp-album-moi', 'Sơn Tùng M-TP chính thức công bố album mới sau thờigian dài không ra mắt sản phẩm.', 'Nội dung chi tiết về album mới...', 'https://via.placeholder.com/800x450/f39c12/ffffff?text=Son+Tung', 'published', NOW() - INTERVAL '3 hours', 4100, NOW(), NOW()),

(1, 'Blackpink tái hợp, công bố tour diễn toàn cầu 2025', 'blackpink-tai-hop-tour-2025', 'Nhóm nhạc Blackpink chính thức tái hợp với tour diễn toàn cầu năm 2025.', 'Nội dung chi tiết về tour diễn Blackpink...', 'https://via.placeholder.com/800x450/9b59b6/ffffff?text=Blackpink', 'published', NOW() - INTERVAL '5 hours', 5200, NOW(), NOW()),

(1, 'Hoài Linh trở lại sân khấu sau thờigian dài vắng bóng', 'hoai-linh-tro-lai-san-khau', 'Nghệ sĩ Hoài Linh chính thức trở lại biểu diễn sau những ồn ào thờigian qua.', 'Nội dung chi tiết về sự trở lại của Hoài Linh...', 'https://via.placeholder.com/800x450/27ae60/ffffff?text=Hoai+Linh', 'published', NOW() - INTERVAL '6 hours', 2300, NOW(), NOW()),

-- Thế giới (4 bài)
(1, 'Tổng thống Mỹ công bố chính sách thương mại mới với châu Á', 'tong-thong-my-chinh-sach-thuong-mai-chau-a', 'Chính quyền Washington vừa công bố bộ chính sách thương mại toàn diện nhằm tăng cường quan hệ với châu Á.', 'Nội dung chi tiết về chính sách thương mại...', 'https://via.placeholder.com/800x450/34495e/ffffff?text=World+News', 'published', NOW() - INTERVAL '2 hours', 1500, NOW(), NOW()),

(1, 'Nga-Ukraine đạt thỏa thuận ngừng bắn tạm thờ', 'nga-ukraine-ngung-ban-tam-thoi', 'Hai bên đã đạt được thỏa thuận ngừng bắn tạm thờ sau nhiều vòng đàm phán.', 'Nội dung chi tiết về thỏa thuận ngừng bắn...', 'https://via.placeholder.com/800x450/c0392b/ffffff?text=Russia-Ukraine', 'published', NOW() - INTERVAL '4 hours', 3800, NOW(), NOW()),

(1, 'Trung Quốc phóng thành công trạm vũ trụ mới', 'trung-quoc-phong-tram-vu-tru', 'Trung Quốc vừa phóng thành công module mới của trạm vũ trụ Thiên Cung.', 'Nội dung chi tiết về sự kiện phóng vũ trụ...', 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=China+Space', 'published', NOW() - INTERVAL '6 hours', 2100, NOW(), NOW()),

(1, 'EU thông qua gói cứu trợ khí hậu 500 tỷ euro', 'eu-goi-cuu-tro-khi-hau', 'Liên minh châu Âu thông qua gói đầu tư khổng lồ cho các dự án khí hậu.', 'Nội dung chi tiết về gói cứu trợ EU...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=EU', 'published', NOW() - INTERVAL '8 hours', 1300, NOW(), NOW()),

-- Sức khỏe (4 bài)
(1, 'Bộ Y tế khuyến cáo phòng chống dịch cúm mùa đang bùng phát', 'bo-y-te-khuyen-cao-phong-chong-cum-mua', 'Số ca mắc cúm mùa tại Việt Nam đang tăng cao, đặc biệt ở các thành phố lớn.', 'Nội dung chi tiết về phòng chống cúm mùa...', 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Health+News', 'published', NOW() - INTERVAL '30 minutes', 1900, NOW(), NOW()),

(1, '10 loại thực phẩm giúp tăng cường miễn dịch mùa đông', '10-thuc-pham-tang-cuong-mien-dich', 'Chuyên gia dinh dưỡng khuyến nghị các thực phẩm tốt cho sức khỏe mùa lạnh.', 'Nội dung chi tiết về các thực phẩm tốt...', 'https://via.placeholder.com/800x450/27ae60/ffffff?text=Healthy+Food', 'published', NOW() - INTERVAL '2 hours', 2500, NOW(), NOW()),

(1, 'Nghiên cứu mới về liệu pháp điều trị ung thư', 'nghien-cuu-lieu-phap-dieu-tri-ung-thu', 'Các nhà khoa học công bố đột phá mới trong điều trị ung thư.', 'Nội dung chi tiết về nghiên cứu y khoa...', 'https://via.placeholder.com/800x450/9b59b6/ffffff?text=Cancer+Research', 'published', NOW() - INTERVAL '4 hours', 1600, NOW(), NOW()),

(1, 'WHO cảnh báo về biến chủng virus mới', 'who-canh-bao-bien-chung-virus-moi', 'Tổ chức Y tế Thế giới phát cảnh báo về biến chủng virus có khả năng lây lan nhanh.', 'Nội dung chi tiết về cảnh báo của WHO...', 'https://via.placeholder.com/800x450/f39c12/ffffff?text=WHO', 'published', NOW() - INTERVAL '6 hours', 2200, NOW(), NOW()),

-- Giáo dục (4 bài)
(1, 'Đại học Quốc gia Hà Nội công bố điểm chuẩn năm 2024', 'dhqg-ha-noi-diem-chuan-2024', 'ĐHQGHN công bố điểm chuẩn các ngành đào tạo năm 2024 với mức tăng trung bình.', 'Nội dung chi tiết về điểm chuẩn ĐHQGHN...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=Education', 'published', NOW() - INTERVAL '1 hour', 4500, NOW(), NOW()),

(1, 'Bộ GD&ĐT đề xuất đổi mới chương trình THPT', 'bo-gd-dt-doi-moi-chuong-trinh-thpt', 'Bộ Giáo dục đang lấy ý kiến về chương trình THPT mới nhằm giảm tải cho học sinh.', 'Nội dung chi tiết về chương trình mới...', 'https://via.placeholder.com/800x450/16a085/ffffff?text=Education+Reform', 'published', NOW() - INTERVAL '3 hours', 1200, NOW(), NOW()),

(1, 'Sinh viên Việt đạt giải Olympic Toán quốc tế', 'sinh-vien-viet-olympic-toan-quoc-te', 'Sinh viên Việt Nam xuất sắc giành huy chương tại kỳ thi Olympic Toán quốc tế.', 'Nội dung chi tiết về thành tích Olympic...', 'https://via.placeholder.com/800x450/e67e22/ffffff?text=Olympiad', 'published', NOW() - INTERVAL '5 hours', 1800, NOW(), NOW()),

(1, 'Học bổng du học toàn phần từ các trường Ivy League', 'hoc-bong-du-hoc-toan-phan-ivy-league', 'Các trường đại học hàng đầu nước Mỹ công bố chương trình học bổng mới.', 'Nội dung chi tiết về học bổng Ivy League...', 'https://via.placeholder.com/800x450/8e44ad/ffffff?text=Scholarship', 'published', NOW() - INTERVAL '7 hours', 2100, NOW(), NOW()),

-- Du lịch (4 bài)
(1, 'Việt Nam đón 15 triệu lượt khách quốc tế trong năm 2024', 'viet-nam-15-trieu-khach-quoc-te', 'Ngành du lịch Việt Nam đạt kỷ lục mới với 15 triệu lượt khách quốc tế.', 'Nội dung chi tiết về thành tích du lịch...', 'https://via.placeholder.com/800x450/1abc9c/ffffff?text=Travel+Vietnam', 'published', NOW() - INTERVAL '2 hours', 1600, NOW(), NOW()),

(1, '5 điểm đến mới nổi tại miền Trung dịp Tết Nguyên đán', '5-diem-den-moi-noi-mien-trung', 'Các điểm du lịch mới tại miền Trung hứa hẹn thu hút du khách dịp Tết.', 'Nội dung chi tiết về điểm đến mới...', 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Travel+Central', 'published', NOW() - INTERVAL '4 hours', 950, NOW(), NOW()),

(1, 'Vietnam Airlines mở đường bay thẳng đến Mỹ', 'vietnam-airlines-duong-bay-thang-my', 'Hãng hàng không quốc gia mở thêm đường bay thẳng kết nối Việt Nam và Mỹ.', 'Nội dung chi tiết về đường bay mới...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=VNA', 'published', NOW() - INTERVAL '6 hours', 1300, NOW(), NOW()),

(1, 'Cẩm nang du lịch Nhật Bản mùa hoa anh đào', 'cam-nang-du-lich-nhat-ban-hoa-anh-dao', 'Những điểm đến tuyệt đẹp để ngắm hoa anh đào tại Nhật Bản.', 'Nội dung chi tiết về du lịch Nhật Bản...', 'https://via.placeholder.com/800x450/f39c12/ffffff?text=Japan+Cherry', 'published', NOW() - INTERVAL '8 hours', 1100, NOW(), NOW()),

-- Ô tô - Xe máy (4 bài)
(1, 'VinFast VF8 đạt chứng nhận an toàn 5 sao tại châu Âu', 'vinfast-vf8-5-sao-chau-au', 'Mẫu xe điện VF8 của VinFast vừa nhận được chứng nhận an toàn 5 sao từ Euro NCAP.', 'Nội dung chi tiết về chứng nhận an toàn...', 'https://via.placeholder.com/800x450/2c3e50/ffffff?text=VinFast+VF8', 'published', NOW() - INTERVAL '1 hour', 2800, NOW(), NOW()),

(1, 'Honda ra mắt xe máy điện mới giá từ 25 triệu đồng', 'honda-xe-may-dien-gia-25-trieu', 'Honda công bố dòng xe máy điện mới với giá bán cạnh tranh tại thị trường Việt Nam.', 'Nội dung chi tiết về xe máy điện Honda...', 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Honda+E-bike', 'published', NOW() - INTERVAL '3 hours', 1900, NOW(), NOW()),

(1, 'Toyota Camry 2025 về Việt Nam với giá từ 1,2 tỷ', 'toyota-camry-2025-gia-1-2-ty', 'Toyota Camry thế hệ mới chính thức ra mắt tại Việt Nam với nhiều nâng cấp.', 'Nội dung chi tiết về Toyota Camry 2025...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=Toyota+Camry', 'published', NOW() - INTERVAL '5 hours', 1500, NOW(), NOW()),

(1, 'Xe điện chiếm 30% thị phần ô tô Việt Nam năm 2024', 'xe-dien-30-thi-phan-o-to-viet-nam', 'Thị trường xe điện tại Việt Nam có bước tăng trưởng vượt bậc trong năm qua.', 'Nội dung chi tiết về thị trường xe điện...', 'https://via.placeholder.com/800x450/27ae60/ffffff?text=EV+Market', 'published', NOW() - INTERVAL '7 hours', 1200, NOW(), NOW()),

-- Bất động sản (4 bài)
(1, 'Giá nhà đất TP.HCM tăng 15% trong quý 4/2024', 'gia-nha-dat-tphcm-tang-15-phan-tram', 'Thị trường bất động sản TP.HCM có dấu hiệu hồi phục mạnh mẽ với mức tăng giá trung bình 15%.', 'Nội dung chi tiết về thị trường BĐS...', 'https://via.placeholder.com/800x450/16a085/ffffff?text=Real+Estate', 'published', NOW() - INTERVAL '30 minutes', 2100, NOW(), NOW()),

(1, 'Novaland công bố dự án căn hộ cao cấp tại Thủ Thiêm', 'novaland-du-an-cao-cap-thu-thiem', 'Tập đoàn Novaland giới thiệu dự án căn hộ hạng sang tại khu đô thị Thủ Thiêm.', 'Nội dung chi tiết về dự án Novaland...', 'https://via.placeholder.com/800x450/e67e22/ffffff?text=Novaland', 'published', NOW() - INTERVAL '2 hours', 1400, NOW(), NOW()),

(1, 'Ngân hàng giảm lãi suất cho vay mua nhà xuống 7,5%/năm', 'lai-suat-vay-mua-nha-giam-7-5-phan-tram', 'Nhiều ngân hàng đồng loạt giảm lãi suất cho vay bất động sản để kích cầu thị trường.', 'Nội dung chi tiết về lãi suất vay mua nhà...', 'https://via.placeholder.com/800x450/3498db/ffffff?text=Home+Loan', 'published', NOW() - INTERVAL '4 hours', 1100, NOW(), NOW()),

(1, '5 khu vực đất nền đang sốt tại Hà Nội', '5-khu-vuc-dat-nen-sot-ha-noi', 'Các chuyên gia bất động sản chỉ ra 5 khu vực đất nền đang tăng giá mạnh tại Hà Nội.', 'Nội dung chi tiết về thị trường đất nền...', 'https://via.placeholder.com/800x450/9b59b6/ffffff?text=Land+Plot', 'published', NOW() - INTERVAL '6 hours', 950, NOW(), NOW());

-- ============================================
-- PHẦN 3: LINK POSTS VỚI CATEGORIES
-- ============================================
-- Mỗi category có 4 bài viết

INSERT INTO post_categories (post_id, category_id) VALUES
-- Kinh doanh (category_id = 1): posts 1-4
(1, 1), (2, 1), (3, 1), (4, 1),

-- Công nghệ (category_id = 2): posts 5-8
(5, 2), (6, 2), (7, 2), (8, 2),

-- Thể thao (category_id = 3): posts 9-12
(9, 3), (10, 3), (11, 3), (12, 3),

-- Giải trí (category_id = 4): posts 13-16
(13, 4), (14, 4), (15, 4), (16, 4),

-- Thế giới (category_id = 5): posts 17-20
(17, 5), (18, 5), (19, 5), (20, 5),

-- Sức khỏe (category_id = 6): posts 21-24
(21, 6), (22, 6), (23, 6), (24, 6),

-- Giáo dục (category_id = 7): posts 25-28
(25, 7), (26, 7), (27, 7), (28, 7),

-- Du lịch (category_id = 8): posts 29-32
(29, 8), (30, 8), (31, 8), (32, 8),

-- Ô tô - Xe máy (category_id = 9): posts 33-36
(33, 9), (34, 9), (35, 9), (36, 9),

-- Bất động sản (category_id = 10): posts 37-40
(37, 10), (38, 10), (39, 10), (40, 10);

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

-- Xem danh sách categories
SELECT * FROM categories ORDER BY id;

-- Xem tổng số bài viết mỗi category
SELECT 
    c.name,
    COUNT(pc.post_id) as post_count
FROM categories c
LEFT JOIN post_categories pc ON c.id = pc.category_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Xem 5 bài viết mới nhất
SELECT p.title, p.published_at, p.views, c.name as category_name
FROM posts p
JOIN post_categories pc ON p.id = pc.post_id
JOIN categories c ON pc.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 5;