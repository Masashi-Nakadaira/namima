(function(root){
const modes={easy:{name:'イージー',pool:[0,1,2]},normal:{name:'ノーマル',pool:[3,4,5]},hard:{name:'ハード',pool:[6,7,8]}};
const colors=[{name:'深海',dark:[7,20,30],mid:[26,100,107],light:[174,244,215]},{name:'残光',dark:[24,12,24],mid:[130,48,69],light:[255,195,132]},{name:'薄明',dark:[16,15,35],mid:[88,66,145],light:[221,197,255]},{name:'氷河',dark:[7,18,32],mid:[32,87,142],light:[173,222,255]},{name:'月砂',dark:[22,19,14],mid:[117,95,46],light:[250,230,152]}];
function create(mode,seed){if(!modes[mode])throw Error('Unknown difficulty');const pool=modes[mode].pool;const rounds=Array.from({length:5},(_,i)=>{const n=(seed+Math.imul(i+1,2654435761))>>>0;return {level:root.WaveModel.remix(root.WaveModel.levels[pool[(i+seed%3)%3]],n),color:colors[(i+seed%5)%5],score:null,hints:0}});return {mode,seed,rounds,index:0}}
function record(round,score){if(round.score===null)round.score=Math.min(100,Math.max(0,Math.round(score*10)/10));return round.score}
function total(s){return s.rounds.reduce((n,r)=>n+Math.round((r.score??0)*10),0)/10}
function summary(s,url){return `NAMIMA / 波間\n${modes[s.mode].name}：${total(s).toFixed(1)} / 500点\n5問・初回判定 / ヒント利用 ${s.rounds.filter(r=>r.hints>0).length}問${url?'\n'+url:''}`}
function rgb(power,color){const line=Math.pow(.5+.5*Math.cos(power*53),12),t=Math.pow(power,.7);return color.dark.map((d,i)=>Math.round(Math.min(255,d+(color.mid[i]-d)*t+color.light[i]*line*.42)))}
root.NamimaSession={modes,colors,create,record,total,summary,rgb};if(typeof module!=='undefined')module.exports=root.NamimaSession;
})(typeof window!=='undefined'?window:globalThis);
