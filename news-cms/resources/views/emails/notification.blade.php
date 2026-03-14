<!DOCTYPE html>
<html>
<head>
    <title>{{ $notification->title }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1a73e8;">{{ $notification->title }}</h2>
        
        <p>{{ $notification->message }}</p>

        @if(!empty($notification->data) && isset($notification->data['url']))
            <p style="margin-top: 30px;">
                <a href="{{ url($notification->data['url']) }}" 
                   style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Xem chi tiết
                </a>
            </p>
        @endif
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888;">
            Bạn nhận được email này vì bạn đã đăng ký nhận thông báo từ News Portal.
            <br>
            <a href="{{ url('/settings/notifications') }}" style="color: #888; text-decoration: underline;">Quản lý cài đặt thông báo</a>
        </p>
    </div>
</body>
</html>
