// 배포 전 입력할 설정값. API 키와 웹 앱 URL은 비밀번호가 아니므로 프런트엔드에 노출됩니다.
window.WEDDING_CONFIG = {
  kakaoJavascriptKey: 'd312c3ebae68d3fc9c7251bbd032c300', // 카카오 개발자 콘솔 JavaScript 키
  rsvpScriptUrl: 'https://script.google.com/macros/s/AKfycbzuyGeQeAgQHrnLhz5kZneE5Qg_gC0HvT3mfrLrmb-NsEXTXYWhy5-6OBLLORd4Wy8Z/exec',      // RSVP용 Apps Script 웹앱 /exec URL
  guestbookScriptUrl: 'https://script.google.com/macros/s/AKfycbwqJEcf3ht9tdNKm2YdSNB-r6sZREFRZewp8KlvUtL60L5BNkoInbfbXeO9hobjZhDy/exec', // guestbook-apps-script.gs를 별도 배포한 /exec URL (필수)
  publicUrl: 'https://wedding-seoryungsuhan-v2.vercel.app/',
  // 사진은 아래 배열에 파일명을 추가해 관리하세요 (JPG/JPEG 혼합 가능).
  // assets 폴더에 원본을 넣고 여기에 등록하면 미리보기 9장과 사진첩에 반영됩니다.
  galleryImages: [
    'gallery-01.jpeg',
    'gallery-02.jpeg',
    'gallery-03.jpeg',
    'gallery-04.jpeg',
    'gallery-05.jpeg',
    'gallery-06.jpeg',
    'gallery-07.jpeg',
    'gallery-08.jpeg',
    'gallery-09.jpeg',
    'gallery-10.jpeg',
    'gallery-11.jpeg',
    'gallery-12.jpeg',
    'gallery-13.jpeg',
    'gallery-14.jpeg',
    'gallery-15.jpeg',
    'gallery-16.jpeg',
    'gallery-17.jpeg',
    'gallery-18.jpeg',
    'gallery-19.jpeg',
    'gallery-20.jpeg',
    'gallery-21.jpeg',
    'gallery-22.jpeg',
    'gallery-23.jpeg',
    'gallery-24.jpeg',
    'gallery-25.jpeg',
    'gallery-26.jpeg',
  ],
};
