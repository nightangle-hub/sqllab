// Independent row calculations. No reference SQL is used to derive these results.
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const sort=(rows,...keys)=>rows.slice().sort((a,b)=>{for(const k of keys){const [key,dir=1]=Array.isArray(k)?k:[k,1];const n=cmp(a[key],b[key])*dir;if(n)return n;}return 0;});
const sum=(xs,f=x=>x)=>xs.reduce((n,x)=>n+f(x),0),round=x=>Math.round((x+Number.EPSILON)*100)/100;
const group=(xs,k)=>{const m=new Map();for(const x of xs){const key=k(x);if(!m.has(key))m.set(key,[]);m.get(key).push(x);}return [...m];};
const day=d=>Date.parse(d)/86400000;
function oracle(id,data,variant){
 const A=sort(data.accounts,'account_id'),T=data.transactions,L=sort(data.logs,'log_id'),tx=sort(T,'txn_id'),ac=id=>A.find(a=>a.account_id===id),posted=T.filter(t=>t.status==='posted'),failed=T.filter(t=>t.status==='failed'),net=ts=>sum(ts,t=>t.status==='posted'?(t.direction==='credit'?t.amount:-t.amount):0),byAccount=sort(T,'account_id','txn_date','txn_id'),project=(xs,...ks)=>xs.map(x=>ks.map(k=>x[k]));
 const grouped=(xs,k,f)=>group(xs,x=>x[k]).sort((a,b)=>cmp(a[0],b[0])).map(([key,rows])=>[key,...f(rows)]);
 switch(id){
 case 0:return project(tx.filter(t=>t.status==='failed'),'txn_id','amount','status');
 case 1:return project(sort(posted.filter(t=>t.amount>=1000*(1+variant%4)),['amount',-1],'txn_id'),'txn_id','amount');
 case 2:return project(L.filter(l=>l.resolved_at===null),'log_id','txn_id');
 case 3:return grouped(T,'status',r=>[r.length]);
 case 4:return grouped(posted.filter(t=>t.direction==='debit'),'txn_date',r=>[sum(r,t=>t.amount)]);
 case 5:return failed.slice().sort((a,b)=>a.txn_id-b.txn_id).map(t=>[t.txn_id,ac(t.account_id).customer_name,t.amount]);
 case 6:return A.filter(a=>!T.some(t=>t.account_id===a.account_id)).map(a=>[a.account_id,a.customer_name]);
 case 7:return grouped(failed,'account_id',r=>[r.length]).filter(r=>r[1]>=2);
 case 8:return grouped(T.filter(t=>t.status==='pending'),'account_id',r=>[sum(r,t=>t.amount)]).filter(r=>r[1]>4000*(1+variant%4));
 case 9:return A.map(a=>[a.account_id,a.opening_balance+net(T.filter(t=>t.account_id===a.account_id)),a.reported_balance]).filter(r=>r[1]!==r[2]);
 case 10:{const m=new Map();return byAccount.filter(t=>t.status==='posted').map(t=>{const n=(m.get(t.account_id)||0)+(t.direction==='credit'?t.amount:-t.amount);m.set(t.account_id,n);return [t.txn_id,t.account_id,n];});}
 case 11:return group(sort(T,'account_id',['txn_date',-1],['txn_id',-1]),t=>t.account_id).map(([a,r])=>[a,r[0].txn_id,r[0].amount,r[0].status]);
 case 12:return project(A,'account_id','customer_name');
 case 13:return project(tx,'txn_id','amount');
 case 14:return project(A.filter(a=>a.account_status==='active'),'account_id','customer_name');
 case 15:return project(tx.filter(t=>t.amount>=1000),'txn_id','amount');
 case 16:return project(tx.filter(t=>['failed','pending'].includes(t.status)),'txn_id','status');
 case 17:return project(sort(T.filter(t=>t.amount>=500&&t.amount<=1000),'amount','txn_id'),'txn_id','amount');
 case 18:return project(sort(T.filter(t=>t.txn_date>='2026-10-05'&&t.txn_date<'2026-10-10'),'txn_date','txn_id'),'txn_id','txn_date');
 case 19:return project(A.filter(a=>/^a/i.test(a.customer_name)),'account_id','customer_name');
 case 20:return project(sort(T,['amount',-1],'txn_id').slice(0,3),'txn_id','amount');
 case 21:return project(tx.slice(3,6),'txn_id','amount');
 case 22:return [...new Set(A.map(a=>a.region))].sort(cmp).map(r=>[r]);
 case 23:return [...new Set(T.map(t=>JSON.stringify([t.status,t.channel])))].map(JSON.parse).sort((a,b)=>cmp(a[0],b[0])||cmp(a[1],b[1]));
 case 24:return project(L.filter(l=>l.resolved_at!==null),'log_id','resolved_at');
 case 25:return L.map(l=>[l.log_id,l.resolved_at??'open']);
 case 26:return [[T.length]];
 case 27:return [[L.length,L.filter(l=>l.resolved_at!==null).length]];
 case 28:return [[posted.length?sum(posted,t=>t.amount):null,posted.length?Math.min(...posted.map(t=>t.amount)):null,posted.length?Math.max(...posted.map(t=>t.amount)):null]];
 case 29:return grouped(T,'channel',r=>[round(sum(r,t=>t.amount)/r.length)]);
 case 30:return grouped(A,'region',r=>[r.length]);
 case 31:return group(T,t=>JSON.stringify([t.channel,t.status])).map(([k,r])=>[...JSON.parse(k),r.length]).sort((a,b)=>cmp(a[0],b[0])||cmp(a[1],b[1]));
 case 32:return grouped(T,'channel',r=>[r.length]).filter(r=>r[1]>=5);
 case 33:return tx.map(t=>[t.txn_id,ac(t.account_id).region,t.amount]);
 case 34:return A.map(a=>[a.account_id,T.filter(t=>t.account_id===a.account_id).length]);
 case 35:return A.map(a=>[a.account_id,posted.filter(t=>t.account_id===a.account_id).length]);
 case 36:return L.filter(l=>l.resolved_at===null).map(l=>{const t=T.find(t=>t.txn_id===l.txn_id);return [l.log_id,ac(t.account_id).customer_name,t.status];});
 case 37:return grouped(T.filter(t=>L.some(l=>l.txn_id===t.txn_id)),'account_id',r=>[r.length]);
 case 38:return project(tx.filter(t=>t.amount>sum(T,t=>t.amount)/T.length),'txn_id','amount');
 case 39:return A.filter(a=>failed.some(t=>t.account_id===a.account_id)).map(a=>[a.account_id,a.customer_name]);
 case 40:return project(tx.filter(t=>!L.some(l=>l.txn_id===t.txn_id)),'txn_id','amount');
 case 41:return tx.filter(t=>{const r=T.filter(x=>x.account_id===t.account_id);return t.amount>sum(r,x=>x.amount)/r.length;}).map(t=>[t.txn_id,t.account_id,t.amount]);
 case 42:return tx.map(t=>[t.txn_id,t.amount<500?'small':t.amount<1000?'medium':'large']);
 case 43:return sort(posted,'txn_id').map(t=>[t.txn_id,t.direction==='credit'?t.amount:-t.amount]);
 case 44:return grouped(T,'account_id',r=>['posted','pending','failed'].map(s=>r.filter(t=>t.status===s).length));
 case 45:return grouped(T,'channel',r=>[round(100*r.filter(t=>t.status==='failed').length/r.length)]);
 case 46:return grouped(posted,'txn_date',r=>[sum(r,t=>t.amount)]);
 case 47:return A.map(a=>[a.account_id,...['posted','pending'].map(s=>sum(T.filter(t=>t.account_id===a.account_id&&t.status===s),t=>t.amount))]);
 case 48:{const g=grouped(posted,'account_id',r=>[sum(r,t=>t.amount)]),avg=sum(g,r=>r[1])/g.length;return g.filter(r=>r[1]>avg);}
 case 49:return group(byAccount,t=>t.account_id).flatMap(([a,r])=>r.map((t,i)=>[t.txn_id,a,i+1]));
 case 50:return sort(T,'channel',['amount',-1],'txn_id').map(t=>[t.txn_id,t.channel,new Set(T.filter(x=>x.channel===t.channel&&x.amount>t.amount).map(x=>x.amount)).size+1]);
 case 51:return group(sort(T,'account_id',['txn_date',-1],['txn_id',-1]),t=>t.account_id).flatMap(([a,r])=>r.slice(0,2).map(t=>[a,t.txn_id]));
 case 52:return group(byAccount,t=>t.account_id).flatMap(([a,r])=>r.map((t,i)=>[t.txn_id,a,i?r[i-1].amount:null]));
 case 53:return group(byAccount,t=>t.account_id).flatMap(([a,r])=>r.map((t,i)=>[t.txn_id,i?day(t.txn_date)-day(r[i-1].txn_date):null]));
 case 54:return group(byAccount.filter(t=>t.status==='posted'),t=>t.account_id).flatMap(([a,r])=>r.map((t,i)=>{const w=r.slice(Math.max(0,i-2),i+1);return [t.txn_id,round(sum(w,t=>t.amount)/w.length)];}));
 case 55:return grouped(posted,'channel',r=>[sum(posted,t=>t.amount)===0?null:round(100*sum(r,t=>t.amount)/sum(posted,t=>t.amount))]);
 case 56:return L.filter(l=>l.resolved_at===null).map(l=>[l.log_id,day('2026-11-01')-day(T.find(t=>t.txn_id===l.txn_id).txn_date)]);
 case 57:return grouped(A,'region',r=>[net(T.filter(t=>r.some(a=>a.account_id===t.account_id)))]);
 case 58:return A.map(a=>[a.account_id,a.reported_balance-a.opening_balance-net(T.filter(t=>t.account_id===a.account_id))]);
 case 59:{const p=posted.filter(t=>t.direction==='debit');return p.filter(t=>t.amount===Math.max(...p.filter(x=>ac(x.account_id).region===ac(t.account_id).region).map(x=>x.amount))).map(t=>[ac(t.account_id).region,t.txn_id,t.amount]).sort((a,b)=>cmp(a[0],b[0])||a[1]-b[1]);}
 default:throw Error('Missing oracle '+id);
 }
}
module.exports={oracle};
