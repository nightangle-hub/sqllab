const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const env={...process.env,AXE_MODULE:require.resolve('axe-core/axe.min.js')};
for(const name of ['test','release-test','release-safety']){const r=spawnSync(process.execPath,[path.join(__dirname,name+'.cjs')],{env,encoding:'utf8'});fs.writeFileSync(path.join(__dirname,'../test-results',name+'-final.log'),r.stdout+r.stderr);console.log(name+': '+(r.status===0?'PASS':'FAIL'));if(r.status!==0){console.error(r.stderr);process.exitCode=1;break;}}
