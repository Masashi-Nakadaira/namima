const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{JSDOM}=require('jsdom'),root=path.resolve(__dirname,'../docs');
function boot(url='https://example.test/namima/?private=x',languages=['en-US'],preference=null,navigationState=null){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLCanvasElement.prototype.getContext=()=>null;w.HTMLElement.prototype.getBoundingClientRect=()=>({width:180,height:150});w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};w.ResizeObserver=class{observe(){}};w.requestAnimationFrame=()=>1;w.matchMedia=()=>({matches:true});w.confirm=()=>true;w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};Object.defineProperty(w.navigator,'languages',{value:languages,configurable:true});Object.defineProperty(w.navigator,'language',{value:languages[0],configurable:true});
 if(w.location.protocol!=='file:'){w.localStorage.setItem('namima-progress-v1','[0,2]');if(preference)w.localStorage.setItem('namima-language-v1',preference)}
 if(navigationState!==null)w.history.replaceState(navigationState,'');
 for(const f of ['model','session','i18n','challenge','challenge-i18n','app'])vm.runInContext(fs.readFileSync(path.join(root,f+'.js'),'utf8'),dom.getInternalVMContext());return w;
}
const el=(w,id)=>w.document.getElementById(id),click=(w,id)=>el(w,id).click(),json=(w,text)=>JSON.parse(w.eval(`JSON.stringify(${text})`));
function change(w,i,v){const e=el(w,'knob'+i);e.value=v;e.dispatchEvent(new w.Event('input'));e.dispatchEvent(new w.Event('change'))}
function solve(w){w.eval('round()').level.controls.forEach((c,i)=>change(w,i,w.WaveModel.get(w.eval('round()').level.target,c.key)))}
function finish(w,perfect=false){for(let i=0;i<5;i++){if(perfect)solve(w);click(w,'primary');click(w,'primary')}}
function language(w,value){el(w,'languageSelect').value=value;el(w,'languageSelect').dispatchEvent(new w.Event('change'))}
function setHash(w,hash){w.history.replaceState(null,'',w.location.pathname+hash);w.dispatchEvent(new w.Event('hashchange'))}
function submitCode(w,value){el(w,'challengeInput').value=value;el(w,'joinChallenge').dispatchEvent(new w.Event('submit',{cancelable:true}))}
module.exports={boot,el,click,json,change,solve,finish,language,setHash,submitCode};
