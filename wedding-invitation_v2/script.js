(() => {
'use strict';
const cfg = window.WEDDING_CONFIG || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const weddingDate = new Date(2026, 11, 19);
const isConfigured = value => typeof value === 'string' && /^https:\/\//.test(value);
const modal = (id, show) => {
  const el = document.getElementById(id);
  if (!el) return;
  // The gallery grid and the single-photo viewer must never coexist.
  if (show && (id === 'galleryAlbum' || id === 'lightbox')) {
    const other = document.getElementById(id === 'galleryAlbum' ? 'lightbox' : 'galleryAlbum');
    if (other) {
      other.hidden = true;
      other.setAttribute('aria-hidden', 'true');
      other.inert = true;
    }
  }
  el.hidden = !show;
  el.setAttribute('aria-hidden', String(!show));
  el.inert = !show;
  if (id === 'successModal') el.classList.toggle('is-open', show);
  document.body.classList.toggle('modal-open', $$('.overlay:not([hidden]), .rsvp-success-modal:not([hidden])').length > 0);
};
let toastTimeout;
const notify = message => { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>el.classList.remove('show'),2400); };
async function copy(value) { try { await navigator.clipboard.writeText(value); notify('복사되었습니다.'); return true; } catch { const field=document.createElement('textarea'); field.value=value; document.body.append(field); field.select(); const ok=document.execCommand('copy'); field.remove(); notify(ok?'복사되었습니다.':'복사하지 못했습니다.'); return ok; } }
$$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>modal(btn.dataset.close,false)));
$$('.overlay').forEach(overlay=>overlay.addEventListener('click',e=>{if(e.target===overlay){if(overlay.id==='lightbox'){modal('lightbox',false);modal('galleryAlbum',true);}else modal(overlay.id,false);}}));
window.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.overlay:not([hidden])').forEach(el=>modal(el.id,false));if(!$('#lightbox').hidden){if(e.key==='ArrowLeft')showPhoto(activePhoto-1);if(e.key==='ArrowRight')showPhoto(activePhoto+1);}});
// Optional header menu (currently removed from the cover design)
const menuToggle = $('#menuToggle');
const menu = $('#menu');
const header = $('#siteHeader');
if(menuToggle && menu){
  menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));});
  $$('.menu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}));
}
if(header){
  function updateHeader(){const onCover=window.scrollY<Math.max(100,$('#cover').offsetHeight-100);header.classList.toggle('over-photo',onCover && window.scrollY<55);const title=$('#headerTitle'); if(title) title.textContent='';}
  window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();
}
// Background music: never force playback after an explicit pause.
const bgm=$('#bgm');let audioRequested=false;let explicitlyMuted=false;
async function tryPlay(){if(explicitlyMuted || audioRequested)return;audioRequested=true;try{await bgm.play();renderAudio(true);}catch{audioRequested=false;renderAudio(false);}}
function renderAudio(playing){$('#audioToggle').setAttribute('aria-label',playing?'배경음악 끄기':'배경음악 켜기');$('#audioIcon').innerHTML=playing?'<path d="M4 9v6h4l5 4V5L8 9H4zM16 8c2.5 2 2.5 6 0 8M19 5c4 4 4 10 0 14"/>':'<path d="M4 9v6h4l5 4V5L8 9H4zM17 9l4 6m0-6-4 6"/>';}
$('#audioToggle').addEventListener('click',()=>{if(!bgm.paused){bgm.pause();explicitlyMuted=true;audioRequested=false;renderAudio(false);}else{explicitlyMuted=false;audioRequested=false;tryPlay();}});
// Start on the first intentional scroll gesture rather than on page load.
// Some mobile browsers block unmuted playback on scroll alone; the first
// touch-move/wheel gesture also attempts playback, and the button remains available.
let scrollMusicActivated=false;
function startMusicOnScroll(){
  if(scrollMusicActivated || explicitlyMuted)return;
  if(!bgm.paused){scrollMusicActivated=true;return;}
  tryPlay();
  if(!bgm.paused)scrollMusicActivated=true;
}
let initialTouchY=null;
window.addEventListener('touchstart',e=>{
  if(e.touches.length===1)initialTouchY=e.touches[0].clientY;
},{passive:true});
window.addEventListener('touchmove',e=>{
  if(initialTouchY!==null && e.touches.length===1 && Math.abs(e.touches[0].clientY-initialTouchY)>8)
    startMusicOnScroll();
},{passive:true});
window.addEventListener('wheel',startMusicOnScroll,{passive:true});
window.addEventListener('scroll',()=>{if(window.scrollY>4)startMusicOnScroll();},{passive:true});
// D-day
const today=new Date(); today.setHours(0,0,0,0);const diff=Math.ceil((weddingDate.getTime()-today.getTime())/86400000);
$('#dDayNumber').textContent=diff>0?`D-${diff}`:diff===0?'D-DAY':`D+${Math.abs(diff)}`;
$('#dDayText').textContent=diff>0?`수한 ♥ 서령의 결혼식이 ${diff}일 남았습니다.`:diff===0?'오늘은 수한 ♥ 서령의 결혼식입니다.':'수한 ♥ 서령의 결혼식에 감사드립니다.';
setTimeout(()=>modal('dDayModal',true),450);
// Calendar
const dayLabels=['S','M','T','W','T','F','S'];const grid=$('#calendarGrid');dayLabels.forEach((day,index)=>{const d=document.createElement('div');d.className='day-label'+(index===0?' sunday':'');d.textContent=day;grid.append(d);});
const firstDay=new Date(2026,11,1).getDay();for(let i=0;i<firstDay;i++){const blank=document.createElement('div');grid.append(blank);}
for(let d=1;d<=31;d++){const el=document.createElement('div');const weekday=new Date(2026,11,d).getDay();el.className='calendar-day'+(weekday===0?' sunday':'')+(d===25?' holiday':'')+(d===19?' selected':'');el.textContent=d;grid.append(el);}
// Gallery. Unavailable photo files display a neutral placeholder.
const count=Math.max(9,Math.min(150,Number(cfg.galleryCount)||9));const photos=Array.from({length:count},(_,i)=>`./assets/gallery-${String(i+1).padStart(2,'0')}.jpg`);let activePhoto=0;
function showPhoto(index){activePhoto=(index+count)%count;$('#lightboxImage').src=photos[activePhoto];$('#photoCounter').textContent=`${activePhoto+1} / ${count}`;}
for(let i=0;i<Math.min(9,count);i++){const btn=document.createElement('button');btn.className='gallery-item';btn.setAttribute('aria-label',`${i+1}번째 웨딩 사진 확대`);const img=document.createElement('img');img.src=photos[i];img.alt=`웨딩 갤러리 ${i+1}`;img.loading='lazy';img.addEventListener('error',()=>{img.style.display='none';});const missing=document.createElement('span');missing.className='missing';missing.textContent=String(i+1).padStart(2,'0');btn.append(img,missing);if(i===8){const more=document.createElement('span');more.className='more-overlay';more.innerHTML=`${count>9?'+'+(count-9):''}<small>MORE</small>`;btn.append(more);}btn.addEventListener('click',()=>modal('galleryAlbum',true));$('#galleryGrid').append(btn);}
// Full-screen 3x3 album. Selecting an image opens the existing single-photo viewer.
for(let i=0;i<count;i++){
  const button=document.createElement('button');
  button.type='button';
  button.className='album-item';
  button.setAttribute('aria-label',`${i+1}번째 사진 보기`);
  const image=document.createElement('img');
  image.src=photos[i];
  image.alt=`웨딩 사진 ${i+1}`;
  image.loading='lazy';
  button.append(image);
  button.addEventListener('click',()=>{
    showPhoto(i);
    modal('galleryAlbum',false);
    modal('lightbox',true);
  });
  $('#albumGrid').append(button);
}
$('#closeGalleryPhoto').addEventListener('click',()=>{
  modal('lightbox',false);
  modal('galleryAlbum',true);
});
$('#prevPhoto').addEventListener('click',()=>showPhoto(activePhoto-1));$('#nextPhoto').addEventListener('click',()=>showPhoto(activePhoto+1));
$('#lightboxImage').addEventListener('error',()=>notify('사진 파일을 assets 폴더에 추가해주세요.'));
// Accounts
$$('.accordion-title').forEach(title=>title.addEventListener('click',()=>{const next=title.getAttribute('aria-expanded')!=='true';title.setAttribute('aria-expanded',String(next));title.querySelector('span').textContent=next?'⌃':'⌄';}));
$$('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{if(await copy(btn.dataset.copy)){const before=btn.textContent;btn.textContent='✓';setTimeout(()=>btn.textContent=before,1600)}}));
// Maps: Kakao Map SDK is loaded after the page has finished booting.
function loadKakaoSDK(){const key=cfg.kakaoJavascriptKey;if(!key){$('#kakaoMap').innerHTML='<div class="map-placeholder">카카오맵 설정이 필요합니다.<br>config.js에 JavaScript 키를 입력해주세요.</div>';return;}const s=document.createElement('script');s.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;s.onload=()=>{if(!window.kakao?.maps){mapFail();return;}kakao.maps.load(()=>{const target=$('#kakaoMap');const map=new kakao.maps.Map(target,{center:new kakao.maps.LatLng(37.517,127.038),level:3});const geocoder=new kakao.maps.services.Geocoder();geocoder.addressSearch('서울 강남구 선릉로145길 17',(result,status)=>{if(status!==kakao.maps.services.Status.OK){mapFail();return;}const center=new kakao.maps.LatLng(Number(result[0].y),Number(result[0].x));map.setCenter(center);const marker=new kakao.maps.Marker({map,position:center});const info=new kakao.maps.InfoWindow({content:'<div style="color:#222;padding:7px 9px;font-size:12px;white-space:nowrap">천주교 논현2동 성당</div>'});info.open(map,marker);setTimeout(()=>map.relayout(),100);});});};s.onerror=mapFail;document.head.append(s);}
function mapFail(){$('#kakaoMap').innerHTML='<div class="map-placeholder">지도를 불러오지 못했습니다.<br>아래 지도 버튼을 이용해주세요.</div>';}
loadKakaoSDK();
// RSVP
$('#openRsvp').addEventListener('click',()=>modal('rsvpModal',true));let companions=0;const updateCompanions=()=>$('#companionsValue').textContent=String(companions);
$('#stepMinus').addEventListener('click',()=>{companions=Math.max(0,companions-1);updateCompanions();});$('#stepPlus').addEventListener('click',()=>{companions++;updateCompanions();});
const form=$('#rsvpForm');function validate(){const values=new FormData(form);$('#rsvpSubmit').disabled=!(values.get('side')&&values.get('attendance')&&String(values.get('name')||'').trim());}form.addEventListener('input',validate);form.addEventListener('change',validate);
async function sendForm(url,payload){await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});/* Apps Script doPost parses e.postData.contents as JSON. no-cors response is opaque; verify the new row in Google Sheets. */}
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const values=new FormData(form);const payload={side:values.get('side')||'',attendance:values.get('attendance')||'',meal:values.get('meal')||'',name:String(values.get('name')||'').trim(),phone:String(values.get('phone')||'').trim(),companions};const error=$('#formError');error.textContent='';if(!isConfigured(cfg.rsvpScriptUrl)){error.textContent='RSVP 저장 서버가 연결되지 않았습니다. config.js를 설정해주세요.';return;}const submit=$('#rsvpSubmit');submit.disabled=true;submit.textContent='전송 중...';try{await sendForm(cfg.rsvpScriptUrl,payload);modal('rsvpModal',false);modal('successModal',true);form.reset();companions=0;updateCompanions();}catch{error.textContent='전송에 실패했습니다. 잠시 후 다시 시도해주세요.';}finally{submit.textContent='제출하기';validate();}});
// Letters to Us was removed from the invitation; legacy event listeners removed.
// Share
const linkButton = document.querySelector('[data-share="link"]');
const topButton = document.querySelector('[data-share="top"]');
if (linkButton) linkButton.addEventListener('click', async () => {
  const url = window.location.href;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      copied = true;
    }
  } catch (err) { console.warn('Clipboard API unavailable', err); }
  if (!copied) {
    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(field);
    field.focus();
    field.select();
    try { copied = document.execCommand('copy'); } catch (err) { console.warn('Copy fallback failed', err); }
    field.remove();
  }
  notify(copied ? '링크를 복사했습니다.' : '복사할 수 없습니다. 주소창의 링크를 복사해 주세요.');
});
if (topButton) topButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
function loadShareSDK(){if(!cfg.kakaoJavascriptKey)return;const s=document.createElement('script');s.src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';s.crossOrigin='anonymous';s.onload=()=>{if(window.Kakao&&!Kakao.isInitialized())Kakao.init(cfg.kakaoJavascriptKey)};document.head.append(s)}loadShareSDK();
$('#shareKakao').addEventListener('click',async()=>{const url=cfg.publicUrl||location.href;if(window.Kakao?.isInitialized()){try{Kakao.Share.sendDefault({objectType:'feed',content:{title:'수한 ♥ 서령의 결혼식에 초대합니다.',description:'2026년 12월 19일 오후 4시 · 천주교 논현2동 성당',imageUrl:new URL('assets/main.jpg',url).href,link:{mobileWebUrl:url,webUrl:url}},buttons:[{title:'청첩장 보기',link:{mobileWebUrl:url,webUrl:url}}]});return;}catch(err){console.warn(err);}}if(navigator.share){try{await navigator.share({title:'수한 ♥ 서령의 결혼식',text:'2026년 12월 19일 오후 4시 · 천주교 논현2동 성당',url});return;}catch{}}notify('카카오 공유 설정이 필요합니다.');});
})();
