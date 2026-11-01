const $ = (s, r = document) => r.querySelector(s);
const screens = [...document.querySelectorAll('.screen')];
let cur = 0;

/* خلفية الصورة */
$('#bgPhoto').style.backgroundImage = `url("${CONFIG.mainPhoto}")`;

/* شرارات ذهبية */
(function(){
  const c = $('#sparks'), x = c.getContext('2d'); let w, h, p = [];
  const rs = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  rs(); addEventListener('resize', rs);
  for (let i = 0; i < 70; i++) p.push({x: Math.random()*2000, y: Math.random()*2000, r: Math.random()*1.8+.4, v: Math.random()*.3+.1, a: Math.random()});
  (function loop(){
    x.clearRect(0,0,w,h);
    p.forEach(o => { o.y -= o.v; o.a += .01; if (o.y < -5) { o.y = h + 5; o.x = Math.random()*w; }
      x.globalAlpha = .3 + .5*Math.abs(Math.sin(o.a)); x.fillStyle = '#d4af37'; x.beginPath(); x.arc(o.x % w, o.y, o.r, 0, 7); x.fill(); });
    requestAnimationFrame(loop);
  })();
})();

/* الصور */
function imgEl(src){ const i = new Image(); i.src = src; i.alt = ''; return i; }
(function initPhotos(){
  const box = $('#heroBox'), im = imgEl(CONFIG.mainPhoto);
  im.onerror = () => { box.innerHTML = '<div class="ph">ضع الصورة الرئيسية باسم<br>assets/main.jpg</div>'; };
  box.appendChild(im);
  const g = $('#gallery');
  const add = src => { const i = imgEl(src); i.onerror = () => i.remove(); i.onclick = () => openLB(src); g.appendChild(i); };
  CONFIG.photos.forEach(add);
  $('.addph').onclick = () => $('#addFile').click();
  $('#addFile').onchange = e => [...e.target.files].forEach(f => add(URL.createObjectURL(f)));
})();
function openLB(src){ const l = $('#lightbox'); $('img', l).src = src; l.classList.add('show'); }
$('#lightbox').onclick = () => $('#lightbox').classList.remove('show');

$('#welcomeText').textContent = '«' + CONFIG.welcome + '»';
$('#beginText').textContent = '«' + CONFIG.beginning + '»';
$('#letter').textContent = CONFIG.letter;

/* الانتقال بين المراحل */
const dots = $('#dots');
function go(i){
  screens[cur].classList.remove('active'); cur = i; screens[cur].classList.add('active');
  dots.innerHTML = screens.slice(1).map((_, k) => `<span class="${k+1===cur?'on':''}"></span>`).join('');
  dots.style.display = cur ? 'block' : 'none';
}
document.querySelectorAll('.next').forEach(b => b.onclick = () => go(cur + 1));

/* الموسيقى */
const bgm = $('#bgm'), mbtn = $('#musicBtn'); bgm.src = CONFIG.music; bgm.volume = .6;
function playMusic(){ bgm.play().then(() => mbtn.textContent = '♪').catch(() => mbtn.textContent = '✕'); }
mbtn.onclick = () => { if (bgm.paused) playMusic(); else { bgm.pause(); mbtn.textContent = '✕'; } };

/* كلمة المرور: الموسيقى تبدأ تلقائيًا بعد الدخول */
function login(){
  if ($('#pw').value.trim() === CONFIG.password){
    mbtn.style.display = 'block'; playMusic(); go(1);
  } else {
    $('#err').textContent = 'كلمة المرور غير صحيحة، حاول مرة أخرى';
    const i = $('#pw'); i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake'); i.value = '';
  }
}
$('#enter').onclick = login;
$('#pw').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
addEventListener('pointerdown', () => { if (mbtn.style.display === 'block' && bgm.paused && mbtn.textContent === '✕' && !bgm._manual) playMusic(); });
mbtn.addEventListener('pointerdown', e => { e.stopPropagation(); bgm._manual = true; });

/* العداد: سنوات وشهور وأيام وساعات بالتقويم الفعلي */
function addMonths(d, n){
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1, d.getHours(), d.getMinutes(), d.getSeconds());
  const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(d.getDate(), last)); return r;
}
function elapsed(start, now){
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  let t = addMonths(start, months);
  if (t > now){ months--; t = addMonths(start, months); }
  const hrs = Math.floor((now - t) / 3600000);
  return { y: Math.floor(months / 12), mo: months % 12, d: Math.floor(hrs / 24), h: hrs % 24 };
}
function boxes(el, items){
  el.innerHTML = items.map(([v, l]) => `<div class="box"><b>${v}</b><span>${l}</span></div>`).join('');
}
function tick(){
  const now = new Date(), e = elapsed(CONFIG.startDate, now);
  boxes($('#since'), [[e.y,'YEARS'],[e.mo,'MONTHS'],[e.d,'DAYS'],[e.h,'HOURS']]);

  const wrap = $('#bdays');
  if (!wrap.children.length) CONFIG.birthdays.forEach(() => wrap.appendChild(Object.assign(document.createElement('div'), {className:'bday'})));
  CONFIG.birthdays.forEach((b, i) => {
    const el = wrap.children[i], today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (now.getMonth() === b.month && now.getDate() === b.day){
      el.innerHTML = `<h3 class="cin">${b.name}</h3><div class="wish gold">🎉 كل سنة وانت طيب يا ${b.name}! Happy Birthday ✨</div>`;
      if (!el._c){ el._c = 1; burst(); }
      return;
    }
    let t = new Date(now.getFullYear(), b.month, b.day);
    if (t < today) t = new Date(now.getFullYear() + 1, b.month, b.day);
    const s = Math.max(0, Math.floor((t - now) / 1000));
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    el.innerHTML = `<h3 class="cin">${b.name}'s Birthday</h3><div class="counter"></div>`;
    boxes($('.counter', el), [[d,'DAYS'],[h,'HOURS'],[m,'MINUTES'],[sec,'SECONDS']]);
  });
}
tick(); setInterval(tick, 1000);

/* احتفال ذهبي */
function burst(){
  const c = $('#confetti'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const ps = Array.from({length: 120}, () => ({x: c.width/2, y: c.height/2, vx: (Math.random()-.5)*14, vy: (Math.random()-.9)*14, s: Math.random()*5+2, l: 140}));
  (function f(){
    x.clearRect(0,0,c.width,c.height); let alive = 0;
    ps.forEach(p => { if (p.l-- > 0){ alive++; p.x += p.vx; p.y += p.vy; p.vy += .25; x.globalAlpha = p.l/140; x.fillStyle = Math.random()>.5?'#d4af37':'#f5e199'; x.fillRect(p.x,p.y,p.s,p.s); } });
    if (alive) requestAnimationFrame(f);
  })();
}

/* الرسالة السرية */
$('#env').onclick = () => {
  $('#env').style.display = 'none'; $('#hint').style.display = 'none';
  const l = $('#letter'); l.style.display = 'block';
  requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('show')));
};
go(0);