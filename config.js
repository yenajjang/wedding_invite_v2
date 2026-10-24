// 배포 전 입력할 설정값. API 키와 웹 앱 URL은 비밀번호가 아니므로 프런트엔드에 노출됩니다.
window.WEDDING_CONFIG = {
  kakaoJavascriptKey: '', // 카카오 개발자 콘솔 JavaScript 키
  rsvpScriptUrl: 'https://script.google.com/macros/s/AKfycbzuyGeQeAgQHrnLhz5kZneE5Qg_gC0HvT3mfrLrmb-NsEXTXYWhy5-6OBLLORd4Wy8Z/exec',      // RSVP용 Apps Script 웹앱 /exec URL
  guestbookScriptUrl: '', // 선택: 방명록용 Apps Script 웹앱 /exec URL
  publicUrl: 'https://wedding-seoryungsuhan.vercel.app/',
  // 실제 에셋을 assets/gallery-01.jpg ... 순서대로 넣으세요.
  galleryCount: 9,
};
