/** Guestbook-only Apps Script. Deploy separately from the existing RSVP web app.
 * Replace ID and deploy: execute as Me, access Anyone.
 * Data sheet columns: ID | 작성일시 | 이름 | 메시지 | 비밀번호 솔트 | 비밀번호 해시
 */
const GUESTBOOK_SPREADSHEET_ID = 'REPLACE_WITH_SPREADSHEET_ID';
const GUESTBOOK_TAB = 'Guestbook';
const GUESTBOOK_HEADERS = ['ID','작성일시','이름','메시지','비밀번호 솔트','비밀번호 해시'];
function doGet(e){
  const p=(e&&e.parameter)||{};
  let result;
  try{
    if(p.action==='list'){
      const sheet=guestbookSheet_();const last=sheet.getLastRow();
      const rows=last>1?sheet.getRange(2,1,last-1,4).getValues():[];
      result={success:true,messages:rows.map(r=>({id:String(r[0]),name:String(r[2]),message:String(r[3])})).reverse()};
    }else if(p.action==='status'){
      if(!/^req_[a-zA-Z0-9_-]{8,100}$/.test(String(p.requestId||'')))throw Error('Invalid request');
      const raw=CacheService.getScriptCache().get('gb_'+p.requestId);
      result=raw?JSON.parse(raw):{status:'pending'};
    }else throw Error('Unsupported action');
  }catch(err){result={success:false,error:String(err.message||err)};}
  const json=JSON.stringify(result);
  // Callback is a restricted JavaScript identifier, never arbitrary code.
  if(p.callback && /^__guestbook_cb_[a-z0-9]{5,32}$/.test(p.callback)){
    return ContentService.createTextOutput(p.callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
  let data={},out;
  try{
    data=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    const requestId=String(data.requestId||'');
    if(!/^req_[a-zA-Z0-9_-]{8,100}$/.test(requestId))throw Error('Invalid requestId');
    const lock=LockService.getScriptLock();lock.waitLock(20000);
    try{
      const cache=CacheService.getScriptCache();const key='gb_'+requestId;
      const previous=cache.get(key);
      if(previous){out=JSON.parse(previous);} // idempotent when cached
      else {
        try{
          if(data.action==='create')out=createGuestbook_(data);
          else if(data.action==='delete')out=deleteGuestbook_(data);
          else throw Error('Unsupported action');
        }catch(err){out={status:'error',error:String(err.message||err)};}
        cache.put(key,JSON.stringify(out),600);
      }
    }finally{lock.releaseLock();}
  }catch(err){out={status:'error',error:String(err.message||err)};}
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function guestbookSheet_(){
 const ss=SpreadsheetApp.openById(GUESTBOOK_SPREADSHEET_ID);
 let sheet=ss.getSheetByName(GUESTBOOK_TAB);
 if(!sheet){sheet=ss.insertSheet(GUESTBOOK_TAB);sheet.appendRow(GUESTBOOK_HEADERS);}
 else if(sheet.getLastRow()===0)sheet.appendRow(GUESTBOOK_HEADERS);
 else if(String(sheet.getRange(1,1).getValue())!=='ID')throw Error('Guestbook 탭 헤더가 다릅니다. 새 탭을 사용해주세요.');
 return sheet;
}
function sha256_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8).map(x=>('0'+(x&255).toString(16)).slice(-2)).join('');}
function sanitizeCell_(value){const s=String(value||'');return /^[=+\-@\t\r]/.test(s)?"'"+s:s;}
function createGuestbook_(data){
 const name=String(data.name||'').trim();const message=String(data.message||'').trim();const password=String(data.password||'');
 if(!name||name.length>30||!message||message.length>500)throw Error('이름 또는 메시지를 확인해주세요.');
 if(password.length<4||password.length>64)throw Error('비밀번호는 4~64자로 입력해주세요.');
 const sheet=guestbookSheet_();const id=Utilities.getUuid(),salt=Utilities.getUuid();
 sheet.appendRow([id,new Date(),sanitizeCell_(name),sanitizeCell_(message),salt,sha256_(salt+':'+password)]);
 return {status:'success',id:id};
}
function deleteGuestbook_(data){
 const id=String(data.id||'');const password=String(data.password||'');
 if(!id||!password)throw Error('비밀번호를 입력해주세요.');
 const sheet=guestbookSheet_(),last=sheet.getLastRow();
 if(last<2)throw Error('메시지를 찾을 수 없습니다.');
 const ids=sheet.getRange(2,1,last-1,1).getValues();
 const idx=ids.findIndex(r=>String(r[0])===id);
 if(idx<0)throw Error('메시지를 찾을 수 없습니다.');
 const row=idx+2,values=sheet.getRange(row,5,1,2).getValues()[0];
 if(sha256_(String(values[0])+':'+password)!==String(values[1]))throw Error('비밀번호가 일치하지 않습니다.');
 sheet.deleteRow(row);
 return {status:'success',id:id};
}
