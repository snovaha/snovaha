# SNOVAHA Nub Theory

> 초음파 각도법 (Nub Theory) 성별 예측 서비스

[![Deploy](https://img.shields.io/badge/deploy-coming-orange)](https://www.snovaha.com/nub-theory/)
[![Parent Repo](https://img.shields.io/badge/parent-snovaha-blue)](https://github.com/snovaha/snovaha)

## 🔬 소개

임신 11-13주차 초음파 사진의 각도를 측정하여 태아의 성별을 확률적으로 예측하는 서비스입니다.

## 📐 각도법 (Nub Theory)이란?

태아의 생식결절(Genital Tubercle)과 척추가 이루는 각도를 기반으로 성별을 예측하는 방법입니다.

### 기준
- **30° 이상**: 남아 추정
- **30° 미만**: 여아 추정

### 정확도
- **적합한 조건**: 70-90%
- **부적합한 조건**: 50-60% (동전 던지기 수준)

### 적합한 조건
- ✅ 임신 11주 0일 ~ 13주 6일
- ✅ 태아가 측면으로 누워있음
- ✅ 척추가 명확히 보임
- ✅ 생식결절이 선명함

### 부적합한 조건
- ❌ 주수가 맞지 않음
- ❌ 태아가 정면/뒷면을 보고 있음
- ❌ 이미지 해상도가 낮음
- ❌ 각도 측정이 어려움

## ⚠️ 주의사항

**이 서비스는 의학적 진단이 아닙니다!**

- 참고 용도로만 사용하세요
- 정확한 성별은 의사의 진단을 받으세요
- 결과에 대한 책임은 사용자에게 있습니다

## ✨ 주요 기능 (계획)

### Phase 1 (현재)
- [x] 각도법 설명 페이지
- [x] 주의사항 안내
- [x] 측정 기준 가이드

### Phase 2 (개발 예정)
- [ ] 이미지 업로드
- [ ] 기준선 그리기 도구
- [ ] 각도 자동 계산
- [ ] 결과 및 신뢰도 표시

### Phase 3 (미래)
- [ ] AI 기반 자동 측정
- [ ] 정확도 개선
- [ ] 사용자 통계 분석
- [ ] 의사 소견 연동

## 🛠️ 기술 스택

### Current
- HTML5
- CSS3
- JavaScript

### Planned
- Canvas API (각도 측정 도구)
- TensorFlow.js (AI 자동 측정)
- AWS Rekognition (이미지 분석)

## 📦 설치 및 실행

```bash
# 레포 클론
git clone https://github.com/snovaha/snovaha-nub-theory.git
cd snovaha-nub-theory

# 로컬 서버 실행
python3 -m http.server 8000
# 또는
npx serve
```

## 🎨 디자인

- **Toss 스타일** - 깔끔하고 신뢰감 있는 디자인
- **카드 레이아웃** - 정보 구분이 명확
- **주의사항 강조** - 의학적 진단이 아님을 명시

## 📁 프로젝트 구조

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

## 🔬 참고 자료

- [Nub Theory Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3530251/)
- [Ultrasound Gender Prediction](https://www.whattoexpect.com/pregnancy/fetal-development/fetal-sex-organs-reproductive-system)

## 🌐 데모

- **서비스**: https://www.snovaha.com/nub-theory/

## 🤝 기여

Pull Request는 언제나 환영합니다!

특히 다음 분야의 기여를 환영합니다:
- 의학 전문가의 검수
- AI 모델 개선
- UX 개선

## 📝 라이선스

MIT License

## ⚖️ 면책 조항

이 서비스는 교육 및 참고 목적으로만 제공됩니다. 
의학적 진단이나 치료를 대체할 수 없으며, 
결과에 대한 책임은 사용자에게 있습니다.

---

Part of [SNOVAHA](https://github.com/snovaha/snovaha) Platform

