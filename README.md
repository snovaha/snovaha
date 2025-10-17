# SNOVAHA

> **Super Nova** + **Han & Ahn** = 부모의 여정을 가장 아름답게

[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://www.snovaha.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 소개

SNOVAHA는 육아의 모든 순간을 담는 플랫폼입니다.

- **Super Nova (초신성)**: 우주처럼 빛나는 아이들의 성장
- **Han & Ahn**: 부모님의 사랑과 헌신

## 🚀 서비스

### 현재 제공
- [돌잔치 초대장](https://github.com/snovaha/snovaha-invitation) - 모바일 최적화 감성 초대장
- [각도법 (Nub Theory)](https://github.com/snovaha/snovaha-nub-theory) - 성별 예측 서비스

### 곧 출시
- 성장 일기 - 아이의 성장을 기록하고 공유
- 육아 팁 - AI 기반 맞춤형 육아 조언
- 커뮤니티 - 부모들의 소통 공간

## 🎨 디자인

- **Toss 스타일** - 2025년 트렌드를 반영한 모던 디자인
- **Pretendard 폰트** - 가독성과 세련미
- **반응형 레이아웃** - 모든 디바이스에서 완벽한 경험
- **초신성 로고** - SNOVAHA의 철학을 담은 아이덴티티

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Hosting**: AWS S3 + CloudFront
- **Domain**: snovaha.com
- **SSL**: AWS Certificate Manager

## 📦 설치 및 실행

```bash
# 레포 클론
git clone https://github.com/snovaha/snovaha.git
cd snovaha

# 로컬 서버 실행 (Python)
cd src/public
python3 -m http.server 8000

# 또는 Node.js
npx serve
```

## 🚀 배포

```bash
# AWS CLI 설정 필요
bash scripts/aws/deploy.sh
```

## 📁 프로젝트 구조

```
snovaha/
├── src/
│   └── public/
│       ├── index.html
│       └── assets/
│           ├── css/
│           ├── js/
│           └── images/
├── scripts/
│   └── aws/
│       └── deploy.sh
└── README.md
```

## 🌐 링크

- **웹사이트**: https://www.snovaha.com
- **GitHub**: https://github.com/snovaha
- **문의**: [Issues](https://github.com/snovaha/snovaha/issues)

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

## 💕 기여

Pull Request는 언제나 환영합니다!

---

Made with ❤️ by SNOVAHA Team
