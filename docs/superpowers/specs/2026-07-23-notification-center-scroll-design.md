# 알림 센터 스크롤 수정 설계

## 목적

헤더의 알림 센터에서 최근 알림 목록이 뷰포트 높이를 초과할 때 목록 영역만 정상적으로 세로 스크롤되도록 한다.

## 원인

`DialogContent`는 공통 컴포넌트에서 `grid` 레이아웃을 사용하지만, 알림 센터는 그 안에 `h-full`인 별도 flex 래퍼를 중첩한다. 스크롤 영역의 `min-h-0`만으로는 바깥 grid 트랙과 내부 flex 높이 계산 사이의 경계를 제거하지 못해, 환경에 따라 목록이 내부 overflow 영역으로 축소되지 않고 콘텐츠 높이만큼 늘어날 수 있다.

## 변경 설계

- `components/layout/NotificationCenter.tsx`만 수정한다.
- `DialogContent` 자체를 `flex h-dvh flex-col gap-0 overflow-hidden`으로 만든다.
- 불필요한 `flex h-full flex-col` 중간 래퍼를 제거한다.
- `DialogHeader`는 `shrink-0`, 목록은 `min-h-0 flex-1 overflow-y-auto`를 유지한다.
- 공통 `components/ui/dialog.tsx`는 다른 모달에 영향을 줄 수 있으므로 수정하지 않는다.
- 알림 데이터 조회, 읽음 처리, 링크 이동 로직은 변경하지 않는다.

## 검증

- 정적 회귀 검증으로 알림 센터가 단일 flex 높이 경계를 사용하고 목록 영역에 `min-h-0` 및 `overflow-y-auto`가 유지되는지 확인한다.
- `npm run lint`와 `npm run build`를 실행한다.
- 브라우저 제어 기능이 제공되는 환경에서는 데스크톱과 모바일 뷰포트에서 알림 센터를 열고 목록의 스크롤 위치가 변경되는지 확인한다.
