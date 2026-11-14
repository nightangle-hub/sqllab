const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.join(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),curriculum=JSON.parse(fs.readFileSync(path.join(root,'curriculum.json'),'utf8'));
assert.deepEqual(JSON.parse(html.match(/<script id="curriculum" type="application\/json">([\s\S]*?)<\/script>/)[1]),curriculum,'Run npm run build after editing curriculum');
assert.equal(curriculum.exercises.length,48);assert.equal(new Set(curriculum.path).size,60);
const report={matrix:[],mutants:[],ui:[],layout:[],errors:[],externalRequests:[]};
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html)});
async function ready(page){await page.waitForFunction(()=>typeof ready!=='undefined'&&ready&&!busy);}
async function answer(page,sql){await page.locator('#query').fill(sql);await page.locator('#run').click();await ready(page);return page.locator('#status').innerText();}
async function select(page,id){await page.evaluate(id=>chooseCase(id),id);}
function geometry(){const h=document.querySelector('header'),r=h.getBoundingClientRect(),s=getComputedStyle(h);return {height:r.height,top:r.top,bottom:r.bottom,paddingTop:parseFloat(s.paddingTop),background:s.backgroundColor,blur:s.backdropFilter,mainTop:document.querySelector('main').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth,brandRight:h.querySelector('strong').getBoundingClientRect().right,trailLeft:h.querySelector('ol').getBoundingClientRect().left};}
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:720},isMobile:true,hasTouch:true});const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(engine.name()+': '+e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('file:'))report.externalRequests.push(r.url())});
 await page.goto(base);await ready(page);assert.equal(await page.evaluate(()=>state.index),12,'fresh users start at SELECT');
 const contracts=await page.evaluate(()=>[0,1,2,3].map(v=>exercises(v).slice(0,12).map(e=>[e[4],e[5],e[6],e[8]])));
 const hashes=contracts.map(c=>crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex'));
 assert.deepEqual(hashes,JSON.parse(fs.readFileSync(path.join(__dirname,'original-regression.json'),'utf8')).contracts,'Original 12 SQL, columns, ordering and starters must remain unchanged');
 assert.equal(await page.evaluate(()=>exercises(0).length),60);
 // Exercise the actual bundled engine without rebuilding 1.4 MB workers for each fixture.
 await page.evaluate(async()=>{const api=new Function(document.getElementById('sqlite-source').textContent+'\n'+document.getElementById('engine').textContent+'\nreturn {boot:initSqlJs,seed,execute};')();window.testEngine={...api,SQL:await api.boot()};});
 const killed=new Set();
 for(let variant=0;variant<4;variant++){
  const results=await page.evaluate(({variant,metadata})=>{
   const {SQL,seed,execute}=testEngine;const failures=[],kills=[],checks=[],frozen=new Map(),hardcodeRejected=new Set();
   for(let fixture=0;fixture<7;fixture++){
    const db=new SQL.Database();try{seed(db,variant,fixture);
     const data=Object.fromEntries(['accounts','transactions','logs'].map(t=>{const r=execute(db,'SELECT * FROM '+t);return [t,r.values.map(row=>Object.fromEntries(r.columns.map((c,i)=>[c,row[i]])))];}));
     const assert=(ok,detail)=>{if(!ok)failures.push({variant,fixture,detail});};
     for(let id=0;id<60;id++){
      const e=exercises(variant)[id],expected=execute(db,e[4]);
      assert(expected.columns.join(',')===e[5].join(','),'columns '+id);
      assert(grade(expected,expected,e[6])===null,'canonical '+id);
      if(fixture===0)frozen.set(id,expected);else if(grade(frozen.get(id),expected,e[6]))hardcodeRejected.add(id);
      assert(grade({columns:expected.columns.map((c,i)=>i?'':c+'wrong'),values:expected.values},expected,e[6])!==null,'wrong columns '+id);
      if(expected.values.length){assert(grade({columns:expected.columns,values:expected.values.slice(1)},expected,e[6])!==null,'missing row '+id);assert(grade({columns:expected.columns,values:[...expected.values,expected.values[0]]},expected,e[6])!==null,'duplicate row '+id);}
      if(e[6]&&expected.values.length>1)assert(grade({columns:expected.columns,values:expected.values.slice().reverse()},expected,true)!==null,'order '+id);
      const m=metadata.find(m=>m.id===id);if(m){let bad;try{bad=grade(execute(db,m.wrong),expected,e[6]);}catch(err){bad=err.message;}if(bad)kills.push({id,variant,fixture});const starter=execute(db,m.starter);assert(starter.columns.length>0,'starter '+id);}
      checks.push({id,variant,fixture,rows:expected.values.length,...(id<12&&fixture<3?{originalResult:expected}:{})});
     }
     // Independent row-level oracles for boundaries, NULL, counts, zero-preserving joins and tied maxima.
     const result=id=>execute(db,exercises(variant)[id][4]).values;
     const tx=data.transactions,logs=data.logs,accounts=data.accounts;
     assert(JSON.stringify(result(15))===JSON.stringify(tx.filter(t=>t.amount>=1000).sort((a,b)=>a.txn_id-b.txn_id).map(t=>[t.txn_id,t.amount])),'inclusive threshold oracle');
     assert(JSON.stringify(result(17))===JSON.stringify(tx.filter(t=>t.amount>=500&&t.amount<=1000).sort((a,b)=>a.amount-b.amount||a.txn_id-b.txn_id).map(t=>[t.txn_id,t.amount])),'interval oracle');
     assert(JSON.stringify(result(18))===JSON.stringify(tx.filter(t=>t.txn_date>='2026-10-05'&&t.txn_date<'2026-10-10').sort((a,b)=>a.txn_date.localeCompare(b.txn_date)||a.txn_id-b.txn_id).map(t=>[t.txn_id,t.txn_date])),'half-open dates oracle');
     assert(result(26)[0][0]===tx.length,'row count oracle');
     assert(result(27)[0][1]===logs.filter(l=>l.resolved_at!==null).length,'nullable count oracle');
     assert(JSON.stringify(result(34))===JSON.stringify(accounts.map(a=>[a.account_id,tx.filter(t=>t.account_id===a.account_id).length])),'zero activity oracle');
     const peaks=tx.filter(t=>t.status==='posted'&&t.direction==='debit').map(t=>({...t,region:accounts.find(a=>a.account_id===t.account_id).region}));
     const max=Object.fromEntries([...new Set(peaks.map(t=>t.region))].map(r=>[r,Math.max(...peaks.filter(t=>t.region===r).map(t=>t.amount))]));
     assert(JSON.stringify(result(59))===JSON.stringify(peaks.filter(t=>t.amount===max[t.region]).sort((a,b)=>a.region.localeCompare(b.region)||a.txn_id-b.txn_id).map(t=>[t.region,t.txn_id,t.amount])),'all tied regional peaks oracle');
     for(const sql of ['DELETE FROM transactions;','SELECT 1; SELECT 2;','PRAGMA query_only=OFF;']){let rejected=false;try{execute(db,sql)}catch(e){rejected=true}assert(rejected,'reject unsafe/multiple statement '+sql);}
    }finally{db.close();}
   }
   if(hardcodeRejected.size!==60)failures.push({variant,detail:'Literal result hardcodes survived hidden fixtures',ids:Array.from({length:60},(_,i)=>i).filter(id=>!hardcodeRejected.has(id))});
   return {failures,kills,checks};
  },{variant,metadata:curriculum.exercises});
  assert.deepEqual(results.failures,[]);
  const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'original-regression.json'),'utf8'));
  for(const check of results.checks){if(check.originalResult){const original=baseline.checks.find(b=>b.id===check.id&&b.variant===variant&&b.fixture===check.fixture);assert.equal(crypto.createHash('sha256').update(JSON.stringify(check.originalResult)).digest('hex'),original.sha256,'original result regression '+JSON.stringify(original));delete check.originalResult;}}
  report.matrix.push(...results.checks.map(r=>({engine:engine.name(),...r})));report.mutants.push(...results.kills.map(r=>({engine:engine.name(),...r})));results.kills.forEach(k=>killed.add(k.id));
 }
 assert.equal(killed.size,48,'Every new exercise must reject its pedagogical wrong answer on at least one dataset');
 // Full user path through worker execution and grading, with network disabled.
 await context.setOffline(true);
 for(const id of curriculum.path){await select(page,id);assert.equal(await page.locator('#solution').isDisabled(),true);const sql=await page.evaluate(()=>current()[4]);assert.match(await answer(page,sql),/Correct/,'worker exercise '+id);report.ui.push({engine:engine.name(),id,check:'canonical worker grading offline (practice + five hidden fixtures)'});}
 await select(page,37);assert.doesNotMatch(await answer(page,curriculum.exercises.find(e=>e.id===37).wrong),/Correct/,'log fanout caught by hidden fixture');report.ui.push({engine:engine.name(),check:'hidden-only fanout error rejected'});
 await select(page,12);assert.match(await answer(page,'WITH RECURSIVE forever(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM forever) SELECT SUM(n) AS total FROM forever;'),/5 seconds/,'runaway query cancelled');assert.match(await answer(page,await page.evaluate(()=>current()[4])),/Correct/,'worker recovers after timeout');report.ui.push({engine:engine.name(),check:'five-second timeout and successful recovery'});
 await select(page,12);assert.equal(await page.locator('#solution').isDisabled(),true);await answer(page,'SELECT account_id,region AS customer_name FROM accounts ORDER BY account_id;');
 await page.locator('#coachPanel summary').click();assert.equal(await page.locator('#solution').isDisabled(),true);await page.locator('#hint').click();assert.equal(await page.locator('#solution').isDisabled(),true);await page.locator('#hint').click();assert.equal(await page.locator('#solution').isDisabled(),false);await page.locator('#solution').click();assert.match(await page.locator('#coachContent').innerText(),/Worked solution/);assert.equal(await page.evaluate(()=>state.assisted[draftKey()]),true);report.ui.push({engine:engine.name(),check:'attempt/two-hint gate and assisted marker'});
 const before=await page.evaluate(()=>JSON.stringify(state.done));await page.evaluate(()=>{expandedData=true;drawData()});await page.locator('#inspectQuery').fill('SELECT COUNT(*) AS n FROM transactions;');await page.locator('#inspect').click();await ready(page);assert.equal(await page.evaluate(()=>JSON.stringify(state.done)),before,'inspection never grades');
 await page.locator('#query').fill('SELECT account_id FROM accounts; -- persisted');await context.setOffline(false);await page.reload();await ready(page);assert.match(await page.locator('#query').inputValue(),/persisted/);assert.equal(await page.evaluate(()=>Object.keys(state.done).length),60);assert.equal(await page.evaluate(()=>state.assisted['0:12']),true);
 // Dataset drafts are isolated, and old saved indexes still refer to the same exercises.
 await page.evaluate(()=>{state.variant=1;render()});await page.locator('#query').fill('SELECT 1; -- dataset one');await page.evaluate(()=>{state.variant=0;render()});assert.match(await page.locator('#query').inputValue(),/persisted/);
 const legacyContext=await browser.newContext(),legacyPage=await legacyContext.newPage();await legacyPage.addInitScript(()=>{localStorage.setItem('sql-lab-guided-final-v1',JSON.stringify({index:9,variant:0,done:{0:true,9:true},drafts:{'0:9':'SELECT 9; -- legacy'},assisted:{'0:9':true}}))});await legacyPage.goto(base);await ready(legacyPage);assert.equal(await legacyPage.evaluate(()=>state.index),9);assert.match(await legacyPage.locator('#query').inputValue(),/legacy/);assert.match(await legacyPage.locator('#progressText').innerText(),/2 \/ 60/);await legacyContext.close();report.ui.push({engine:engine.name(),check:'reload, draft separation, old 12 progress migration and assisted persistence'});
 // Navigation follows teaching order, not stable storage IDs.
 await select(page,14);assert.match(await answer(page,await page.evaluate(()=>current()[4])),/Correct/);await page.locator('#next').click();assert.equal(await page.evaluate(()=>state.index),0);await page.evaluate(()=>document.getElementById('options').open=true);await page.locator('#prev').click();assert.equal(await page.evaluate(()=>state.index),14);
 for(const width of [320,375,390,430,844,1280]){await page.setViewportSize({width,height:width===844?390:720});for(const id of [12,36,59]){await select(page,id);const g=await page.evaluate(geometry);assert.equal(g.overflow,false);assert.equal(g.background,'rgb(40, 28, 49)');assert.equal(g.height,56);assert.equal(g.blur,'none');assert.ok(g.mainTop>=g.bottom);assert.ok(g.brandRight<g.trailLeft);report.layout.push({engine:engine.name(),width,id,...g});}}
 await page.setViewportSize({width:390,height:720});await select(page,12);await page.waitForFunction(()=>document.querySelector('#sampleData table'));await page.screenshot({path:path.join(out,engine.name()+'-beginner.png'),fullPage:true});await select(page,59);await page.screenshot({path:path.join(out,engine.name()+'-advanced.png'),fullPage:true});
 const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];for(const [name,width,top,left,right] of [['portrait-safe-area',390,59,0,0],['landscape-safe-area',844,0,59,59]]){await page.setViewportSize({width,height:720});const style=await page.addStyleTag({content:css.replace(/env\(safe-area-inset-(top|left|right|bottom)(?:,0px)?\)/g,(_,e)=>({top,left,right,bottom:34}[e]+'px'))});const g=await page.evaluate(geometry);assert.equal(g.height,56+top);assert.equal(g.paddingTop,16+top);assert.equal(g.overflow,false);assert.ok(g.mainTop>=g.bottom);report.layout.push({engine:engine.name(),name,method:'CSS inset substitution; not physical iPhone',...g});await style.evaluate(e=>e.remove());}
 if(engine===chromium){const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'display-mode',value:'standalone'}]});report.layout.push({engine:engine.name(),check:'standalone media emulation availability',supported:await page.evaluate(()=>matchMedia('(display-mode: standalone)').matches)});}
 await page.evaluate(()=>{document.getElementById('options').open=true;scrollTo(0,300)});assert.ok((await page.evaluate(geometry)).top<0,'in-flow header scrolls');
 await context.setOffline(true);await page.goto('file:///'+path.join(root,'index.html').replace(/\\/g,'/'));await ready(page);assert.match(await answer(page,await page.evaluate(()=>current()[4])),/Correct/);report.ui.push({engine:engine.name(),check:'cold local-file startup offline'});
 console.log(engine.name()+': 1680 canonical fixture executions, 48 mutants rejected, UI/mobile/offline checks passed');
 }finally{await browser.close();}
}
assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);report.summary={engines:2,canonicalFixtureExecutions:report.matrix.length,newExerciseMutantsRejected:48,perEngineVariants:4,fixturesPerVariant:7,originalResultComparisons:288,independentOracleChecks:392,uiChecks:report.ui.length,layoutChecks:report.layout.filter(r=>!r.check).length,standaloneMediaEmulationSupported:report.layout.find(r=>r.check)?.supported,externalRequests:0,pageErrors:0};
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary,null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
