# AI MOBA Arena

브라우저에서 실행되는 싱글 플레이어 5대5 MOBA 프로토타입입니다. 사용자는 챔피언 1명을 직접 조작하고, 아군 AI 4명과 적군 AI 5명이 전투합니다.

## 기술 스택
- React + TypeScript
- Phaser 3
- Vite
- 별도 백엔드 없이 브라우저에서 실행

## 실행 방법
1. Node.js LTS를 설치합니다.
2. 이 프로젝트 폴더에서 터미널을 엽니다.
3. 의존성을 설치합니다.

```bash
npm install
```

4. 개발 서버를 실행합니다.

```bash
npm run dev
```

터미널에 표시되는 로컬 주소(일반적으로 `http://localhost:5173`)를 브라우저에서 엽니다.

## 빌드
```bash
npm run build
npm run preview
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

## GitHub Pages 배포
1. GitHub에서 새 저장소를 만듭니다.
2. 이 프로젝트 파일 전체를 저장소에 업로드합니다.
3. `Settings > Pages`에서 GitHub Actions 또는 정적 사이트 배포 방식을 선택합니다.
4. Vite의 `base: "./"` 설정은 상대 경로를 사용하므로 프로젝트 경로에서 정적 파일을 찾을 수 있습니다.
5. 로컬에서 `npm run build`를 실행한 뒤 `dist/` 폴더를 Pages에 배포하거나, 아래 예시 워크플로를 추가합니다.

`.github/workflows/deploy.yml` 예시:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

## 조작
- 우클릭: 이동
- 좌클릭: 공격 이동
- WASD: 이동
- Q/W/E/R: 챔피언 스킬
- F: 회복 주문
- B: 귀환
- P: 상점
- Tab: 전투 현황
- ESC: 일시정지

## 현재 구현 범위
- 챔피언 10종 선택 및 역할/능력치/스킬 데이터
- 5대5 영웅 배치, 기본 AI 이동 및 전투
- 3개 라인과 강/숲 시각 요소
- 미니언 웨이브, 포탑, 넥서스, 중립 몬스터
- 레벨/경험치/골드/아이템 구매/부활/승패 처리
- HUD, 미니맵 형태 UI, 상점, 일시정지, 전투 현황

## 참고
이 프로젝트는 독립적인 오리지널 프로토타입이며 League of Legends의 공식 코드, 캐릭터, 이미지, 사운드를 포함하지 않습니다. 현재 AI는 기본적인 라인 이동과 주변 적 교전 중심의 간단한 규칙 기반 AI입니다. 정교한 MOBA 수준의 경로 탐색, 역할별 전략, 오브젝트 운영, 네트워크 멀티플레이는 포함하지 않습니다.
