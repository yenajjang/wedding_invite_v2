/**
 * Google Apps Script에서 스프레드시트에 연결해 배포할 코드.
 * 1) SPREADSHEET_ID 교체
 * 2) RSVP, Guestbook 시트 생성 (첫 행 머리글은 코드가 자동 생성)
 * 3) 웹앱 배포: 실행 사용자=나, 액세스 권한=모든 사용자
 * 4) /exec URL을 config.js의 rsvpScriptUrl, guestbookScriptUrl 모두에 입력
 *
 * 프런트엔드는 CORS 제약으로 응답을 검증하지 못할 수 있으므로
 * 진짜 제출 성공 확인이 필수라면 서버 측 프록시를 추가하세요.
 */
const SPREADSHEET_ID = 'REPLACE_WITH_SPREADSHEET_ID';
function doGet(e) {
  // 필요한 경우 공개 메시지 읽기 제공. 개인 정보가 있는 RSVP는 절대 공개하지 않음.
  if ((e.parameter.action || '') !== 'guestbook') return json_({error:'Unsupported action'});
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Guestbook');
  if (!sheet || sheet.getLastRow() < 2) return json_({messages:[]});
  const rows = sheet.getRange(2,1,Math.min(100,sheet.getLastRow()-1),3).getValues();
  return json_({messages:rows.map(r=>({name:String(r[1]),message:String(r[2])})).reverse()});
}
function doPost(e) {
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try {
    const data=e.parameter && Object.keys(e.parameter).length ? e.parameter : JSON.parse(e.postData.contents||'{}');
    const book=SpreadsheetApp.openById(SPREADSHEET_ID);
    if (data.message !== undefined) {
      const name=String(data.name||'').trim().slice(0,30);
      const message=String(data.message||'').trim().slice(0,500);
      if(!name||!message) return json_({success:false,error:'Required fields missing'});
      const sheet=ensureSheet_(book,'Guestbook',['제출일시','성함','메시지']);
      sheet.appendRow([new Date(), safe_(name), safe_(message)]);
    } else {
      const side=String(data.side||'');const attendance=String(data.attendance||'');const name=String(data.name||'').trim().slice(0,40);
      if(!['신랑측','신부측'].includes(side)||!['네','아니오'].includes(attendance)||!name)return json_({success:false,error:'Invalid RSVP'});
      const sheet=ensureSheet_(book,'RSVP',['제출일시','하객 구분','참석 여부','식사 여부','성함','연락처','동행인 수']);
      sheet.appendRow([new Date(),safe_(side),safe_(attendance),safe_(String(data.meal||'').slice(0,10)),safe_(name),safe_(String(data.phone||'').slice(0,20)),Math.max(0,Math.floor(Number(data.companions)||0))]);
    }
    return json_({success:true});
  }catch(err){return json_({success:false,error:String(err)});}finally{lock.releaseLock();}
}
function ensureSheet_(book,name,header){let sheet=book.getSheetByName(name);if(!sheet){sheet=book.insertSheet(name);sheet.appendRow(header);}return sheet;}
function safe_(value){return /^[=+\-@]/.test(value)?"'"+value:value;}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
