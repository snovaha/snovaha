# 🎂 1st Birthday Invitation

한우주의 첫 번째 생일을 축하하는 모바일 초대장 웹사이트

## 🏗️ 프로젝트 구조

```
1st-birthday/
├── src/public/          # 초대장 웹사이트
├── src/admin/           # 관리자 페이지 (개발 예정)
├── scripts/             # 배포 및 자동화 스크립트
├── docs/                # 문서
└── config/              # 설정 파일
```

## 🚀 빠른 시작

```bash
# 통합 배포
./scripts/deploy-all.sh

# 접속
https://invitation.snovaha.com
```

## 📚 문서

- [AWS 설정 가이드](docs/deployment/)
- [프로젝트 구조 계획](docs/project-structure-plan.md)

## 🎨 커스터마이징

설정 변경: `config/site-config.json`
이미지 교체: `src/public/assets/images/`
