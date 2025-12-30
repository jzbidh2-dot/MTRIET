// 👇👇👇 DÁN LINK CỦA CHỊ VÀO ĐÂY 👇👇👇
const LINK_SCRIPT = "https://script.google.com/macros/s/AKfycbw-Senvu3tyT4WlB1X6leOM6g9Gj5AtibOSDR1WyK0S2ZiVV4T14wJBXaAuuGWs10Jr/exec"; 

let isCaptchaVerified = false;

// Hàm hiện thông báo đẹp
function showNotify(tieuDe, noiDung, iconType) {
    const box = document.getElementById('mint-alert');
    const icon = document.getElementById('alert-icon');
    const circle = document.querySelector('.icon-circle');
    
    // Đổi nội dung
    document.getElementById('alert-title').innerText = tieuDe;
    document.getElementById('alert-msg').innerText = noiDung;
    
    // Đổi màu sắc theo loại (Lỗi / Thành công)
    if(iconType === 'error') {
        icon.className = 'bi bi-exclamation-lg';
        circle.style.background = '#ffebee'; // Đỏ nhạt
        circle.style.color = '#EE0033'; // Đỏ đậm
    } else if(iconType === 'success') {
        icon.className = 'bi bi-check-lg';
        circle.style.background = '#e8f5e9'; // Xanh nhạt
        circle.style.color = '#2e7d32'; // Xanh đậm
    }

    // Hiện lên
    box.classList.remove('d-none');
}

// Hàm tắt thông báo
function closeMintAlert() {
    document.getElementById('mint-alert').classList.add('d-none');
}

function toggleCaptcha() {
    isCaptchaVerified = !isCaptchaVerified;
    const checkIcon = document.getElementById('captchaCheck');
    if (isCaptchaVerified) checkIcon.style.display = 'block';
    else checkIcon.style.display = 'none';
}

function traCuu() {
    var ma = document.getElementById('maDon').value.trim();
    
    if(!ma) {
        // Gọi thông báo đẹp: Lỗi nhập
        showNotify("Chưa nhập mã!", "Vui lòng điền mã đơn hàng vào ô trống để tiếp tục.", "error");
        return;
    }

    if (isCaptchaVerified == false) {
        // Gọi thông báo đẹp: Lỗi Captcha
        showNotify("Xác minh người máy", "Vui lòng tích vào ô 'Tôi không phải là người máy'!", "error");
        return; 
    }
    
    document.getElementById('ketQua').classList.add('d-none');
    document.getElementById('loading').classList.remove('d-none');

    fetch(LINK_SCRIPT + "?ma=" + ma)
    .then(r => r.json())
    .then(res => {
        document.getElementById('loading').classList.add('d-none');
        
        if(res.status == 'success') {
            document.getElementById('ketQua').classList.remove('d-none');
            document.getElementById('ma-display').innerText = ma.toUpperCase();
            
            document.getElementById('dv').innerText = res.data.dich_vu;
            document.getElementById('tt').innerText = res.data.trang_thai;
            document.getElementById('td_text').innerText = res.data.tien_do + "%";
            document.getElementById('gc').innerText = res.data.ghi_chu;
            document.getElementById('bar').style.width = res.data.tien_do + "%";
            
            // Cuộn xuống kết quả
            document.getElementById('ketQua').scrollIntoView({behavior: "smooth"});

        } else { 
            // Gọi thông báo đẹp: Không tìm thấy
            showNotify("Không tìm thấy!", "Mã đơn hàng này không tồn tại trên hệ thống. Vui lòng kiểm tra lại.", "error");
        }
    })
    .catch(err => {
        document.getElementById('loading').classList.add('d-none');
        showNotify("Lỗi kết nối!", "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.", "error");
    });
}