const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../js/booking.js'),'utf8');
const submitCode = source.slice(source.indexOf('  async function postBookingRequest'),source.indexOf('  /* ---------- Return from Stripe Checkout'));
async function checkSend(mode) {
  let submit, success=0, message='', calls=0;
  const events=[];
  const button={disabled:false,textContent:'Send booking request →'};
  const context={
    form:{terms:{checked:true},addEventListener:(name,handler)=>{submit=handler;},querySelector:()=>button},
    document:{getElementById:()=>({scrollIntoView(){}})},
    current:2, checkoutInFlight:false, DEPOSIT_ENABLED:false, mobileAction:{disabled:false},
    validateStep:()=>true, setPaymentError:m=>{message=m;},
    buildBookingPayload:()=>({checkoutPayload:{},formSubmitPayload:{service:'cleaning',frequency:'fortnightly'},totalNum:135,service:'cleaning'}),
    track:name=>events.push(name), showSuccess:()=>{success++;},
    URLSearchParams, AbortController,
    setTimeout:fn=>{if(mode==='timeout') queueMicrotask(fn);return 1;},clearTimeout(){},
    fetch:async(_url,options)=>{
      calls++;
      if(mode==='network')throw new Error('Offline');
      if(mode==='timeout')return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('Timeout'))));
      return {ok:mode==='ok',status:mode==='ok'?200:500};
    },
  };
  vm.runInNewContext(submitCode,context);
  await submit({preventDefault(){}});
  assert.equal(calls,1);
  assert.equal(success,mode==='ok'?1:0,mode+' success state');
  assert.equal(events.includes('generate_lead'),mode==='ok',mode+' conversion');
  assert.equal(button.disabled,false,'button is re-enabled');
  assert.equal(context.checkoutInFlight,false);
  if(mode!=='ok')assert.match(message,/could not confirm delivery/);
}
(async()=>{
  for(const mode of ['ok','http','network','timeout'])await checkSend(mode);
  const payloadCode=source.slice(source.indexOf('  function buildBookingPayload()'),source.indexOf('  function showSuccess()'));
  const entries=[['service','cleaning'],['frequency','fortnightly'],['clean-extra','oven'],['clean-extra','fridge']];
  const context={summaryTotal:{textContent:'£175'},document:{getElementById:()=>null},location:{href:'http://localhost/book.html'},DEPOSIT_ENABLED:false,form:{querySelector:()=>({value:'cleaning'})},FormData:class{get(k){return entries.find(([key])=>key===k)?.[1];}forEach(fn){entries.forEach(([k,v])=>fn(v,k));}}};
  vm.runInNewContext(payloadCode+'\nresult=buildBookingPayload();',context);
  assert.equal(context.result.formSubmitPayload.frequency,'fortnightly');
  assert.equal(context.result.checkoutPayload.frequency,'fortnightly');
  assert.equal(context.result.formSubmitPayload['clean-extra'],'oven, fridge');
  console.log('Booking submission passed: success, HTTP failure, network failure, timeout; no false success or conversion events.');
  console.log('Booking payload passed: recurring frequency and multiple extras are retained.');
})().catch(error=>{console.error(error);process.exitCode=1;});
