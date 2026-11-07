/**
 * Script Test E2E Nhanh Nhóm P1: Auth & Saved Words
 * Chạy bằng: node server/src/scripts/test_p1.js
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ NHÓM CHỨC NĂNG P1 (BACKEND)');
  console.log('====================================================\n');

  const randomSuffix = Math.floor(Math.random() * 100000);
  const testEmail = `tester_${randomSuffix}@visulingo.com`;
  const testPassword = 'Password123!';
  const testName = `Tester ${randomSuffix}`;

  let token = '';
  let savedWordId = '';

  // 1. Test Register
  console.log('1️⃣ Kiểm tra: POST /api/auth/register (Đăng ký tài khoản mới)');
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword, displayName: testName }),
  });
  if (regRes.status === 201 && regRes.data?.user?.email === testEmail) {
    console.log('   ✅ Đăng ký thành công! HTTP 201 - User ID:', regRes.data.user.id);
  } else {
    console.error('   ❌ Thất bại:', regRes);
  }

  // 2. Test Duplicate Register
  console.log('\n2️⃣ Kiểm tra: POST /api/auth/register (Kiểm tra chặn email trùng)');
  const dupRegRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword, displayName: testName }),
  });
  if (dupRegRes.status === 409 && dupRegRes.data?.code === 'EMAIL_EXISTS') {
    console.log('   ✅ Bắt đúng mã lỗi HTTP 409 EMAIL_EXISTS');
  } else {
    console.error('   ❌ Thất bại:', dupRegRes);
  }

  // 3. Test Login
  console.log('\n3️⃣ Kiểm tra: POST /api/auth/login (Đăng nhập)');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  if (loginRes.status === 200 && loginRes.data?.token) {
    token = loginRes.data.token;
    console.log('   ✅ Đăng nhập thành công! HTTP 200 - Nhận được JWT Token');
  } else {
    console.error('   ❌ Thất bại:', loginRes);
  }

  // 4. Test Get Me
  console.log('\n4️⃣ Kiểm tra: GET /api/auth/me (Lấy profile cá nhân với JWT)');
  const meRes = await request('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (meRes.status === 200 && meRes.data?.email === testEmail) {
    console.log('   ✅ Lấy profile thành công! HTTP 200 - Display Name:', meRes.data.displayName);
  } else {
    console.error('   ❌ Thất bại:', meRes);
  }

  // 5. Test Save Word
  console.log('\n5️⃣ Kiểm tra: POST /api/saved-words (Lưu từ vựng mới)');
  const saveRes = await request('/saved-words', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ word: 'phone' }),
  });
  if (saveRes.status === 201 && saveRes.data?.id) {
    savedWordId = saveRes.data.id;
    console.log('   ✅ Lưu từ thành công! HTTP 201 - Word:', saveRes.data.word, '| SavedWord ID:', savedWordId);
  } else {
    console.log('   ℹ️ Kết quả lưu từ (có thể do CSDL chưa có từ "phone", thử lại bằng từ khác hoặc kiểm tra kết quả):', saveRes);
  }

  // 6. Test Duplicate Save Word
  if (savedWordId) {
    console.log('\n6️⃣ Kiểm tra: POST /api/saved-words (Chống lưu trùng từ)');
    const dupSaveRes = await request('/saved-words', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ word: 'phone' }),
    });
    if (dupSaveRes.status === 409 && dupSaveRes.data?.code === 'DUPLICATE_WORD') {
      console.log('   ✅ Bắt đúng mã lỗi HTTP 409 DUPLICATE_WORD');
    } else {
      console.error('   ❌ Thất bại:', dupSaveRes);
    }
  }

  // 7. Test List Saved Words
  console.log('\n7️⃣ Kiểm tra: GET /api/saved-words (Danh sách từ đã lưu)');
  const listRes = await request('/saved-words?page=1&limit=20', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (listRes.status === 200 && Array.isArray(listRes.data?.data)) {
    console.log('   ✅ Lấy danh sách thành công! HTTP 200 - Tổng số từ:', listRes.data.pagination.total);
  } else {
    console.error('   ❌ Thất bại:', listRes);
  }

  // 8. Test Delete Saved Word
  if (savedWordId) {
    console.log('\n8️⃣ Kiểm tra: DELETE /api/saved-words/:id (Xóa từ khỏi danh sách)');
    const delRes = await request(`/saved-words/${savedWordId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (delRes.status === 200) {
      console.log('   ✅ Xóa từ thành công! HTTP 200 - Message:', delRes.data.message);
    } else {
      console.error('   ❌ Thất bại:', delRes);
    }
  }

  // 9. Test Unauthorized
  console.log('\n9️⃣ Kiểm tra: Bảo vệ API khi không có Token (Middleware Auth)');
  const noAuthRes = await request('/saved-words', {
    method: 'GET',
  });
  if (noAuthRes.status === 401 && noAuthRes.data?.code === 'UNAUTHORIZED') {
    console.log('   ✅ Chặn truy cập trái phép thành công! HTTP 401 UNAUTHORIZED');
  } else {
    console.error('   ❌ Thất bại:', noAuthRes);
  }

  console.log('\n====================================================');
  console.log('🎉 HOÀN THÀNH TOÀN BỘ BÀI TEST NHÓM CHỨC NĂNG P1!');
  console.log('====================================================');
}

runTests().catch(console.error);
