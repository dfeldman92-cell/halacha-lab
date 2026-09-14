'use strict';

const O = {
  met:{n:'Dead body',h:'מת',i:'⚰️',kind:'met'},
  person:{n:'Person',h:'אדם',i:'🧍',kind:'person'},
  metal:{n:'Metal knife',h:'כלי מתכות',i:'🔪',kind:'kli',metal:true},
  cup:{n:'Cup / utensil',h:'כלי שטף',i:'🥣',kind:'kli'},
  shirt:{n:'Shirt',h:'בגד',i:'👕',kind:'kli'},
  clay:{n:'Earthenware pot',h:'כלי חרס',i:'🏺',kind:'cheres'},
  bread:{n:'Bread',h:'אוכל',i:'🍞',kind:'food'},
  water:{n:'Water',h:'משקה',i:'💧',kind:'liquid'},
  sheretz:{n:'Dead sheretz',h:'שרץ',i:'🦎',kind:'av'},
  neveilah:{n:'Neveilah',h:'נבילה',i:'🐑',kind:'neveilah'},
  zav:{n:'Zav',h:'זב',i:'🧍',kind:'zav'},
  bed:{n:'Bed',h:'משכב',i:'🛏️',kind:'support'},
  bone:{n:'Barley-size bone',h:'עצם כשעורה',i:'🦴',kind:'bone'},
  blood:{n:'Revi’it corpse blood',h:'רביעית דם מן המת',i:'🩸',kind:'metblood'}
};

const A = {
  touch_by:{n:'is touched by',i:'✋',d:'The left node is the tumah source.'},
  touches:{n:'touches',i:'👉',d:'Direct contact; the left node remains the source.'},
  carry:{n:'is carried by',i:'📦',d:'משא — the next person carries the source.'},
  ohel:{n:'shares an ohel with',i:'⛺',d:'אהל — same covered space.'},
  air:{n:'enters airspace of',i:'🏺',d:'אויר כלי חרס.'},
  bears:{n:'bears weight on',i:'🛏️',d:'מדרס / משכב.'}
};

const TARGETS = ['person','metal','cup','shirt','clay','bread','water','bed'];
const $ = id => document.getElementById(id);
const isK = k => O[k] && O[k].kind === 'kli';
const isP = k => O[k] && O[k].kind === 'person';
const isF = k => O[k] && O[k].kind === 'food';
const isL = k => O[k] && O[k].kind === 'liquid';

let steps = [];
let addFrom = 0;
let selA = 'touch_by';
let selT = 'person';
let lesson = '';

const SCENARIOS = {
  sheretz: {s:'sheretz',x:[['touch_by','person'],['touches','bread']]},
  neveilah: {s:'neveilah',x:[['carry','person'],['touches','bread']]},
  bone: {s:'bone',x:[['ohel','person']]},
  kodesh: {s:'sheretz',x:[['touch_by','bread','kodesh'],['touches','bread','kodesh'],['touches','bread','kodesh'],['touches','bread','kodesh']]},
  zav: {s:'zav',x:[['bears','bed'],['touches','person']]},
  clay: {s:'sheretz',x:[['air','clay']]},
  corpse2: {s:'met',x:[['touch_by','person'],['touches','person']]},
  corpse3: {s:'met',x:[['touch_by','metal'],['touches','cup'],['touches','person']]},
  corpse4: {s:'met',x:[['touch_by','metal'],['touches','person'],['touches','cup'],['touches','person']]},
  akiva: {s:'met',x:[],lesson:'<b>Advanced corpse case</b><br>R. Akiva counts a tent + metal spit setup as producing an additional stage; the Chachamim respond <b>אין האהל מתחשב</b>. This is shown as a teaching dispute rather than forced into the ordinary linear-chain engine.'}
};

function intrinsic(k){
  const t = O[k]?.kind;
  if(t === 'met') return {s:'met'};
  if(t === 'av' || t === 'neveilah' || t === 'zav') return {s:t};
  if(t === 'bone' || t === 'metblood') return {s:t};
  return {s:'tahor'};
}

function yes(label,s,why,basis='דאורייתא',warn=''){ return {ok:true,label,s,why,basis,warn}; }
function no(why){ return {ok:false,label:'No transmission',s:'tahor',why,basis:''}; }
function special(label,why){ return {ok:null,label,s:'special',why,basis:'Special case'}; }
function kliWarn(k){ return isK(k) && !O[k].metal ? 'Rambam applies this to other כלי שטף/begadim too; some Rishonim restrict חרב הרי הוא כחלל to metal.' : ''; }

function tx(st,sk,a,tk,fc='chullin'){
  const s = st.s;
  const t = O[tk]?.kind;
  const touch = a === 'touch_by' || a === 'touches';

  if(!$('shiur').checked && ['met','av','neveilah','bone','metblood'].includes(s)) return no('Required source shiur is not being assumed.');
  if(isF(tk) && !$('hechsher').checked) return no('Food is not being assumed מוכשר לקבל טומאה.');
  if(isK(tk) && !$('genericKli').checked && !O[tk].metal) return special('Check vessel status','Material/completion must be resolved first.');

  if(s === 'met' || s === 'metblood'){
    if(t === 'cheres' && touch) return no('כלי חרס does not receive tumah by ordinary external touch.');
    if(t === 'cheres' && a === 'ohel') return special('כלי חרס in אהל המת','Sealing/צמיד פתיל and the exact setup matter.');
    if((touch || a === 'ohel') && isP(tk)) return yes('טומאת שבעה','met7p','A person touching or sharing an ohel with a corpse-source becomes טמא מת.');
    if((touch || a === 'ohel') && isK(tk)) return yes('טומאת שבעה — כלי כחלל','met7kDirect','A susceptible kli directly contaminated by the corpse-source enters the special tumat-met kli chain.','דאורייתא',kliWarn(tk));
    if(touch && isF(tk)) return yes('ראשון לטומאה','r1f','Direct contact with the corpse-source makes susceptible food ראשון.');
    if(touch && isL(tk)) return yes('ראשון לטומאה','r1l','Direct contact with the corpse-source makes liquid ראשון.');
  }

  if(s === 'bone'){
    if(a === 'ohel') return no('עצם כשעורה transmits by מגע and משא, not by אהל.');
    if((touch || a === 'carry') && isP(tk)) return yes('טומאת שבעה','met7p','עצם כשעורה gives seven-day corpse tumah by מגע/משא.');
    if(touch && isK(tk)) return yes('טומאת שבעה — כלי','met7kDirect','Direct contact places the kli into the tumat-met kli chain.','דאורייתא',kliWarn(tk));
  }

  if(s === 'met7kDirect' && touch){
    if(isP(tk)) return yes('טומאת שבעה','met7p','A person touching a kli directly contaminated by the corpse remains טמא שבעה.');
    if(isK(tk)) return yes('טומאת שבעה','met7k2','A second susceptible kli touching the corpse-contaminated kli is also טמא שבעה.','דאורייתא',kliWarn(sk));
    if(isF(tk)) return yes('ראשון לטומאה','r1f','This av-level source makes food ראשון.');
  }

  if(s === 'met7p' && touch){
    if(isP(tk)) return yes('טומאת ערב','metErev','A person touching a טמא מת person becomes tamei only until evening.');
    if(isK(tk)) return yes('טומאת שבעה','met7kFromP','A susceptible kli touching a person who is טמא שבעה becomes טמא שבעה.','דאורייתא',kliWarn(tk));
    if(isF(tk)) return yes('ראשון לטומאה','r1f','An אב הטומאה makes food ראשון.');
    if(isL(tk)) return yes('ראשון לטומאה','r1l','An אב הטומאה makes liquid ראשון.');
  }

  if((s === 'met7k2' || s === 'met7kFromP') && touch){
    if(isP(tk) || isK(tk)) return yes('טומאת ערב','metErev','This is the final ordinary אדם/כלי link in this chain; it drops to טומאת ערב.');
    if(isF(tk)) return yes('ראשון לטומאה','r1f','This av-level object makes food ראשון.');
  }

  if(s === 'metErev' && touch){
    if(isF(tk)) return yes('שני לטומאה','r2f','A ראשון makes susceptible food שני.','מדרבנן according to Rambam');
    if(isL(tk)) return yes('שני לטומאה','r2l','A ראשון makes liquid שני.','מדרבנן according to Rambam');
    if(isP(tk) || isK(tk)) return no('A ראשון does not ordinarily make אדם or כלים tamei by simple contact.');
  }

  if(s === 'av' && touch){
    if(isP(tk) || isK(tk)) return yes('ראשון לטומאה','r1','An אב transmits by מגע to אדם/כלים.');
    if(isF(tk)) return yes('ראשון לטומאה','r1f','An אב makes food ראשון.');
    if(isL(tk)) return yes('ראשון לטומאה','r1l','An אב makes liquid ראשון.');
  }

  if(s === 'neveilah'){
    if((touch || a === 'carry') && isP(tk)) return yes('ראשון לטומאה','r1','נבילה contaminates a person by מגע and משא.');
    if(touch && isK(tk)) return yes('ראשון לטומאה','r1','נבילה contaminates susceptible keilim by מגע.');
  }

  if(s === 'zav'){
    if((touch || a === 'carry') && isP(tk)) return yes('ראשון לטומאה','r1','A zav transmits to a person by מגע and משא.');
    if(a === 'bears' && t === 'support') return yes('מדרס — אב הטומאה','midras','A qualifying support bearing the zav becomes מדרס.');
    if(touch && isK(tk)) return yes('ראשון לטומאה','r1','A zav contaminates susceptible keilim by contact.');
  }

  if(s === 'midras' && touch && isP(tk)) return yes('ראשון לטומאה','r1','A מדרס is an אב and contaminates a person by contact.');

  if(['r1','r1f','r1l'].includes(s) && touch){
    if(isF(tk)) return yes('שני לטומאה','r2f','A ראשון makes susceptible food שני.','מדרבנן according to Rambam');
    if(isL(tk)) return yes('שני לטומאה','r2l','A ראשון makes liquid שני.','מדרבנן according to Rambam');
    if(isP(tk) || isK(tk)) return no('A ראשון does not ordinarily make אדם or כלים tamei.');
  }

  if(['r2f','r2l'].includes(s) && touch && isF(tk)){
    if(fc === 'chullin') return no('אין שני עושה שלישי בחולין.');
    return yes('שלישי לטומאה','r3f',`A שני can make ${fc === 'terumah' ? 'תרומה' : 'קודש'} into a שלישי.`,'Rabbinic food ladder');
  }

  if(s === 'r3f' && touch && isF(tk)){
    if(fc === 'kodesh') return yes('רביעי בקודש','r4f','A שלישי can make קודש into a רביעי.','Rabbinic food ladder');
    return no('שלישי does not continue this chain here.');
  }

  if(s === 'r4f') return no('רביעי בקודש is the stopping point; it does not make a חמישי.');
  if(s === 'r1l' && touch && isK(tk)) return yes('שני מדרבנן','rabK','Tamei liquids can contaminate a kli by rabbinic decree.','מדרבנן');
  if(a === 'air' && t === 'cheres' && ['av','neveilah','zav'].includes(s)) return yes('ראשון לטומאה','r1','A qualifying source in the inner airspace contaminates כלי חרס.');

  return no('No ordinary transmission rule in this simulator for that combination.');
}

function stat(st){
  return ({
    met:['אבי אבות הטומאה','Corpse-source'],
    met7p:['טמא מת — אב הטומאה','טומאת שבעה'],
    met7kDirect:['כלי כחלל','טומאת שבעה'],
    met7k2:['אב הטומאה','טומאת שבעה'],
    met7kFromP:['אב הטומאה','טומאת שבעה'],
    metErev:['ראשון לטומאה','טומאת ערב'],
    av:['אב הטומאה','Source'],neveilah:['אב הטומאה','Source'],zav:['אב הטומאה','Source'],
    bone:['טומאת מת source','מגע/משא'],metblood:['טומאת מת source','Corpse-remains'],
    r1:['ראשון לטומאה',''],r1f:['ראשון לטומאה',''],r1l:['ראשון לטומאה',''],
    r2f:['שני לטומאה',''],r2l:['שני לטומאה',''],r3f:['שלישי לטומאה',''],r4f:['רביעי בקודש','פסול ואינו עושה חמישי'],
    midras:['מדרס — אב הטומאה',''],rabK:['שני מדרבנן',''],tahor:['טהור',''],special:['Special','']
  })[st.s] || [st.s,''];
}

function compute(){
  let k = $('start').value;
  let s = intrinsic(k);
  const out = [{key:k,state:s,res:null,act:null,fc:null}];
  for(const z of steps){
    const r = tx(s,k,z.act,z.key,z.fc || 'chullin');
    s = r.ok === true ? {s:r.s} : intrinsic(z.key);
    k = z.key;
    out.push({key:k,state:s,res:r,act:z.act,fc:z.fc || null});
  }
  return out;
}

function nodeHTML(x,i){
  const d = stat(x.state);
  const food = x.fc ? ` · ${x.fc === 'chullin' ? 'חולין' : x.fc === 'terumah' ? 'תרומה' : 'קודש'}` : '';
  const warn = x.res?.warn ? '<span class="chip warn">⚖️ Machlokes</span>' : '';
  return `<div class="node">
    <div class="nodeTop"><div class="emoji">${O[x.key].i}</div><div><div class="nodeName">${O[x.key].n}</div><div class="he">${O[x.key].h}${food}</div></div></div>
    <div class="status"><strong>${d[0]}</strong>${d[1] ? `<div>${d[1]}</div>` : ''}${x.res ? `<div style="margin-top:4px">${x.res.why}</div>` : ''}<div class="chips">${x.res?.basis ? `<span class="chip">${x.res.basis}</span>` : ''}${warn}</div>${x.res?.warn ? `<div class="tiny">${x.res.warn}</div>` : ''}</div>
    <div class="nodeActions"><button type="button" data-add-index="${i}">＋ Add next</button>${i ? `<button type="button" data-cut-index="${i}">↶ From here</button>` : ''}</div>
  </div>`;
}

function render(){
  const arr = compute();
  let html = '';
  arr.forEach((x,i)=>{
    if(i){
      const r = x.res;
      html += `<div class="arrow"><div>${A[x.act].i} ${A[x.act].n}</div><strong>→</strong><div>${r.ok === true ? '✓' : r.ok === false ? '✕' : '⚠️'}</div></div>`;
    }
    html += nodeHTML(x,i);
  });
  $('chain').innerHTML = html;

  $('chain').querySelectorAll('[data-add-index]').forEach(btn=>btn.addEventListener('click',()=>openAdd(Number(btn.dataset.addIndex))));
  $('chain').querySelectorAll('[data-cut-index]').forEach(btn=>btn.addEventListener('click',()=>cut(Number(btn.dataset.cutIndex))));

  const last = arr[arr.length-1];
  const r = last.res;
  $('summary').className = 'summary ' + (!r ? '' : r.ok === true ? 'ok' : r.ok === false ? 'stop' : 'warn');
  $('summary').innerHTML = !r
    ? `Start with <b>${O[last.key].n}</b>, then tap <b>Add next</b>.`
    : `<b>${r.label}</b><br>${r.why}${r.warn ? `<br><span class="tiny">⚖️ ${r.warn}</span>` : ''}`;

  $('floatAdd').onclick = () => openAdd(arr.length - 1);
  $('assumptions').textContent = `Defaults: ${$('shiur').checked ? 'shiur assumed' : 'shiur not assumed'} · ${$('hechsher').checked ? 'food מוכשר' : 'food not assumed מוכשר'} · ${$('genericKli').checked ? 'generic kli susceptible' : 'generic kli unresolved'}.`;
  $('lesson').innerHTML = lesson ? `<div class="lesson">${lesson}</div>` : '';
}

function acts(st){
  const x = ['touch_by','touches'];
  if(['met','metblood','bone','neveilah','zav'].includes(st.s)) x.push('carry');
  if(['met','metblood'].includes(st.s)) x.push('ohel');
  if(st.s === 'zav') x.push('bears');
  if(['av','neveilah','zav'].includes(st.s)) x.push('air');
  return [...new Set(x)];
}

function drawChoices(aa){
  $('acts').innerHTML = aa.map(k=>`<button type="button" class="choice ${selA === k ? 'active' : ''}" data-action="${k}"><b>${A[k].i} ${A[k].n}</b><span>${A[k].d}</span></button>`).join('');
  $('targets').innerHTML = TARGETS.map(k=>`<button type="button" class="choice ${selT === k ? 'active' : ''}" data-target="${k}"><b>${O[k].i} ${O[k].n}</b><span>${O[k].h}</span></button>`).join('');
  $('foodWrap').classList.toggle('hide',!isF(selT));

  $('acts').querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{ selA = btn.dataset.action; drawChoices(aa); }));
  $('targets').querySelectorAll('[data-target]').forEach(btn=>btn.addEventListener('click',()=>{ selT = btn.dataset.target; drawChoices(aa); }));
}

function openAdd(i){
  addFrom = i;
  const x = compute()[i];
  const aa = acts(x.state);
  if(!aa.includes(selA)) selA = aa[0];
  $('from').textContent = `After ${O[x.key].i} ${O[x.key].n} — ${stat(x.state)[0]}`;
  drawChoices(aa);
  $('addBack').style.display = 'flex';
}

function cut(i){
  steps = steps.slice(0,i);
  lesson = '';
  render();
}

function loadScenario(def){
  lesson = def.lesson || '';
  $('start').value = def.s;
  steps = (def.x || []).map(z=>({act:z[0],key:z[1],fc:z[2] || null}));
  render();
  setTimeout(()=>$('chain').parentElement.scrollTo({left:9999,behavior:'smooth'}),50);
}

function init(){
  document.querySelectorAll('[data-scenario]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const def = SCENARIOS[btn.dataset.scenario];
      if(def) loadScenario(def);
    });
  });

  $('saveAdd').addEventListener('click',()=>{
    steps = steps.slice(0,addFrom);
    steps.push({act:selA,key:selT,fc:isF(selT) ? $('foodClass').value : null});
    lesson = '';
    $('addBack').style.display = 'none';
    render();
  });
  $('cancelAdd').addEventListener('click',()=>{$('addBack').style.display='none';});
  $('addBack').addEventListener('click',e=>{ if(e.target === $('addBack')) $('addBack').style.display='none'; });
  $('settingsBtn').addEventListener('click',()=>{$('settingsBack').style.display='flex';});
  $('closeSettings').addEventListener('click',()=>{$('settingsBack').style.display='none'; render();});
  $('settingsBack').addEventListener('click',e=>{ if(e.target === $('settingsBack')) { $('settingsBack').style.display='none'; render(); } });
  $('undo').addEventListener('click',()=>{steps.pop(); lesson=''; render();});
  $('reset').addEventListener('click',()=>{steps=[]; lesson=''; render();});
  $('start').addEventListener('change',()=>{steps=[]; lesson=''; render();});
  ['shiur','hechsher','genericKli'].forEach(id=>$(id).addEventListener('change',render));

  render();

  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(r=>r.update()).catch(()=>{}));
  }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
else init();
