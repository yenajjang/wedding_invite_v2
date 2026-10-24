# 수한 & 서령 모바일 청첩장

오렌지(`#ff650b`)와 블랙(`#111111`) 콘셉트의 순수 HTML/CSS/JavaScript 모바일 청첩장입니다. PC에서 최대 폭 430px로 중앙 정렬됩니다.

## 로컬 미리보기

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속. `index.html`을 파일로 직접 여는 것보다 로컬 서버를 권장합니다.

## 사진과 음악 넣기

- `assets/main.jpg`: 표지 웨딩 사진 (가능하면 세로형, 흑백 또는 원본 사진을 사용하면 CSS가 흑백 처리)
- `assets/gallery-01.jpg` ... `assets/gallery-09.jpg`: 갤러리 사진
- `assets/bgm.mp3`: 배경음악
- 갤러리 사진이 10장 이상이면 `config.js`의 `galleryCount`를 실제 파일 개수로 수정

**참고 스크린샷 자체는 사진 파일로 사용하지 않았습니다.** 원본 사진을 제공받으면 바로 끼워 넣을 수 있습니다.

## 연동 설정

1. `config.js`의 `kakaoJavascriptKey`에 카카오 JavaScript 키를 입력합니다.
2. Kakao Developers 앱 설정에서 **웹 플랫폼 사이트 도메인**에 `http://localhost:8000`과 `https://wedding-seoryungsuhan.vercel.app`을 등록하고, Kakao Map 사용 설정, 카카오톡 공유 관련 설정을 확인합니다. 해당 SDK의 도메인 등록 요건은 카카오 콘솔 최신 안내를 따르세요.
3. Google Spreadsheet 생성 → 확장 프로그램 → Apps Script → `apps-script.gs` 내용 붙여넣기 → `SPREADSHEET_ID` 교체 → **웹앱**으로 배포(나로 실행, 모든 사용자 액세스).
4. 배포된 `.../exec` 주소를 `config.js`의 `rsvpScriptUrl`과 `guestbookScriptUrl`에 넣습니다.
5. **중요**: 정적 사이트에서는 브라우저가 Apps Script에 `no-cors` 요청을 보낼 때 응답 검증이 불가능합니다. 현재 UI는 서버 저장 성공으로 단정하지 않고 **전송 요청**으로 표시합니다. 저장 성공 팝업을 정확히 표시하려면 Vercel 서버리스 API 등을 추가하여 검증된 JSON 응답을 받도록 구현해야 합니다.
6. Google Apps Script의 간단한 공개 웹앱은 스팸/남용 방지, 인증, 제출 빈도 제한이 부족하므로 실제 공개 전에 보호 장치를 고려하세요.

## 배포

이 폴더를 GitHub 저장소 루트에 업로드합니다. Vercel에서 **Other** 프레임워크로 가져와 빌드 설정 없이 배포할 수 있습니다. `config.js` 안의 `publicUrl`을 실제 배포 주소와 동일하게 유지하세요.

### 구현 기능

- 반응형 표지 / D-day 팝업 / 음악 토글 / 고정 헤더 메뉴
- Invitation / 달력 / 3x3 갤러리 / Lightbox
- 편지형 방명록 UI 및 메시지 제출
- Kakao 지도 주소 지오코딩 / 외부 지도 링크
- RSVP Bottom Sheet / 필수값 유효성 검사 / 스프레드시트 전송
- 계좌 아코디언 / 복사 / 카카오 공유 / 링크 복사 / 상단 이동

### 서체 관련

본 레퍼런스의 Bodoni 계열과 유사한 **Italiana / Playfair Display** 공개 웹폰트를 사용합니다. 원본 유료 폰트 파일을 포함하거나 무단 변환하지 않았습니다. 실제 `Bodoni-06-Medium` SVG path 원본이 있다면 개별 SVG 파일로 교체할 수 있습니다.
