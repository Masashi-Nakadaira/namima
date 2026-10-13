/* NM1 freezes the v5.3 model, generator and score formula. Link scores are
 * self-reported, never authenticated. This module has no network or storage. */
(function(root){
'use strict';
const S=root.NamimaSession||(typeof require==='function'?require('./session.js'):null);
const VERSION=1,modeCodes={easy:'E',normal:'N',hard:'H'};
function validate(mode,seed){
 if(!Object.hasOwn(modeCodes,mode)||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid challenge');
}
function code(mode,seed){validate(mode,seed);return `NM1-${modeCodes[mode]}-${seed.toString(16).toUpperCase().padStart(8,'0')}`}
function parseCode(value){
 if(typeof value!=='string')throw Error('Invalid challenge');
 const m=/^NM1-([ENH])-([0-9A-F]{8})$/.exec(value.trim().toUpperCase());
 if(!m)throw Error('Invalid or unsupported challenge');
 return {version:VERSION,mode:Object.keys(modeCodes).find(k=>modeCodes[k]===m[1]),seed:parseInt(m[2],16)};
}
function validResult(r){return !!r&&Array.isArray(r.scores)&&r.scores.length===5&&[0,1,2,3,4].every(i=>Number.isInteger(r.scores[i])&&r.scores[i]>=0&&r.scores[i]<=1000)&&Number.isInteger(r.hints)&&r.hints>=0&&r.hints<=5&&typeof r.replay==='boolean'}
function result(game){
 if(!S.complete(game))throw Error('Finish five rounds first');
 return {scores:game.rounds.map(r=>Math.round(r.score*10)),hints:game.rounds.filter(r=>r.scoredHints>0).length,replay:game.replay===true};
}
function total(r){if(!validResult(r))throw Error('Invalid result');return r.scores.reduce((a,b)=>a+b,0)/10}
function hash(mode,seed,r=null){
 const p=new URLSearchParams({challenge:code(mode,seed)});
 if(r!==null){if(!validResult(r))throw Error('Invalid result');p.set('scores',r.scores.join('.'));p.set('hints',String(r.hints));p.set('replay',r.replay?'1':'0')}
 return '#'+p.toString();
}
function fromURL(value){
 const u=new URL(value),raw=u.hash.slice(1),p=new URLSearchParams(raw);
 if(!p.has('challenge')){if(['scores','hints','replay'].some(k=>p.has(k)))throw Error('Missing challenge');return null}
 if(raw.length>512)throw Error('Challenge link too long');
 for(const key of ['challenge','scores','hints','replay'])if(p.getAll(key).length>1)throw Error('Duplicate challenge field');
 const parsed=parseCode(p.get('challenge'));let shared=null;
 if(['scores','hints','replay'].some(k=>p.has(k))){
  if(!/^(?:0|[1-9]\d{0,3})(?:\.(?:0|[1-9]\d{0,3})){4}$/.test(p.get('scores')||'')||! /^[0-5]$/.test(p.get('hints')||'')||! /^[01]$/.test(p.get('replay')||''))throw Error('Invalid shared result');
  shared={scores:p.get('scores').split('.').map(Number),hints:Number(p.get('hints')),replay:p.get('replay')==='1'};
  if(!validResult(shared))throw Error('Invalid shared result');
 }
 return {...parsed,shared};
}
function url(base,mode,seed,r=null){
 const u=new URL(base);if(!['http:','https:','file:'].includes(u.protocol)||u.username||u.password)throw Error('Unsupported URL');
 u.search='';u.hash=hash(mode,seed,r);return u.href;
}
function privateHost(host){
 const h=host.toLowerCase().replace(/\.$/,'');
 if(h==='localhost'||h.endsWith('.localhost')||h.endsWith('.local')||h==='home.arpa'||h.endsWith('.home.arpa')||h.endsWith('.internal')||(!h.includes('.')&&!h.includes(':')))return true;
 if(h.startsWith('[')){const ip=h.slice(1,-1);return ip==='::'||ip==='::1'||/^(?:fc|fd|fe[89a-f])/i.test(ip)||ip.startsWith('::ffff:')}
 const octets=h.split('.').map(Number);if(octets.length!==4||octets.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
 const [x,y]=octets;return x===0||x===10||x===127||(x===172&&y>=16&&y<=31)||(x===192&&y===168)||(x===169&&y===254)||(x===100&&y>=64&&y<=127);
}
function shareableURL(base,mode,seed,r=null){const u=new URL(url(base,mode,seed,r));return u.protocol==='file:'||privateHost(u.hostname)?'':u.href}
root.NamimaChallenge={VERSION,validate,code,parseCode,validResult,result,total,hash,fromURL,url,shareableURL};
if(typeof module!=='undefined')module.exports=root.NamimaChallenge;
})(typeof window!=='undefined'?window:globalThis);
