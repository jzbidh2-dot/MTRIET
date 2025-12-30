// 👇👇👇 QUAN TRỌNG: DÁN LINK SCRIPT MỚI CỦA CHỊ VÀO ĐÂY 👇👇👇
const LINK_SCRIPT = "DÁN_LINK_APPS_SCRIPT_MỚI_VÀO_ĐÂY"; 

// Các biến theo dõi trạng thái
let isCaptchaVerified = false;
let lastMessage = ""; // Lưu tin nhắn cũ để không báo lặp lại

// ===============================================
// PHẦN 1: TỰ ĐỘNG CHẠY KHI MỞ WEB
// ===============================================
window.onload = function() {
    // 1. Kiểm tra tin nhắn Admin ngay khi mở web
    checkAdminNotify();
    
    // 2. Cứ 15 giây tự động kiểm tra lại 1 lần (để nhận tin mới nhất)
    setInterval(checkAdminNotify, 15000); 
};

// Hàm xin quyền thông báo (Gắn vào nút Bật thông báo ở file HTML)
function batThongBao() {
    if (!("Notification" in window)) {
        alert("Trình duyệt này không hỗ trợ thông báo hệ thống!");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            showNotify("Đã bật thông báo!", "Giờ bạn có thể ẩn web đi, khi có tin từ Admin sẽ tự báo.", "success");
            // Ẩn nút đi cho gọn
            const btn = document.getElementById('btn-subscribe');
            if(btn) btn.style.display = 'none'; 
        }
    });
}

// Hàm kiểm tra tin nhắn từ Admin (Gọi lên Google Sheet)
function checkAdminNotify() {
    fetch(LINK_SCRIPT + "?action=get_notify")
    .then(r => r.json())
    .then(res => {
        // Nếu lấy được tin nhắn và tin nhắn không rỗng
        if(res.status == 'success' && res.msg && res.msg.trim() !== "") {
            
            // Chỉ báo nếu tin nhắn KHÁC tin cũ (tránh spam liên tục)
            if (res.msg !== lastMessage) {
                lastMessage = res.msg; // Lưu lại tin mới
                
                // 1. Hiện Popup đẹp ngay trong web
                showNotify("🔔 TIN NHẮN TỪ ADMIN", res.msg, "admin");
                
                // 2. Gửi thông báo hệ thống (Hiện ra góc màn hình máy tính/điện thoại)
                sendSystemNotify("MinT Express thông báo:", res.msg);
            }
        } else {
            // Nếu Admin xóa ô A1 -> Xóa biến nhớ để lần sau nhập lại sẽ báo tiếp
            if(res.msg === "" || res.msg === null) lastMessage = "";
        }
    })
    .catch(e => console.log("Đang chờ kết nối..."));
}

// Hàm gửi thông báo hệ thống (Push Notification)
function sendSystemNotify(tieuDe, noiDung) {
    if (Notification.permission === "granted") {
        const noti = new Notification(tieuDe, {
            body: noiDung,
            icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png', // Icon cái chuông
            vibrate: [200, 100, 200] // Rung điện thoại
        });
        
        // Bấm vào thông báo thì mở lại cửa sổ web
        noti.onclick = function() {
            window.focus();
            this.close();
        };
    }
}

// ===============================================
// PHẦN 2: XỬ LÝ GIAO DIỆN & TRA CỨU
// ===============================================

// Hàm hiện bảng thông báo đẹp (Custom Alert) + Âm thanh
function showNotify(tieuDe, noiDung, iconType) {
    const box = document.getElementById('mint-alert');
    const icon = document.getElementById('alert-icon');
    const circle = document.querySelector('.icon-circle');
    
    // 🔊 CHƠI ÂM THANH TING TING
    var audio = document.getElementById("thongBaoAudio");
    if(audio) { 
        audio.currentTime = 0; // Tua về đầu
        audio.play().catch(e => console.log("Trình duyệt chưa cho tự phát âm thanh"));
    }

    // Điền nội dung
    document.getElementById('alert-title').innerText = tieuDe;
    document.getElementById('alert-msg').innerText = noiDung;
    
    // Đổi màu sắc icon theo loại
    if(iconType === 'error') {
        icon.className = 'bi bi-exclamation-lg';
        circle.style.background = '#ffebee'; circle.style.color = '#EE0033'; // Đỏ
    } else if(iconType === 'success') {
        icon.className = 'bi bi-check-lg';
        circle.style.background = '#e8f5e9'; circle.style.color = '#2e7d32'; // Xanh lá
    } else if(iconType === 'admin') { 
        icon.className = 'bi bi-megaphone-fill'; 
        circle.style.background = '#fff3cd'; circle.style.color = '#ffc107'; // Vàng cam
    }

    // Hiện bảng lên
    box.classList.remove('d-none');
}

// Hàm tắt bảng thông báo
function closeMintAlert() {
    document.getElementById('mint-alert').classList.add('d-none');
}

// Hàm tích Captcha
function toggleCaptcha() {
    isCaptchaVerified = !isCaptchaVerified;
    const checkIcon = document.getElementById('captchaCheck');
    if (isCaptchaVerified) {
        checkIcon.style.display = 'block';
    } else {
        checkIcon.style.display = 'none';
    }
}

// HÀM CHÍNH: TRA CỨU ĐƠN HÀNG
function traCuu() {
    var ma = document.getElementById('maDon').value.trim();
    
    // 1. Kiểm tra nhập liệu
    if(!ma) {
        showNotify("Chưa nhập mã!", "Vui lòng điền mã đơn hàng vào ô trống.", "error");
        return;
    }

    // 2. Kiểm tra Captcha
    if (isCaptchaVerified == false) {
        showNotify("Xác minh người máy", "Vui lòng tích vào ô 'Tôi không phải là người máy'!", "error");
        return; 
    }
    
    // 3. Hiệu ứng Loading
    document.getElementById('ketQua').classList.add('d-none');
    document.getElementById('loading').classList.remove('d-none');

    // 4. Gọi dữ liệu từ Google Sheet
    fetch(LINK_SCRIPT + "?ma=" + ma)
    .then(r => r.json())
    .then(res => {
        document.getElementById('loading').classList.add('d-none');
        
        if(res.status == 'success') {
            // Tìm thấy -> Hiện kết quả
            document.getElementById('ketQua').classList.remove('d-none');
            document.getElementById('ma-display').innerText = ma.toUpperCase();
            
            document.getElementById('dv').innerText = res.data.dich_vu;
            document.getElementById('tt').innerText = res.data.trang_thai;
            document.getElementById('td_text').innerText = res.data.tien_do + "%";
            document.getElementById('gc').innerText = res.data.ghi_chu;
            document.getElementById('bar').style.width = res.data.tien_do + "%";
            
            // Cuộn xuống xem kết quả
            document.getElementById('ketQua').scrollIntoView({behavior: "smooth"});

        } else { 
            // Không tìm thấy
            showNotify("Không tìm thấy!", "Mã đơn hàng này không tồn tại trên hệ thống.", "error");
        }
    })
    .catch(err => {
        document.getElementById('loading').classList.add('d-none');
        showNotify("Lỗi kết nối!", "Không thể kết nối đến máy chủ.", "error");
    });
}