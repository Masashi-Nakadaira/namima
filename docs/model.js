/* Pure, shared inverse-wave model. No network or storage. */
(function(root){
const TAU=2*Math.PI;
function intensity(x,y,src,lambda){let re=0,im=0;for(const s of src){let q=TAU*Math.hypot((x-s.x)*1.2,y-s.y)/lambda+s.p*Math.PI/180;re+=(s.a??1)*Math.cos(q);im+=(s.a??1)*Math.sin(q)}return (re*re+im*im)/(src.length**2)}
const base=[{x:.3,y:.5,p:0,a:1},{x:.7,y:.5,p:0,a:1},{x:.5,y:.23,p:0,a:.8}];
const knob=(key,label,min,max,step)=>({key,label,min,max,step});
const W=knob('lambda','波長 λ',.18,.44,.005),P=knob('1.p','B 位相',0,360,2),A=knob('1.a','B 振幅',.2,1,.02),X=knob('1.x','B 横の位置',.52,.84,.01),Y=knob('1.y','B 縦の位置',.2,.8,.01),C=knob('2.p','C 位相',0,360,2);
function state(n,lambda,values){const s={lambda,src:base.slice(0,n).map(x=>({...x}))};for(const [key,value] of Object.entries(values))put(s,key,value);return s}
function put(s,key,value){if(key==='lambda')s.lambda=value;else{const [i,k]=key.split('.');s.src[i][k]=value}}
function get(s,key){if(key==='lambda')return s.lambda;const [i,k]=key.split('.');return s.src[i][k]}
const CA=knob('2.a','C 振幅',.2,1,.02);
const specs=[
 ['波の色を合わせる','間隔と濃さの違いを読む。波長と振幅を動かして、見本の模様を再現しよう。',[W,A],2,.28,{'1.a':.9},.355,{'1.a':.54},'帯の間隔は波長、全体の明暗の幅は振幅。まず帯の本数を合わせよう。'],
 ['ずれた縞の地図','波長を変えると縞の幅が、位相を変えると縞の位置が変わる。両方を合わせよう。',[W,P],2,.28,{'1.p':20},.225,{'1.p':138},'波長で大まかな間隔を合わせてから、位相で縞を滑らせよう。'],
 ['淡い波を重ねる','位相と振幅の組み合わせで、同じ場所の明るさだけでなく、模様全体を合わせよう。',[P,A],2,.30,{'1.p':10,'1.a':1},.30,{'1.p':246,'1.a':.42},'どこを暗くするかは位相。どれだけ暗くできるかは振幅にも左右されます。'],
 ['波源を探す','隠れたBの位置を、曲がる縞から逆算する。横・縦の位置と位相を探ろう。',[X,Y,P],2,.32,{'1.x':.7,'1.y':.5,'1.p':20},.32,{'1.x':.58,'1.y':.32,'1.p':92},'波源の位置は縞の曲がり方を変えます。先に横・縦で形を近づけ、最後に位相を。'],
 ['四つのつまみ','波長・振幅・位置・位相。ひとつの場所が合っても、別の場所はまだ違う。',[W,A,X,P],2,.28,{'1.a':1,'1.x':.7,'1.p':20},.385,{'1.a':.66,'1.x':.8,'1.p':204},'まず波長と横位置で形をつくり、位相、振幅の順に見直そう。'],
 ['三声の復元','3つの波から生まれた風景。BとCの位相を別々に調律し、波長とBの振幅も合わせよう。',[W,P,C,A],3,.30,{'1.p':20,'2.p':40,'1.a':1},.265,{'1.p':114,'2.p':278,'1.a':.62},'BとCの変化を一度に追わず、ひとつずつ。波長を合わせたら、3本の断面を見比べよう。'],
 ['遠い波の座標','波長・振幅・位相に、Bの縦横位置が加わる難問。縞の曲率と間隔を手がかりに再現しよう。',[W,P,A,X,Y],2,.28,{'1.p':20,'1.a':1},.335,{'1.p':164,'1.a':.58,'1.x':.78,'1.y':.27},'先に縦横の位置で縞の向きを、波長で間隔を合わせる。振幅と位相はその後に。'],
 ['六つの手がかり','3波の位相と強さは互いに影響する。Bの縦位置も見つけて、複雑な明暗を復元しよう。',[W,P,C,A,CA,Y],3,.30,{'1.p':20,'2.p':40,'1.a':1,'2.a':.8},.215,{'1.p':232,'2.p':76,'1.a':.72,'2.a':.46,'1.y':.68},'まず波長とBの縦位置で大きな形を。BとCを片方ずつ調整し、振幅で明暗の幅を整えよう。'],
 ['見えない設計図','7つのつまみで3波の風景を復元する最終難問。細部の縞まで見比べながら、答えを探そう。',[W,P,C,A,CA,X,Y],3,.30,{'1.p':20,'2.p':40,'1.a':1,'2.a':.8},.365,{'1.p':286,'2.p':148,'1.a':.48,'2.a':.7,'1.x':.6,'1.y':.72},'位置と波長で骨格をつくり、2つの位相、2つの振幅を交互に見直す。迷ったら戻すボタンで比較を。']
];
const levels=specs.map((q,i)=>({id:i,title:q[0],desc:q[1],controls:q[2],initial:state(q[3],q[4],q[5]),target:state(q[3],q[6],q[7]),hint:q[8]}));
const samples=[];for(let y=0;y<13;y++)for(let x=0;x<17;x++)samples.push([.04+x*.92/16,.04+y*.92/12]);for(const y of [.28,.5,.72])for(let x=0;x<65;x++)samples.push([.04+x*.92/64,y]);
function evaluate(current,target){let sum=0,max=0;for(const [x,y] of samples){const d=Math.abs(intensity(x,y,current.src,current.lambda)-intensity(x,y,target.src,target.lambda));sum+=d*d;max=Math.max(max,d)}const rmse=Math.sqrt(sum/samples.length);return {rmse,max,score:Math.max(0,Math.floor((1-(rmse<1e-12?0:rmse))*1000)/10),won:rmse<=.035&&max<=.12}}
function remix(level,seed){const target=JSON.parse(JSON.stringify(level.target));let n=seed>>>0;for(const c of level.controls){n=(Math.imul(n,1664525)+1013904223)>>>0;const steps=Math.round((c.max-c.min)/c.step);put(target,c.key,+(c.min+(n%(steps+1))*c.step).toFixed(4))}if(evaluate(level.initial,target).won){const c=level.controls[0];put(target,c.key,get(target,c.key)>(c.min+c.max)/2?c.min:c.max)}return {...level,target}}
root.WaveModel={intensity,levels,evaluate,get,put,remix,samples};if(typeof module!=='undefined')module.exports=root.WaveModel;
})(typeof window!=='undefined'?window:globalThis);
