# SNOVAHA 프로젝트 아키텍처 문서

> 이 문서는 SNOVAHA 플랫폼의 전체 구조와 구현 방법을 설명합니다.

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [브랜드 정체성](#브랜드-정체성)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [레포지토리 구조](#레포지토리-구조)
5. [배포 인프라](#배포-인프라)
6. [도메인 및 SSL](#도메인-및-ssl)
7. [기술 스택](#기술-스택)
8. [디렉토리 구조](#디렉토리-구조)
9. [배포 프로세스](#배포-프로세스)
10. [문제 해결](#문제-해결)

---

## 프로젝트 개요

**SNOVAHA**는 육아의 모든 순간을 담는 플랫폼입니다.

### 브랜드명 유래
- **SNOVAHA** = **S**uper **Nova** + **Ha**n & **A**hn
- **Super Nova (초신성)**: 우주처럼 빛나는 아이들의 성장
- **Han & Ahn**: 부모님(한흥석, 안보경)의 성씨

### 프로젝트 배경
- 아기 이름: **한우주** (宇宙)
- 초신성과 우주라는 테마로 브랜드 구축
- 부모의 사랑과 아이의 성장을 담는 플랫폼

---

## 브랜드 정체성

### 로고
```svg
<!-- 초신성 로고: 중심 코어 + 8방향 빛줄기 + 2개 궤도 링 -->
<svg width="140" height="40" viewBox="0 0 140 40">
  <!-- 중심 코어 (그라데이션) -->
  <circle cx="20" cy="20" r="4" fill="url(#gradient1)"/>
  
  <!-- 8방향 빛줄기 -->
  <path d="M20 8 L20 4" stroke="url(#gradient2)" stroke-width="2"/>
  <!-- ... 나머지 7개 방향 -->
  
  <!-- 궤도 링 -->
  <circle cx="20" cy="20" r="8" stroke="url(#gradient3)" fill="none"/>
  <circle cx="20" cy="20" r="12" stroke="url(#gradient3)" fill="none"/>
  
  <!-- 텍스트 -->
  <text x="44" y="26" font-family="Pretendard" font-weight="800">SNOVAHA</text>
</svg>
```

### 디자인 철학
- **Toss 스타일**: 2025년 트렌드를 반영한 모던 디자인
- **Pretendard 폰트**: 가독성과 세련미
- **블루 컬러 시스템**: `#3182f6` (Primary), `#1d4ed8` (Hover)
- **반응형 레이아웃**: Mobile-first 접근

---

## 시스템 아키텍처

### Multi-Repository 구조 (MSA 스타일)

```
┌─────────────────────────────────────────┐
│         GitHub Organization             │
│            snovaha/                     │
├─────────────────────────────────────────┤
│  ┌───────────────┐                     │
│  │  snovaha      │  메인 홈페이지      │
│  └───────────────┘  (2025 트렌드)      │
│  ┌───────────────┐                     │
│  │  snovaha-     │  초대장 서비스      │
│  │  invitation   │  (갤러리, 음악)    │
│  └───────────────┘                     │
│  ┌───────────────┐                     │
│  │  snovaha-     │  각도법 서비스      │
│  │  nub-theory   │  (성별 예측)        │
│  └───────────────┘                     │
│  ┌───────────────┐                     │
│  │  snovaha-     │  육아 혜택 서비스   │
│  │  benefits     │  (정부 지원금)      │
│  └───────────────┘                     │
│  ┌───────────────┐                     │
│  │  snovaha-     │  육아 커뮤니티      │
│  │  community    │  (Coming Soon)      │
│  └───────────────┘                     │
└─────────────────────────────────────────┘
```

### 배포 전략

**단일 S3 + CloudFront + 서브폴더 구조**

```
S3 Bucket: 1st-birthday-invitation-20251011
├── index.html              # 메인 홈
├── favicon.svg             # 글로우 스타 듀얼 로고
├── assets/                 # 메인 에셋
│   ├── css/
│   │   └── home.css        # 반응형 디자인 (PC/모바일)
│   └── js/
│       └── home.js
├── invitation/             # 초대장 서비스
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
├── nub-theory/             # 각도법 서비스
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
├── benefits/               # 육아 혜택 서비스
│   ├── index.html
│   ├── favicon.svg
│   └── assets/
└── community/              # 육아 커뮤니티
    ├── index.html
    ├── favicon.svg
    └── assets/
```

---

## 레포지토리 구조

### 1. snovaha (메인)
```
snovaha/
├── src/
│   └── public/
│       ├── index.html
│       ├── assets/
│       │   ├── css/
│       │   │   └── home.css
│       │   ├── js/
│       │   │   └── home.js
│       │   └── images/
│       ├── invitation/          # 서브폴더
│       └── nub-theory/          # 서브폴더
├── scripts/
│   └── aws/
│       └── deploy.sh
├── README.md
└── ARCHITECTURE.md
```

### 2. snovaha-invitation
```
snovaha-invitation/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   │   ├── hero.jpg
│   │   └── gallery/
│   │       ├── gallery-1.jpg
│   │       └── ... (9장)
│   └── audio/
│       └── background.mp4
├── scripts/
│   └── aws/
└── README.md
```

### 3. snovaha-nub-theory
```
snovaha-nub-theory/
├── index.html
├── assets/
│   ├── css/
│   │   └── home.css
│   └── js/
│       └── home.js
└── README.md
```

---

## 배포 인프라

### AWS 구성

```
┌──────────────────────────────────────────┐
│         Route 53 (DNS)                   │
│  www.snovaha.com → CloudFront            │
│  snovaha.com → www.snovaha.com           │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│     CloudFront (CDN)                     │
│  Distribution ID: E2Z50QKS64PV0U         │
│  - HTTPS (SSL Certificate)               │
│  - Caching                               │
│  - Gzip Compression                      │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│     S3 Bucket (Static Hosting)           │
│  1st-birthday-invitation-20251011        │
│  - Public Read Access                    │
│  - Website Hosting Enabled               │
│  - Index: index.html                     │
└──────────────────────────────────────────┘
```

### S3 설정

**버킷 정책 (Public Read)**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::1st-birthday-invitation-20251011/*"
    }
  ]
}
```

**웹사이트 호스팅**
- Index document: `index.html`
- Error document: `index.html`

### CloudFront 설정

**Alternate Domain Names (CNAMEs)**
- `www.snovaha.com`
- `snovaha.com`

**SSL Certificate**
- ARN: `arn:aws:acm:us-east-1:184810386157:certificate/fd616c28-e814-402b-86c9-0f5b059f38da`
- Type: 와일드카드 (`*.snovaha.com`, `snovaha.com`)
- Validation: DNS (CNAME)

**Behaviors**
- Viewer Protocol: Redirect HTTP to HTTPS
- Compress Objects: Yes
- Cache Policy: Default

---

## 도메인 및 SSL

### DNS 구성 (Hosting.kr)

```
호스트     타입    값
──────────────────────────────────────────
*          CNAME   d104xm32ar1ns2.cloudfront.net
www        CNAME   d104xm32ar1ns2.cloudfront.net
_7ca7...   CNAME   _571b... (SSL 검증)
```

### SSL 인증서 발급 과정

1. **AWS Certificate Manager (us-east-1)**
   ```bash
   aws acm request-certificate \
     --domain-name "*.snovaha.com" \
     --subject-alternative-names "snovaha.com" \
     --validation-method DNS \
     --region us-east-1
   ```

2. **DNS 검증 레코드 추가**
   - Hosting.kr에 CNAME 레코드 추가
   - 5-10분 대기

3. **CloudFront에 적용**
   ```bash
   aws cloudfront update-distribution \
     --id E2Z50QKS64PV0U \
     --distribution-config file://config.json
   ```

### 도메인 문제 해결

**문제**: 루트 도메인 (`snovaha.com`)이 작동하지 않음
- **원인**: Hosting.kr가 루트 도메인 CNAME을 지원하지 않음
- **해결**: `www` 서브도메인으로 CNAME 설정 + CloudFront에 양쪽 추가

---

## 기술 스택

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: 
  - Flexbox, Grid
  - CSS Variables
  - Animations
- **JavaScript (Vanilla)**:
  - Intersection Observer API
  - Audio API
  - Canvas API (planned for nub-theory)

### Hosting & CDN
- **AWS S3**: Static website hosting
- **AWS CloudFront**: CDN, SSL
- **AWS Certificate Manager**: SSL certificates
- **AWS CLI**: Deployment automation

### Domain
- **Hosting.kr**: DNS management
- **snovaha.com**: Custom domain

### Development
- **Git**: Version control
- **GitHub**: Repository hosting
- **VS Code**: IDE

---

## 배포 프로세스

### 로컬 개발

```bash
# 레포 클론
git clone https://github.com/snovaha/snovaha.git
cd snovaha

# 로컬 서버 실행
cd src/public
python3 -m http.server 8000
# 또는
npx serve
```

### S3 배포

```bash
# 배포 스크립트 실행
bash scripts/aws/deploy.sh

# 수동 배포
aws s3 sync src/public/ s3://BUCKET_NAME/ \
  --delete \
  --cache-control "max-age=60" \
  --exclude ".DS_Store"
```

### CloudFront 캐시 무효화

```bash
aws cloudfront create-invalidation \
  --distribution-id E2Z50QKS64PV0U \
  --paths "/*"
```

### 전체 배포 플로우

```
1. 로컬 개발 및 테스트
   ↓
2. Git 커밋 & 푸시
   git add .
   git commit -m "..."
   git push origin main
   ↓
3. S3 배포
   bash scripts/aws/deploy.sh
   ↓
4. CloudFront 캐시 무효화
   aws cloudfront create-invalidation ...
   ↓
5. 배포 확인 (5-10분 후)
   https://www.snovaha.com
```

---

## 디자인 시스템

### 색상 팔레트

```css
:root {
  /* Primary */
  --primary: #3182f6;
  --primary-hover: #1b64da;
  
  /* Text */
  --text-primary: #191f28;
  --text-secondary: #4e5968;
  --text-tertiary: #8b95a1;
  
  /* Background */
  --bg: #fafafa;
  --surface: #ffffff;
  
  /* Border */
  --border: #e5e8eb;
  
  /* Shadow */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### 타이포그래피

```css
/* 폰트 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* 사이즈 */
h1: 72px / 84px (desktop)
h2: 42px
h3: 24px
body: 16px
small: 14px
```

### 레이아웃

```css
/* Container */
max-width: 1200px;
padding: 0 24px;

/* Border Radius */
--radius: 12px;
--radius-lg: 16px;

/* Spacing */
gap: 16px, 24px, 32px, 48px, 64px
```

---

## 주요 기능 구현

### 0. 메인 홈페이지 (Main)

**히어로 섹션**
```
- 밝은 블루/핑크/피치 그라데이션 배경
- "SNOVAHA" 브랜드 텍스트 (블루→퍼플 그라데이션)
- "임신부터 육아까지, 모든 순간을 함께합니다"
- 부드러운 별, 하트, 동그라미 패턴
```

**서비스 그리드 (Services)**
```
PC: 4열 고정 그리드
모바일: 2열 반응형

1. 돌잔치 초대장 (🎉)
   - 감성적인 모바일 초대장
   
2. 각도법 (👶)
   - 임신 초기 성별 예측
   
3. 육아 혜택 (🎁) - 강조됨 (노란색)
   - 정부 지원금 & 할인
   
4. 커뮤니티 (💬)
   - 육아 팁 & 정보 공유
```

**혜택 섹션 (Benefits)**
```
PC: 정확한 3x2 그리드 (6개 카드)
모바일: 2x3 그리드

1. 첫만남 이용권 (🎫) - 200만원
2. 6+6 부모육아휴직제 (👨‍👩‍👧) - 월 450만원
3. 부모급여 (💰) - 월 100만원
4. 아동수당 (🎁) - 월 10만원
5. 다둥이 행복카드 (💳) - 최대 50% 할인
6. 서울아기 건강첫걸음 (🌟) - 70만원

모든 혜택 카드는 실제 정부 기관 링크 연결
```

**디자인 특징**
- 뉘앙스 호버 애니메이션 (큐빅 베지어)
- 상단 라인 호버 효과
- 프리미엄한 그림자와 간격
- 완전 반응형 (PC 최적화)

### 1. 초대장 (invitation)

**라이트박스**
```javascript
function openLightbox(index) {
  lightbox.classList.add('active');
  currentImageIndex = index;
  updateLightboxImage();
}

// 좌우 스와이프 지원
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});
lightbox.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (diff > 50) prevImage();
  if (diff < -50) nextImage();
});
```

**배경 음악**
```javascript
const audio = document.getElementById('background-music');
const musicBtn = document.getElementById('music-toggle');

// 자동 재생 시도
setTimeout(() => {
  audio.play().catch(err => {
    console.log('Auto-play failed:', err);
  });
}, 1000);

// 사용자 인터랙션 시 재시도
['click', 'touchstart', 'scroll'].forEach(event => {
  document.addEventListener(event, () => {
    audio.play();
  }, { once: true });
});
```

**카운트다운**
```javascript
const partyDate = new Date('2025-10-11T12:00:00').getTime();

setInterval(() => {
  const now = new Date().getTime();
  const distance = partyDate - now;
  
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  
  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
}, 1000);
```

### 2. 각도법 (nub-theory)

**현재 구현**: 정보 페이지
**계획 중**: 
- Canvas 기반 각도 측정 도구
- 이미지 업로드
- AI 자동 측정

---

## 문제 해결

### 1. DNS 문제

**증상**: `DNS_PROBE_FINISHED_NXDOMAIN`
**원인**: Hosting.kr가 루트 도메인 CNAME 미지원
**해결**: `www` 서브도메인 + CloudFront에 양쪽 추가

### 2. CloudFront 캐시 문제

**증상**: 배포 후 이전 버전 표시
**해결**: 
```bash
# 캐시 무효화
aws cloudfront create-invalidation --distribution-id E2Z50QKS64PV0U --paths "/*"

# 브라우저 강력 새로고침
Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

### 3. 서브폴더 404 오류

**증상**: `/invitation/` 접속 시 404
**원인**: S3에 서브폴더 미배포
**해결**: 메인 레포에 서브폴더 복사 후 배포
```bash
cp -r snovaha-invitation/* snovaha/src/public/invitation/
cp -r snovaha-nub-theory/* snovaha/src/public/nub-theory/
bash scripts/aws/deploy.sh
```

### 4. SSL 인증서 오류

**증상**: `InvalidViewerCertificate`
**원인**: 인증서가 도메인을 커버하지 않음
**해결**: 와일드카드 인증서 재발급
```bash
aws acm request-certificate \
  --domain-name "*.snovaha.com" \
  --subject-alternative-names "snovaha.com" \
  --validation-method DNS \
  --region us-east-1
```

---

## 백업 및 복원

### 백업
```bash
# 로컬 백업
tar -czf snovaha-backup-$(date +%Y%m%d-%H%M%S).tar.gz snovaha/

# Git 태그
git tag -a backup-YYYYMMDD -m "Backup before major changes"
git push origin backup-YYYYMMDD
```

### 복원
```bash
# 로컬 백업에서 복원
tar -xzf snovaha-backup-20251017-234214.tar.gz

# Git 태그에서 복원
git checkout backup-YYYYMMDD
```

---

## 성능 최적화

### 이미지 최적화
```bash
# ImageMagick으로 리사이즈
magick convert hero.jpg -resize 1200x1200 hero.jpg

# WebP 변환
magick convert gallery-1.jpg -quality 85 gallery-1.webp
```

### CSS/JS 최적화
- Minification (배포 시)
- Gzip 압축 (CloudFront 자동)
- Critical CSS 인라인

### 캐싱 전략
- HTML: `Cache-Control: max-age=60` (1분)
- CSS/JS: `Cache-Control: max-age=86400` (1일)
- Images: `Cache-Control: max-age=2592000` (30일)

---

## 향후 계획

### Phase 1 (완료)
- [x] 메인 홈페이지
- [x] 초대장 서비스
- [x] 각도법 정보 페이지
- [x] Multi-repo 구조
- [x] AWS 배포 인프라

### Phase 2 (진행 중)
- [ ] 각도법 이미지 업로드
- [ ] 각도 측정 도구
- [ ] 로고 최종 확정

### Phase 3 (계획)
- [ ] 성장 일기 기능
- [ ] 육아 팁 AI 챗봇
- [ ] 커뮤니티 기능
- [ ] 사용자 인증

---

## 연락처 및 리소스

### GitHub
- Organization: https://github.com/snovaha
- 메인: https://github.com/snovaha/snovaha
- 초대장: https://github.com/snovaha/snovaha-invitation
- 각도법: https://github.com/snovaha/snovaha-nub-theory
- 육아혜택: https://github.com/snovaha/snovaha-benefits
- 커뮤니티: https://github.com/snovaha/snovaha-community

### 웹사이트
- 메인: https://www.snovaha.com
- 초대장: https://www.snovaha.com/invitation/
- 각도법: https://www.snovaha.com/nub-theory/
- 육아혜택: https://www.snovaha.com/benefits/
- 커뮤니티: https://www.snovaha.com/community/

### AWS
- Region: ap-northeast-2 (Seoul)
- S3 Bucket: 1st-birthday-invitation-20251011
- CloudFront ID: E2Z50QKS64PV0U

---

## 라이선스

MIT License - 자유롭게 사용하세요!

---

**문서 버전**: 2.0  
**최종 업데이트**: 2025-10-17  
**작성자**: SNOVAHA Team

### 최근 업데이트 (v2.0)

**2025-10-17**:
- [x] PC 레이아웃 완전 개선
  - 서비스 카드 4열 고정 그리드
  - 혜택 카드 3x2 정확한 그리드
  - 더 큰 아이콘과 타이포그래피
  - 더 강한 호버 애니메이션

- [x] 메인 홈페이지 기능 추가
  - 밝은 히어로 배경 (블루/핑크/피치)
  - 4개 서비스 카드 (이모지 기반)
  - 6개 정부 혜택 카드 (실제 링크)
  - 완전 반응형 (PC/모바일)

- [x] 레포지토리 구조 확장
  - snovaha (메인)
  - snovaha-invitation (초대장)
  - snovaha-nub-theory (각도법)
  - snovaha-benefits (육아혜택)
  - snovaha-community (커뮤니티)

- [x] 문서화 완료
  - 아키텍처 설명
  - 배포 프로세스
  - 기술 스택
  - 문제 해결 가이드

