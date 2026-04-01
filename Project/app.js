// app.js

// ==========================================
// 상태 관리
// ==========================================
let currentStream = null;
let isProcessing = false;
let currentImageData = null;
let currentUser = null;
let currentAction = ''; // 'register' (업로드) 또는 'compare' (웹캠) 상태 저장

// ==========================================
// 요소 가져오기
// ==========================================
const loginPageBtn = document.getElementById('loginPageBtn');
const signupPageBtn = document.getElementById('signupPageBtn');
const registerPageBtn = document.getElementById('registerPageBtn');
const galleryPageBtn = document.getElementById('galleryPageBtn');

const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const registerPage = document.getElementById('registerPage');
const galleryPage = document.getElementById('galleryPage');

const authNav = document.getElementById('authNav');
const mainNav = document.getElementById('mainNav');
const userInfoArea = document.getElementById('userInfoArea');
const currentUserDisplay = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

// 로그인 요소
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const signupLink = document.getElementById('signupLink');

// 회원가입 요소
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupPasswordConfirm = document.getElementById('signupPasswordConfirm');
const signupSubmitBtn = document.getElementById('signupSubmitBtn');
const loginLink = document.getElementById('loginLink');

// 프로필 요소
const profilePageBtn = document.getElementById('profilePageBtn');
const profilePage = document.getElementById('profilePage');
const editProfilePage = document.getElementById('editProfilePage');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const editProfileBtn = document.getElementById('editProfileBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const editName = document.getElementById('editName');
const editEmail = document.getElementById('editEmail');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// 비밀번호 확인 모달
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordError = document.getElementById('passwordError');
const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');

const webcamBtn = document.getElementById('webcamBtn');
const uploadBtn = document.getElementById('uploadBtn');
const realInput = document.getElementById('real-input');

const resultArea = document.getElementById('result-area');
const previewImage = document.getElementById('preview-image');

const registerBtn = document.getElementById('registerBtn');
const retryBtn = document.getElementById('retryBtn');
const deleteBtn = document.getElementById('deleteBtn');
const compareBtn = document.getElementById('compareBtn');
const compareResult = document.getElementById('compare-result');
const compareTitle = document.getElementById('compareTitle');
const compareMessage = document.getElementById('compareMessage');
const closeCompareBtn = document.getElementById('closeCompareBtn');

const cameraModal = document.getElementById('camera-modal');
const webcamVideo = document.getElementById('webcam-video');
const captureBtn = document.getElementById('captureBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const galleryContainer = document.getElementById('galleryContainer');
const emptyMessage = document.getElementById('emptyMessage');

// ==========================================
// 얼굴 인식 모델 로드
// ==========================================
let modelsLoaded = false;
async function loadModels() {
    if (modelsLoaded) return;
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        console.log('얼굴 인식 모델 로드 완료');
    } catch (err) {
        console.error('모델 로드 실패:', err);
    }
}
loadModels();

async function getFaceDescriptor(imageSrc) {
    try {
        if (!modelsLoaded) await loadModels();

        const img = new Image();
        img.src = imageSrc;
        
        return new Promise((resolve, reject) => {
            img.onload = async () => {
                try {
                    const detection = await faceapi
                        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    
                    if (detection) {
                        resolve(detection.descriptor);
                    } else {
                        reject(new Error('얼굴을 감지하지 못했습니다.'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('이미지 로드 실패'));
        });
    } catch (err) {
        throw err;
    }
}

function calculateDistance(descriptor1, descriptor2) {
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// 용도에 맞춰 버튼을 보여주는 함수
function showResultAreaControls() {
    resultArea.style.display = 'flex';
    
    if (currentAction === 'register') {
        registerBtn.style.display = 'inline-block';
        compareBtn.style.display = 'none'; // 등록 시 비교 버튼 숨김
    } else if (currentAction === 'compare') {
        registerBtn.style.display = 'none'; // 비교 시 등록 버튼 숨김
        compareBtn.style.display = 'inline-block';
    }
}

// ==========================================
// 사진 비교 함수 (웹캠 전용)
// ==========================================
async function comparePhotos() {
    if (!currentImageData) {
        alert('먼저 사진을 찍어주세요!');
        return;
    }
    if (!currentUser) {
        alert('로그인이 필요합니다!');
        return;
    }

    try {
        compareBtn.disabled = true;
        compareBtn.textContent = '인증 중...';

        const currentDescriptor = await getFaceDescriptor(currentImageData);
        
        // 1인 1사진 단일 객체 불러오기
        const registeredPhoto = JSON.parse(localStorage.getItem('userPhoto_' + currentUser.id));
        
        if (!registeredPhoto) {
            showCompareResult('등록된 사진이 없습니다.', '출결 인증을 위해 먼저 사진을 등록해주세요.', false);
            return;
        }

        const threshold = 0.55; // 깐깐하게 설정된 임계값 (원하시면 조절 가능)
        const registeredDescriptor = await getFaceDescriptor(registeredPhoto.image);
        const distance = calculateDistance(currentDescriptor, registeredDescriptor);

        if (distance < threshold) {
            showCompareResult(
                `✓ 인증 완료!`,
                `${registeredPhoto.name}님, 본인 인증이 완료되었습니다.\n(유사도: ${((1 - distance / threshold) * 100).toFixed(1)}%)`,
                true,
                currentImageData,
                registeredPhoto.image,
                registeredPhoto.name
            );
        } else {
            showCompareResult(
                `✗ 인증 실패`,
                '등록된 본인 사진과 일치하지 않습니다.\n다시 시도해주세요.',
                false
            );
        }
    } catch (err) {
        console.error('비교 중 오류:', err);
        alert('사진 비교 중 오류가 발생했습니다: ' + err.message);
    } finally {
        compareBtn.disabled = false;
        compareBtn.textContent = '비교하기';
    }
}

function showCompareResult(title, message, isMatch, currentImg = null, registeredImg = null, matchedName = null) {
    compareTitle.textContent = title;
    compareTitle.style.color = isMatch ? '#4CAF50' : '#ff4757';
    compareMessage.textContent = message;
    compareMessage.innerHTML = message.replace(/\n/g, '<br>');
    
    if (currentImg && registeredImg) {
        compareMessage.innerHTML += `
            <div class="compare-img-container">
                <div class="compare-img-box">
                    <img src="${currentImg}" alt="현재 사진">
                    <div class="compare-img-label">현재 웹캠 사진</div>
                </div>
                <div style="display: flex; align-items: center; font-weight: 700; font-size: 1.2rem; color: #667eea;">VS</div>
                <div class="compare-img-box">
                    <img src="${registeredImg}" alt="등록된 사진">
                    <div class="compare-img-label">등록된 기준 사진</div>
                </div>
            </div>
        `;
    }
    compareResult.style.display = 'block';
}

closeCompareBtn.addEventListener('click', function() {
    compareResult.style.display = 'none';
});
compareBtn.addEventListener('click', comparePhotos);

// ==========================================
// 기능 1: 웹캠 버튼 클릭 (비교 용도)
// ==========================================
webcamBtn.addEventListener('click', async function() {
    if (isProcessing || currentStream) {
        alert("이미 카메라가 실행 중입니다!");
        return;
    }

    const registeredPhoto = JSON.parse(localStorage.getItem('userPhoto_' + currentUser.id));
    if (!registeredPhoto) {
        alert("먼저 사진 등록(업로드)을 진행해주세요!");
        return;
    }

    isProcessing = true;
    currentAction = 'compare'; // 상태: 비교 모드
    webcamBtn.disabled = true;
    uploadBtn.disabled = true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamVideo.srcObject = stream;
        currentStream = stream;
        cameraModal.style.display = 'flex';
    } catch (err) {
        alert("카메라 권한을 허용해주세요!");
    } finally {
        isProcessing = false;
    }
});

// 기능 2: 웹캠 찰칵 버튼
captureBtn.addEventListener('click', function() {
    if (isProcessing) return;
    isProcessing = true;
    captureBtn.disabled = true;

    try {
        const canvas = document.createElement('canvas');
        canvas.width = webcamVideo.videoWidth;
        canvas.height = webcamVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(webcamVideo, 0, 0);

        currentImageData = canvas.toDataURL('image/png');
        previewImage.src = currentImageData;
        
        showResultAreaControls(); // 버튼 분기 처리

        closeModal();
    } finally {
        isProcessing = false;
        captureBtn.disabled = false;
    }
});

// ==========================================
// 기능 3: 업로드 버튼 클릭 (등록 용도)
// ==========================================
uploadBtn.addEventListener('click', function() {
    if (currentStream) {
        alert("카메라 사용을 먼저 종료해주세요!");
        return;
    }
    currentAction = 'register'; // 상태: 등록 모드
    realInput.click();
});

realInput.addEventListener('change', function(event) {
    if (isProcessing) return;
    const file = event.target.files[0];
    if (file) {
        isProcessing = true;
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            previewImage.src = currentImageData;
            
            showResultAreaControls(); // 버튼 분기 처리
            
            isProcessing = false;
        };
        reader.onerror = function() {
            alert("파일 읽기에 실패했습니다!");
            isProcessing = false;
        };
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 기능 4: 사진 등록 버튼 처리 (1인 1사진 덮어쓰기)
// ==========================================
registerBtn.addEventListener('click', function() {
    if (isProcessing) return;
    if (!currentUser) return;

    isProcessing = true;

    try {
        const existingPhoto = localStorage.getItem('userPhoto_' + currentUser.id);
        if (existingPhoto) {
            if(!confirm("이미 등록된 사진이 있습니다. 새로운 사진으로 교체하시겠습니까?")) {
                return;
            }
        }

        const newPhoto = {
            id: currentUser.id, // 유저 ID를 그대로 사진 ID로 사용
            name: currentUser.name,
            image: currentImageData,
            date: new Date().toLocaleString('ko-KR')
        };

        // 배열이 아닌 단일 객체로 저장
        localStorage.setItem('userPhoto_' + currentUser.id, JSON.stringify(newPhoto));

        alert(currentUser.name + "님의 사진이 성공적으로 등록되었습니다!");

        resetResultArea();
    } finally {
        isProcessing = false;
    }
});

// 기능 5: 다시 찍기 (공통)
retryBtn.addEventListener('click', resetResultArea);
deleteBtn.addEventListener('click', resetResultArea);

function resetResultArea() {
    resultArea.style.display = 'none';
    previewImage.src = '';
    currentImageData = null;
    realInput.value = '';
    compareResult.style.display = 'none';
}

function closeModal() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    cameraModal.style.display = 'none';
    webcamBtn.disabled = false;
    uploadBtn.disabled = false;
}
closeModalBtn.addEventListener('click', closeModal);

// ==========================================
// 갤러리 로드 (1인 1사진 전용으로 변경)
// ==========================================
function loadGallery() {
    if (!currentUser) return;

    const photo = JSON.parse(localStorage.getItem('userPhoto_' + currentUser.id));
    galleryContainer.innerHTML = '';

    if (!photo) {
        emptyMessage.style.display = 'block';
        galleryContainer.style.display = 'none';
    } else {
        emptyMessage.style.display = 'none';
        galleryContainer.style.display = 'grid';

        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${photo.image}" class="gallery-image" alt="${photo.name}">
            <div class="gallery-info">
                <div class="gallery-name">${photo.name}</div>
                <div class="gallery-date">${photo.date}</div>
                <button class="gallery-delete" onclick="deletePhoto()">사진 삭제</button>
            </div>
        `;
        galleryContainer.appendChild(card);
    }
}

// 갤러리에서 사진 삭제 (ID 파라미터 필요 없음)
window.deletePhoto = function() {
    if (!currentUser) return;
    if (confirm('기준 사진을 정말 삭제하시겠습니까? 삭제 시 출결 인증이 불가능합니다.')) {
        localStorage.removeItem('userPhoto_' + currentUser.id);
        loadGallery();
    }
}


// ==========================================
// UI 전환 및 초기화 (기존과 거의 동일)
// ==========================================
function initializeApp() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainUI();
    } else {
        showAuthUI();
    }
}

function showAuthUI() {
    currentUser = null;
    registerPage.classList.remove('active');
    galleryPage.classList.remove('active');
    authNav.style.display = 'flex';
    mainNav.style.display = 'none';
    userInfoArea.style.display = 'none';
    document.getElementById('headerContainer').classList.replace('main-style', 'auth-style');
    document.body.classList.replace('main-mode', 'auth-mode');
    switchAuthPage('login');
}

function showMainUI() {
    loginPage.classList.remove('active');
    signupPage.classList.remove('active');
    authNav.style.display = 'none';
    mainNav.style.display = 'flex';
    userInfoArea.style.display = 'block';
    currentUserDisplay.textContent = currentUser.name + '님 환영합니다!';
    document.getElementById('headerContainer').classList.replace('auth-style', 'main-style');
    document.body.classList.replace('auth-mode', 'main-mode');
    switchPage('register');
}

function switchAuthPage(page) {
    loginPage.classList.remove('active');
    signupPage.classList.remove('active');
    loginPageBtn.className = 'nav-btn inactive';
    signupPageBtn.className = 'nav-btn inactive';

    if (page === 'login') {
        loginPage.classList.add('active');
        loginPageBtn.classList.replace('inactive', 'active');
        loginUsername.focus();
    } else {
        signupPage.classList.add('active');
        signupPageBtn.classList.replace('inactive', 'active');
        signupName.focus();
    }
}

function switchPage(page) {
    ['register', 'gallery', 'profile', 'editProfile'].forEach(p => {
        document.getElementById(p + 'Page').classList.remove('active');
    });
    ['register', 'gallery', 'profile'].forEach(p => {
        document.getElementById(p + 'PageBtn').className = 'nav-btn inactive';
    });

    if (page === 'register') {
        registerPage.classList.add('active');
        registerPageBtn.classList.replace('inactive', 'active');
    } else if (page === 'gallery') {
        galleryPage.classList.add('active');
        galleryPageBtn.classList.replace('inactive', 'active');
        loadGallery();
    } else if (page === 'profile') {
        profilePage.classList.add('active');
        profilePageBtn.classList.replace('inactive', 'active');
        loadProfile();
    } else if (page === 'editProfile') {
        editProfilePage.classList.add('active');
    }
}

// 메뉴 리스너
loginPageBtn.addEventListener('click', () => switchAuthPage('login'));
signupPageBtn.addEventListener('click', () => switchAuthPage('signup'));
signupLink.addEventListener('click', (e) => { e.preventDefault(); switchAuthPage('signup'); });
loginLink.addEventListener('click', (e) => { e.preventDefault(); switchAuthPage('login'); });
registerPageBtn.addEventListener('click', () => switchPage('register'));
galleryPageBtn.addEventListener('click', () => switchPage('gallery'));

// 회원가입
signupSubmitBtn.addEventListener('click', function() {
    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const passwordConfirm = signupPasswordConfirm.value;

    if (!name || !email.includes('@') || password.length < 6 || password !== passwordConfirm) {
        alert('입력 정보를 다시 확인해주세요.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) return alert('이미 가입된 이메일입니다!');

    users.push({ id: Date.now(), name, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('회원가입 완료!');
    loginUsername.value = email;
    signupName.value = signupEmail.value = signupPassword.value = signupPasswordConfirm.value = '';
    switchAuthPage('login');
});

// 로그인
loginSubmitBtn.addEventListener('click', function() {
    const email = loginUsername.value.trim();
    const password = loginPassword.value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return alert('이메일/비밀번호 오류입니다!');

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loginUsername.value = loginPassword.value = '';
    showMainUI();
});

// 로그아웃
logoutBtn.addEventListener('click', function() {
    if (confirm('로그아웃하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        resetResultArea();
        showAuthUI();
    }
});

// 프로필 기능
function loadProfile() {
    if (!currentUser) return;
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
}

editProfileBtn.addEventListener('click', () => {
    editName.value = currentUser.name;
    editEmail.value = currentUser.email;
    switchPage('editProfile');
});

saveEditBtn.addEventListener('click', () => {
    passwordInput.value = '';
    passwordError.style.display = 'none';
    passwordModal.style.display = 'flex';
    passwordInput.focus();
});

confirmPasswordBtn.addEventListener('click', () => {
    if (passwordInput.value !== currentUser.password) {
        passwordError.style.display = 'block';
        passwordError.textContent = '비밀번호가 틀렸습니다.';
        return;
    }

    const newName = editName.value.trim();
    const newEmail = editEmail.value.trim();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === newEmail && u.id !== currentUser.id)) {
        return alert('이미 사용 중인 이메일입니다!');
    }

    currentUser.name = newName;
    currentUser.email = newEmail;
    users = users.map(u => u.id === currentUser.id ? currentUser : u);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('수정 완료!');
    passwordModal.style.display = 'none';
    loadProfile();
    switchPage('profile');
});

cancelPasswordBtn.addEventListener('click', () => passwordModal.style.display = 'none');
cancelEditBtn.addEventListener('click', () => switchPage('profile'));
profilePageBtn.addEventListener('click', () => switchPage('profile'));

deleteAccountBtn.addEventListener('click', function() {
    if (confirm('계정을 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.id !== currentUser.id);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.removeItem('userPhoto_' + currentUser.id); // 변경된 키 이름 반영
        localStorage.removeItem('currentUser');
        alert('계정이 삭제되었습니다.');
        currentUser = null;
        showAuthUI();
    }
});

initializeApp();