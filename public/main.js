let token = localStorage.getItem('accessToken') || '';
let lastResult = null;

// Khôi phục kết quả gần nhất (nếu có)
try {
  lastResult = JSON.parse(sessionStorage.getItem('lastResult') || 'null');
} catch { lastResult = null; }

// Điều hướng UI
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));
  if (pageId === 'page-login') document.getElementById('nav-login').classList.add('active');
  if (pageId === 'page-upload') document.getElementById('nav-upload').classList.add('active');
  if (pageId === 'page-result') document.getElementById('nav-result').classList.add('active');
}
function setNav(loggedIn) {
  document.getElementById('nav-login').style.display = loggedIn ? 'none' : '';
  document.getElementById('nav-upload').style.display = loggedIn ? '' : 'none';
  document.getElementById('nav-result').style.display = loggedIn ? '' : 'none';
  document.getElementById('nav-logout').style.display = loggedIn ? '' : 'none';
}

// Nav events
document.getElementById('nav-login').onclick = e => { e.preventDefault(); showPage('page-login'); };
document.getElementById('nav-upload').onclick = e => { e.preventDefault(); showPage('page-upload'); };
document.getElementById('nav-result').onclick = e => { e.preventDefault(); showPage('page-result'); showResult(); };
document.getElementById('nav-logout').onclick = e => {
  e.preventDefault();
  token = '';
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('lastResult');
  lastResult = null;
  setNav(false);
  showPage('page-login');
  document.getElementById('loginStatus').innerText = '';
  document.getElementById('uploadStatus').innerText = '';
  document.getElementById('resultInfo').innerText = '';
  document.getElementById('resultVideo').style.display = 'none';
};

// Login -> POST /auth/login với { email, password }
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const emailInput = document.getElementById('email') || document.getElementById('username'); // hỗ trợ cả 2
  const email = emailInput?.value.trim() || '';
  const password = document.getElementById('password').value.trim();
  const status = document.getElementById('loginStatus');

  status.innerText = 'Đang đăng nhập...';
  status.className = '';
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.accessToken || data.token)) {
      token = data.accessToken || data.token;
      localStorage.setItem('accessToken', token);
      status.innerText = 'Đăng nhập thành công!';
      status.className = 'success';
      setNav(true);
      showPage('page-upload');
    } else {
      status.innerText = data.message || data.error || `Đăng nhập thất bại (${res.status})`;
      status.className = 'error';
    }
  } catch (err) {
    status.innerText = 'Lỗi kết nối!';
    status.className = 'error';
  }
};

// Hiển thị thông tin video gốc khi chọn file
const fileInputEl = document.getElementById('videoFile');
const widthEl = document.getElementById('width');
const heightEl = document.getElementById('height');
const sourceInfoEl = document.getElementById('sourceInfo');
const sizeWarnEl = document.getElementById('sizeWarn');

function fmtBytes(b){ if(!b && b!==0) return '—'; const u=['B','KB','MB','GB','TB']; let i=0; while(b>=1024&&i<u.length-1){b/=1024;i++;} return `${b.toFixed(2)} ${u[i]}`; }
function fmtTime(s){ if(!Number.isFinite(s)) return '—'; const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=Math.round(s%60).toString().padStart(2,'0'); return h?`${h}:${String(m).padStart(2,'0')}:${ss}`:`${m}:${ss}`; }

if (fileInputEl) {
  fileInputEl.addEventListener('change', () => {
    sizeWarnEl && (sizeWarnEl.style.display = 'none');
    if (!fileInputEl.files?.length) {
      if (sourceInfoEl) sourceInfoEl.textContent = 'Chưa chọn video.';
      return;
    }
    const f = fileInputEl.files[0];
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      const srcW = v.videoWidth || null;
      const srcH = v.videoHeight || null;
      const dur = v.duration;

      // Lưu để clamp
      if (sourceInfoEl) {
        sourceInfoEl.dataset.srcW = String(srcW || '');
        sourceInfoEl.dataset.srcH = String(srcH || '');
        sourceInfoEl.innerHTML = `
          <b>File:</b> ${f.name} • ${fmtBytes(f.size)} • ${f.type || 'video'}<br>
          <b>Kích thước gốc:</b> ${srcW && srcH ? `${srcW} x ${srcH}px` : '—'}<br>
          <b>Thời lượng:</b> ${fmtTime(dur)}
        `;
      }

      // Auto điền width/height nếu trống hoặc lớn hơn nguồn
      const wVal = parseInt(widthEl?.value || '', 10);
      const hVal = parseInt(heightEl?.value || '', 10);
      if (srcW && (!Number.isFinite(wVal) || wVal > srcW)) widthEl.value = String(srcW);
      if (srcH && (!Number.isFinite(hVal) || hVal > srcH)) heightEl.value = String(srcH);

      URL.revokeObjectURL(url);
    };
    v.onerror = () => {
      if (sourceInfoEl) sourceInfoEl.textContent = `${f.name} • ${fmtBytes(f.size)} • Không đọc được metadata`;
      URL.revokeObjectURL(url);
    };
  });

  // Không cho nhập vượt kích thước nguồn
  function clampWH() {
    const srcW = parseInt(sourceInfoEl?.dataset.srcW || '', 10);
    const srcH = parseInt(sourceInfoEl?.dataset.srcH || '', 10);
    if (!Number.isFinite(srcW) || !Number.isFinite(srcH)) return;

    let w = parseInt(widthEl.value || '', 10);
    let h = parseInt(heightEl.value || '', 10);
    let clamped = false;

    if (Number.isFinite(w) && w > srcW) { widthEl.value = String(srcW); clamped = true; }
    if (Number.isFinite(h) && h > srcH) { heightEl.value = String(srcH); clamped = true; }

    if (sizeWarnEl) {
      sizeWarnEl.textContent = clamped
        ? `Không được vượt kích thước gốc (${srcW} x ${srcH}). Đã tự điều chỉnh.`
        : '';
      sizeWarnEl.style.display = clamped ? '' : 'none';
    }
  }
  widthEl?.addEventListener('input', clampWH);
  heightEl?.addEventListener('input', clampWH);
}

// Upload -> POST /upload/video với field 'video'
document.getElementById('uploadForm').onsubmit = async function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('videoFile');
  const status = document.getElementById('uploadStatus');
  status.innerText = 'Đang upload...';
  status.className = '';

  if (!fileInput.files.length) { status.innerText = 'Hãy chọn một file video.'; return; }

  const w = parseInt(document.getElementById('width')?.value || '', 10);
  const h = parseInt(document.getElementById('height')?.value || '', 10);
  const width = Number.isFinite(w) ? w : 1280;
  const height = Number.isFinite(h) ? h : 720;

  const formData = new FormData();
  formData.append('video', fileInput.files[0]);
  formData.append('width', String(width));
  formData.append('height', String(height));

  try {
    const res = await fetch('/upload/video', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      lastResult = data.file || data.result || data;
      sessionStorage.setItem('lastResult', JSON.stringify(lastResult));
      status.innerText = 'Upload thành công!';
      status.className = 'success';
      showPage('page-result');
      showResult();
    } else {
      status.innerText = data.message || data.error || `Upload thất bại (${res.status})`;
      status.className = 'error';
      console.warn('Upload failed:', data);
    }
  } catch (err) {
    status.innerText = 'Lỗi kết nối!';
    status.className = 'error';
    console.error(err);
  }
};

// Hiển thị kết quả
function showResult() {
  const info = document.getElementById('resultInfo');
  const video = document.getElementById('resultVideo');
  if (!info || !video) return;

  if (!lastResult) {
    info.innerText = 'Chưa có file nào.';
    video.style.display = 'none';
    return;
  }

  const originalName = lastResult.originalName || lastResult.filename || lastResult.file_name || 'video.mp4';
  const size = lastResult.size || lastResult.file_size || 0;
  const mimetype = lastResult.mimetype || lastResult.format || 'video/mp4';
  const resizedPath = lastResult.resizedPath || lastResult.path || lastResult.file_path || '';

  // Kích thước từ server (nếu có)
  const srcW = lastResult.sourceWidth || lastResult.srcW || lastResult.source_width || null;
  const srcH = lastResult.sourceHeight || lastResult.srcH || lastResult.source_height || null;
  const outW = lastResult.width || lastResult.outWidth || lastResult.targetW || null;
  const outH = lastResult.height || lastResult.outHeight || lastResult.targetH || null;

  // Kích thước user yêu cầu (tham chiếu)
  const reqW = parseInt(document.getElementById('width')?.value || '', 10);
  const reqH = parseInt(document.getElementById('height')?.value || '', 10);
  const reqWH = (Number.isFinite(reqW) && Number.isFinite(reqH)) ? `${reqW} x ${reqH}px` : '—';

  info.innerHTML = `
    <b>Tên gốc:</b> ${originalName}<br>
    <b>Kích thước file:</b> ${size ? (size/1024/1024).toFixed(2) + ' MB' : '—'}<br>
    <b>Loại:</b> ${mimetype}<br>
    <b>Kích thước nguồn:</b> ${srcW && srcH ? `${srcW} x ${srcH}px` : '—'}<br>
    <b>Kích thước yêu cầu:</b> ${reqWH}<br>
    <b>Kích thước xuất (từ server):</b> ${outW && outH ? `${outW} x ${outH}px` : '—'}<br>
    <b>Kích thước thực tế file kết quả:</b> <span id="realDims">Đang đọc…</span><br>
    <b>File đã resize:</b> ${resizedPath ? `<a href="${getResizedUrl(resizedPath)}" target="_blank">Tải về/Xem</a>` : '—'}
  `;

  if (resizedPath) {
    video.onloadedmetadata = () => {
      const real = `${video.videoWidth} x ${video.videoHeight}px`;
      const el = document.getElementById('realDims');
      if (el) el.textContent = real;
    };
    video.onerror = () => {
      const el = document.getElementById('realDims');
      if (el) el.textContent = 'Không tải được video';
    };
    video.src = getResizedUrl(resizedPath);
    video.style.display = '';
  } else {
    video.style.display = 'none';
  }
}

// Chuẩn hóa đường dẫn file trả về từ server
function getResizedUrl(p) {
  if (!p) return '';
  const u = String(p).replace(/\\/g, '/');
  const idx = u.indexOf('/uploads/');
  if (idx !== -1) return u.slice(idx);
  if (u.startsWith('http')) return u;
  return u.startsWith('/uploads/') ? u : `/uploads/${u.replace(/^\/+/, '')}`;
}

// Nút quay lại upload
document.getElementById('backToUpload').onclick = function() {
  showPage('page-upload');
  document.getElementById('uploadStatus').innerText = '';
};

// Khởi tạo UI
setNav(!!token);
showPage(token ? 'page-upload' : 'page-login');