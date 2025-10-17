# SNOVAHA Invitation

> 모바일 최적화 돌잔치 초대장 서비스

[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://www.snovaha.com/invitation/)
[![Parent Repo](https://img.shields.io/badge/parent-snovaha-blue)](https://github.com/snovaha/snovaha)

## 🎂 소개

소중한 아이의 첫 번째 생일을 위한 감성 초대장입니다.

## ✨ 주요 기능

### 📱 모바일 최적화
- 반응형 디자인
- 터치 제스처 지원
- 빠른 로딩 속도

### 📸 갤러리
- 9장의 사진 슬라이드
- 라이트박스 확대 보기
- 좌우 스와이프 네비게이션

### 🎵 배경 음악
- 자동 재생 시도
- 재생/정지 컨트롤
- MP3/MP4 지원

### 📅 일정 안내
- D-Day 카운트다운
- 날짜/시간/장소
- 네이버 지도 연동

### 📍 오시는 길
- 주소 정보
- 주차 안내
- 대중교통 안내

## 🎨 디자인

- **블루 테마** - 남아 컨셉
- **카드 레이아웃** - 정보 구분이 명확
- **플로팅 메뉴** - 빠른 네비게이션
- **부드러운 애니메이션** - 스크롤 인터랙션

## 🛠️ 기술 스택

- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (Vanilla)
- Intersection Observer API
- Audio API

## 📦 설치 및 실행

```bash
# 레포 클론
git clone https://github.com/snovaha/snovaha-invitation.git
cd snovaha-invitation

# 로컬 서버 실행
python3 -m http.server 8000
# 또는
npx serve
```

## 🎨 커스터마이징

### 1. 기본 정보 변경
`index.html` 파일에서 다음 정보를 수정:
- 아기 이름
- 부모님 이름
- 날짜/시간
- 장소 정보

### 2. 사진 교체
`assets/images/` 폴더에서:
- `hero.jpg` - 메인 사진
- `gallery/gallery-1.jpg ~ gallery-9.jpg` - 갤러리 사진

### 3. 음악 변경
`assets/audio/` 폴더에:
- `background.mp3` 또는 `background.mp4`

### 4. 색상 변경
`assets/css/style.css`에서 CSS 변수 수정:
```css
:root {
  --primary-blue: #4a90e2;
  --secondary-blue: #357abd;
  /* ... */
}
```

## 🚀 배포

```bash
# AWS S3 배포
bash scripts/aws/deploy.sh

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## 📁 프로젝트 구조

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
│   └── audio/
│       └── background.mp3
├── scripts/
│   └── aws/
└── README.md
```

## 📱 브라우저 지원

- Chrome (최신)
- Safari (최신)
- Firefox (최신)
- Edge (최신)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

## 💡 Tips

### 이미지 최적화
```bash
# ImageMagick으로 리사이즈
magick convert hero.jpg -resize 1200x1200 hero.jpg
```

### 음악 파일 크기 줄이기
```bash
# ffmpeg으로 압축
ffmpeg -i input.mp3 -b:a 128k output.mp3
```

## 🌐 데모

- **한우주 첫 생일**: https://www.snovaha.com/invitation/

## 📝 라이선스

MIT License

---

Part of [SNOVAHA](https://github.com/snovaha/snovaha) Platform

