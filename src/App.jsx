import { useState } from "react";

const PL={
  a:{base:660000,label:'2期治療（21歳以下）'},
  b:{base:715000,label:'2期治療（21歳以下・透明ブラケット）'},
  c:{base:715000,label:'2期治療（21歳以上）'},
  d:{base:770000,label:'2期治療（21歳以上・透明ブラケット）'},
  e:{base:330000,label:'1期治療'}
};
const INST={a:[3,6,12],b:[3,6,12],c:[3,6,12],d:[3,6,12],e:[3,6]};
const HAND=55000;
const STPS=['治療プラン','支払い方法','振込状況','同意書','確認'];
const CST=[
  '治療内容・料金について説明を受け、内容を十分に理解しました。',
  '返金ポリシー（治療開始後の返金は原則不可）について理解しました。',
  '治療に伴うリスク（後戻り・装置破損・治療期間延長等）について理解しました。'
];
const fmt=n=>Math.round(n).toLocaleString('ja-JP');
const DOC_URL='https://example.com/consent.pdf';

export default function App() {
  const [stp,setStp]=useState(0);
  const [nm,setNm]=useState('');
  const [vd,setVd]=useState('');
  const [pl,setPl]=useState('');
  const [py,setPy]=useState('');
  const [ins,setIns]=useState('');
  const [tr,setTr]=useState('');
  const [chk,setChk]=useState([false,false,false]);
  const [nextDay,setNextDay]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [nmError,setNmError]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  const fmtDate=dt=>`${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`;
  const deadlineStr=()=>{
    if(!vd) return null;
    const dl=new Date(vd);dl.setDate(dl.getDate()-3);return fmtDate(dl);
  };
  const eomLabel=(y,m)=>`${y}年${m}月末日`;
  const calc3=pk=>{
    const rem=PL[pk].base-HAND;
    const first=Math.floor(rem/2/5000)*5000;
    return{first,last:rem-first};
  };
  const calcEq=(pk,n)=>(PL[pk].base-HAND)/(n-1);

  const paySchedule=()=>{
    if(!vd||!pl||!py) return null;
    const visit=new Date(vd);
    const vy=visit.getFullYear(),vm=visit.getMonth()+1;
    const rows=[];
    const handDate=nextDay?'来院前まで':(deadlineStr()+'まで');
    rows.push({label:'契約金',amount:'¥'+fmt(HAND),date:handDate,hl:true});
    if(py==='院内分割'&&ins){
      const n=parseInt(ins);
      if(n===3){
        const{first,last}=calc3(pl);
        const m1=vm%12+1,y1=vm===12?vy+1:vy;
        const m2=(vm+1)%12+1,y2=vm>=11?vy+1:vy;
        rows.push({label:'第2回',amount:'¥'+fmt(first),date:eomLabel(y1,m1)});
        rows.push({label:'第3回（最終）',amount:'¥'+fmt(last),date:eomLabel(y2,m2)});
      } else {
        const monthly=calcEq(pl,n);
        for(let i=1;i<n;i++){
          const mo=((vm-1+i)%12)+1,yr=vy+Math.floor((vm-1+i)/12);
          const lbl=i===n-1?`第${i}回（最終）`:`第${i}回`;
          rows.push({label:lbl,amount:'¥'+fmt(monthly),date:eomLabel(yr,mo)});
        }
      }
    } else if(py==='一括'){
      const mo=vm%12+1,yr=vm===12?vy+1:vy;
      rows.push({label:'残額',amount:'¥'+fmt(PL[pl].base-HAND),date:eomLabel(yr,mo)});
    } else if(py==='デンタルローン'){
      rows.push({label:'ローン手続き',amount:'当日ご案内',date:'契約来院日'});
    }
    return rows;
  };

  const canNext=()=>{
    if(stp===0) return nm.trim()!==''&&pl!=='';
    if(stp===1){if(!py)return false;if(py==='院内分割'&&!ins)return false;return true;}
    if(stp===2) return py==='デンタルローン'||tr!=='';
    if(stp===3) return chk.every(Boolean);
    return true;
  };
  const handleNext=()=>{
    if(stp===0&&nm.trim()===''){setNmError(true);return;}
    setNmError(false);
    setStp(s=>s+1);
  };

  const tgChk=i=>{
    const c=[...chk];c[i]=!c[i];setChk(c);
  };

  const dl=deadlineStr();
  const sc=paySchedule();

  if(submitted) return (
    <div style={S.wrap}>
      <div style={S.hd}><p style={S.cn}>カーツー矯正歯科室</p><h1 style={S.h1}>契約前フォーム</h1></div>
      <div style={S.card}>
        <div style={S.done}>
          <div style={S.dkIcon}>✓</div>
          <p style={S.dkTitle}>送信完了</p>
          <p style={S.dkSub}>ご入力ありがとうございます。<br/>内容を確認し、当日スムーズにご案内いたします。</p>
          <div style={S.moti}><span style={{fontSize:20}}>🪥</span><div><div style={S.motiT}>次回来院時の持ち物</div><div style={S.motiS}>歯ブラシをお持ちください</div></div></div>
          <div style={S.dr}>
            {[['お名前',nm],['契約来院日',vd?fmtDate(new Date(vd)):''],['プラン',PL[pl]?.label||''],['支払い',py+(py==='院内分割'?`（${ins}回）`:'')],['振込',tr],['送信日時',new Date().toLocaleString('ja-JP')]].map(([k,v])=>(
              <p key={k} style={{fontSize:12,marginBottom:5,color:'var(--color-text-primary)'}}><span style={{color:'var(--color-text-tertiary)',marginRight:6}}>{k}</span>{v}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.hd}>
        <p style={S.cn}>カーツー矯正歯科室</p>
        <h1 style={S.h1}>契約前フォーム</h1>
        <p style={S.sb}>契約来院日の3日前までにご送信ください</p>
      </div>
      <div style={S.card}>
        {/* Steps */}
        <div style={S.steps}>
          {STPS.map((s,i)=>(
            <div key={i} style={S.si}>
              <div style={{...S.sd,background:i<stp?'#d4f2e8':i===stp?'#2BAE8E':'var(--color-background-secondary)',color:i<stp?'#1d8a70':i===stp?'#fff':'var(--color-text-tertiary)',fontSize:i<stp?9:11}}>{i<stp?'✓':i+1}</div>
              <div style={{...S.sl,color:i===stp?'#2BAE8E':'var(--color-text-tertiary)'}}>{s}</div>
            </div>
          ))}
        </div>

        <div style={S.bd}>
          {/* Step 0 */}
          {stp===0&&<>
            <div style={S.fl}><label style={S.lbl}>お名前</label><input style={S.inp} placeholder="例：山田 花子" value={nm} onChange={e=>{setNm(e.target.value);if(e.target.value.trim()!=='')setNmError(false);}}/>{nmError&&<p style={{fontSize:12,color:'#cc0000',marginTop:4}}>お名前を入力してください</p>}</div>
            <div style={S.fl}><label style={S.lbl}>契約来院日</label><input type="date" style={S.inp} value={vd} onChange={e=>setVd(e.target.value)}/></div>
            <label style={{...S.ndtog,background:nextDay?'#fff8e8':'var(--color-background-secondary)',borderColor:nextDay?'#e8a000':'var(--color-border-tertiary)'}} onClick={()=>setNextDay(!nextDay)}>
              <input type="checkbox" checked={nextDay} onChange={()=>setNextDay(!nextDay)} style={{width:18,height:18,accentColor:'#e8a000',flexShrink:0}}/>
              <div><div style={{fontSize:13,color:'var(--color-text-primary)',fontWeight:500}}>次回のご来院はカウンセリングから3日以内ですか？</div><div style={{fontSize:11,color:'var(--color-text-secondary)',marginTop:2}}>該当する場合はチェックしてください</div></div>
            </label>
            {vd&&(nextDay
              ?<div style={S.dlFlex}><p style={{fontSize:12,color:'#8a5a00',fontWeight:500}}>来院前までにフォーム送信・振込をお願いします</p></div>
              :<div style={S.dlBox}><p style={{fontSize:12,color:'#cc0000',fontWeight:500}}>フォーム提出・振込・振込明細の期限</p><div style={{fontSize:15,color:'#cc0000',fontWeight:700,marginTop:2}}>{dl}まで</div></div>
            )}
            <span style={S.ol}>治療プランを選択してください</span>
            {Object.entries(PL).map(([k,v])=>(
              <button key={k} style={{...S.opt,...S.optRow,...(pl===k?S.optSel:{})}} onClick={()=>{setPl(k);setIns('');}}>
                <span style={S.om}>{v.label}</span>
                <span style={S.op}>¥{fmt(v.base)}<span style={{fontSize:10,color:'var(--color-text-tertiary)'}}> 税込</span></span>
              </button>
            ))}
          </>}

          {/* Step 1 */}
          {stp===1&&<>
            {nextDay&&<div style={{marginBottom:10}}><span style={S.badge}>カウンセリングから3日以内来院</span></div>}
            <span style={S.ol}>お支払い方法を選択してください</span>
            {[['一括','一括払い','全額一括'],['デンタルローン','デンタルローン',''],['院内分割','院内分割','手数料なし']].map(([v,m,sub])=>(
              <button key={v} style={{...S.opt,...(py===v?S.optSel:{})}} onClick={()=>{setPy(v);setIns('');}}>
                <span style={S.om}>{m}</span>{sub&&<span style={S.os}>{sub}</span>}
              </button>
            ))}
            {py==='院内分割'&&pl&&<>
              <div style={{...S.ybox,marginTop:10}}><p style={{fontSize:12,color:'#6a5000',lineHeight:1.65}}>📋 <strong>契約金55,000円（税込）</strong>を初回振込としてお支払いください。残額を選択した回数で均等分割、月末払いとなります。</p></div>
              <span style={S.ol}>分割回数を選択してください</span>
              {INST[pl].map(n=>(
                <button key={n} style={{...S.opt,...(n!==3?S.optRow:{}),...(ins===String(n)?S.optSel:{})}} onClick={()=>setIns(String(n))}>
                  <span style={S.om}>{n}回払い</span>
                  {n===3?<span style={S.os}>詳細は次画面のスケジュールをご確認ください</span>:<span style={S.op}>月々 ¥{fmt(calcEq(pl,n))}</span>}
                </button>
              ))}
            </>}
          </>}

          {/* Step 2 */}
          {stp===2&&<>
            {nextDay&&<div style={{marginBottom:10}}><span style={S.badge}>カウンセリングから3日以内来院</span></div>}
            <div style={S.sbox}>
              <p style={{fontSize:11,color:'#555',marginBottom:3}}>お支払い金額（税込）</p>
              <div style={{fontSize:24,fontWeight:500,color:'#1d8a70',marginBottom:2}}>¥{fmt(PL[pl].base)}</div>
              {py==='院内分割'&&ins&&<div style={{fontSize:12,color:'#2BAE8E'}}>契約金 ¥{fmt(HAND)} ＋ 残額{parseInt(ins)-1}回払い</div>}
            </div>
            {sc&&<div style={S.schd}>
              <div style={S.schdT}>お支払いスケジュール</div>
              {sc.map((r,i)=>(
                <div key={i} style={S.schdR}>
                  <span style={{fontSize:12,color:'var(--color-text-secondary)'}}>{r.label}</span>
                  <span style={{textAlign:'right'}}>
                    <span style={{fontSize:12,fontWeight:500,color:r.hl?'#2BAE8E':'var(--color-text-primary)'}}>{r.amount}</span>
                    <br/><span style={{fontSize:10,color:'var(--color-text-tertiary)'}}>{r.date}</span>
                  </span>
                </div>
              ))}
            </div>}
            {py!=='デンタルローン'&&<>
              <span style={S.ol}>振込状況を選択してください</span>
              {[['振込済','振込明細をLINEで送付済み'],['振込予定',nextDay?'来院前までに振込・LINEで振込明細を送付':(dl?dl+'までに振込します':'3日前までに振込します')]].map(([v,sub])=>(
                <button key={v} style={{...S.opt,...(tr===v?S.optSel:{})}} onClick={()=>setTr(v)}>
                  <span style={S.om}>{v}</span><span style={S.os}>{sub}</span>
                </button>
              ))}
              {tr&&<p style={{fontSize:12,color:nextDay?'#8a5a00':'#cc0000',textAlign:'center',marginTop:8,fontWeight:500,lineHeight:1.6}}>振込・振込明細のLINE送付は{nextDay?'来院前':(dl||'3日前')}までにお願いします</p>}
              <div style={S.furiNote}><p style={{fontSize:12,color:'var(--color-text-secondary)',lineHeight:1.65}}>※お振込の際は、治療を受ける方のお名前でお振込ください</p></div>
            </>}
            {py==='デンタルローン'&&<div style={{background:'#fff0f0',border:'0.5px solid #ffb0b0',borderRadius:8,padding:'12px 14px',marginTop:8}}><p style={{color:'#cc0000',fontSize:13,fontWeight:500,lineHeight:1.6}}>エポスカードデンタルローンのお申し込みを来院日までに完了してください。</p></div>}
          </>}

          {/* Step 3 */}
          {stp===3&&<>
            {nextDay&&<div style={{marginBottom:10}}><span style={S.badge}>カウンセリングから3日以内来院</span></div>}
            <a href={DOC_URL} target="_blank" rel="noreferrer" style={S.docLink}>
              <div><div style={{fontSize:13,color:'#2BAE8E',fontWeight:500}}>同意書の内容を確認する</div><div style={{fontSize:11,color:'var(--color-text-tertiary)',marginTop:2}}>タップして別画面で開きます（PDF）</div></div>
              <span style={{fontSize:16,color:'#2BAE8E'}}>↗</span>
            </a>
            <div style={S.cname}>以下の内容は <strong>{nm||'（お名前未入力）'}</strong> 本人が確認・同意します</div>
            {CST.map((c,i)=>(
              <label key={i} style={{...S.ci,...(chk[i]?S.ciOk:{})}} onClick={()=>tgChk(i)}>
                <input type="checkbox" checked={chk[i]} onChange={()=>tgChk(i)} style={{width:17,height:17,marginTop:1,flexShrink:0,accentColor:'#2BAE8E'}}/>
                <span style={{fontSize:12,color:'var(--color-text-primary)',lineHeight:1.6}}>{c}</span>
              </label>
            ))}
            <p style={{fontSize:11,color:'var(--color-text-tertiary)',textAlign:'center',marginTop:10,lineHeight:1.5}}>※契約来院時にb-alignにて正式署名をいただきます</p>
          </>}

          {/* Step 4 */}
          {stp===4&&<>
            {[['お名前',nm],['契約来院日',vd?fmtDate(new Date(vd)):''],['提出期限',nextDay?'来院前まで':(dl?dl+'まで':'')],['治療プラン',PL[pl]?.label||''],['お支払い方法',py+(py==='院内分割'?`（${ins}回）`:'')],['振込状況',tr],['同意','3項目すべて確認済み']].map(([k,v])=>v?(
              <div key={k} style={S.crow}><span style={S.ck}>{k}</span><span style={S.cv}>{v}</span></div>
            ):null)}
          </>}
        </div>

        {/* Nav */}
        <div style={S.nav}>
          {stp>0&&<button style={S.bb} onClick={()=>setStp(s=>s-1)}>← 戻る</button>}
          {stp<STPS.length-1
            ?<button style={{...S.nb,opacity:canNext()?1:0.3}} onClick={handleNext}>次へ →</button>
            :<button style={{...S.nb,opacity:submitting?0.6:1}} disabled={submitting} onClick={async()=>{
                setSubmitting(true);
                try{
                  await fetch('https://script.google.com/macros/s/AKfycbykiahAfnYdTKycSH6O0RpW6mfvTpUvJhTTunM-84zjyobreMPAmmtxhRQyc-UWZkke/exec',{
                    method:'POST',
                    mode:'no-cors',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                      submittedAt:new Date().toLocaleString('ja-JP'),
                      name:nm,
                      visitDate:vd,
                      plan:PL[pl].label,
                      payment:py+(py==='院内分割'?`（${ins}回）`:''),
                      transfer:tr,
                      nextDay:nextDay,
                    }),
                  });
                }catch{
                  alert('送信に失敗しました。再度お試しください。');
                }finally{
                  setSubmitting(false);
                  setSubmitted(true);
                }
              }}>{submitting?'送信中...':'送信する'}</button>
          }
        </div>

      </div>
    </div>
  );
}

const G='#2BAE8E',GD='#1d8a70';
const S={
  wrap:{maxWidth:400,margin:'0 auto',padding:16,fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif"},
  hd:{background:G,borderRadius:'14px 14px 0 0',padding:'28px 20px 24px',textAlign:'center'},
  cn:{color:'rgba(255,255,255,.95)',fontSize:17,letterSpacing:3,marginBottom:8,fontWeight:700},
  h1:{color:'#fff',fontSize:24,fontWeight:700,marginBottom:6},
  sb:{color:'rgba(255,255,255,.85)',fontSize:13},
  card:{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'0 0 14px 14px'},
  steps:{display:'flex',padding:'12px 6px',borderBottom:'0.5px solid var(--color-border-tertiary)'},
  si:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3},
  sd:{width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:500,transition:'all .2s'},
  sl:{fontSize:9,textAlign:'center',lineHeight:1.2},
  bd:{padding:'14px 16px 6px'},
  fl:{marginBottom:12},
  lbl:{display:'block',fontSize:12,color:'var(--color-text-secondary)',fontWeight:500,marginBottom:7},
  inp:{width:'100%',padding:'10px 12px',borderRadius:8,border:'0.5px solid var(--color-border-secondary)',fontSize:14,background:'var(--color-background-primary)',color:'var(--color-text-primary)',outline:'none',boxSizing:'border-box'},
  ol:{display:'block',fontSize:12,color:'var(--color-text-secondary)',fontWeight:500,marginBottom:7},
  ndtog:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:8,border:'0.5px solid',cursor:'pointer',marginBottom:14},
  dlBox:{background:'#fff0f0',border:'0.5px solid #ffb0b0',borderRadius:8,padding:'9px 13px',marginBottom:12,textAlign:'center'},
  dlFlex:{background:'#fff8e8',border:'0.5px solid #e8a000',borderRadius:8,padding:'9px 13px',marginBottom:12,textAlign:'center'},
  opt:{width:'100%',padding:'13px 14px',background:'var(--color-background-secondary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:8,marginBottom:7,display:'flex',flexDirection:'column',gap:3,cursor:'pointer',textAlign:'left'},
  optRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  optSel:{background:'#edfaf5',border:'1.5px solid #2BAE8E'},
  om:{fontSize:13,color:'var(--color-text-primary)',fontWeight:500},
  os:{fontSize:11,color:'var(--color-text-secondary)'},
  op:{fontSize:13,color:G,fontWeight:500},
  badge:{display:'inline-block',background:'#fff0cc',border:'0.5px solid #e8a000',borderRadius:4,padding:'2px 8px',fontSize:11,color:'#8a5a00',fontWeight:500},
  ybox:{background:'#fff8e8',border:'0.5px solid #e8c840',borderRadius:8,padding:'10px 13px',marginBottom:10},
  sbox:{background:'#edfaf5',borderRadius:12,padding:'13px 15px',marginBottom:12,textAlign:'center',border:'0.5px solid #b8e8d8'},
  schd:{background:'var(--color-background-secondary)',borderRadius:8,padding:'11px 13px',marginBottom:12},
  schdT:{fontSize:11,color:'var(--color-text-secondary)',fontWeight:500,marginBottom:8},
  schdR:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'0.5px solid var(--color-border-tertiary)'},
  furiNote:{background:'var(--color-background-secondary)',borderRadius:8,padding:'10px 13px',marginTop:10},
  docLink:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:'var(--color-background-secondary)',border:'0.5px solid var(--color-border-secondary)',borderRadius:8,marginBottom:12,textDecoration:'none'},
  cname:{background:'var(--color-background-secondary)',borderRadius:8,padding:'9px 12px',marginBottom:12,fontSize:12,color:'var(--color-text-secondary)',lineHeight:1.5},
  ci:{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 13px',background:'var(--color-background-secondary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:8,marginBottom:8,cursor:'pointer'},
  ciOk:{background:'#edfaf5',borderColor:'#2BAE8E'},
  crow:{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'0.5px solid var(--color-border-tertiary)'},
  ck:{fontSize:12,color:'var(--color-text-secondary)'},
  cv:{fontSize:12,color:'var(--color-text-primary)',fontWeight:500,textAlign:'right',maxWidth:'60%'},
  nav:{display:'flex',gap:8,padding:'10px 16px 16px'},
  bb:{padding:'10px 16px',borderRadius:8,border:'0.5px solid var(--color-border-secondary)',background:'var(--color-background-primary)',color:'var(--color-text-secondary)',fontSize:13,cursor:'pointer'},
  nb:{flex:1,padding:11,borderRadius:8,border:'none',background:G,color:'#fff',fontSize:14,fontWeight:500,cursor:'pointer'},
  done:{textAlign:'center',padding:'28px 16px'},
  dkIcon:{width:52,height:52,borderRadius:'50%',background:G,lineHeight:'52px',fontSize:22,color:'#fff',margin:'0 auto 12px'},
  dkTitle:{fontSize:19,fontWeight:500,color:GD,marginBottom:8},
  dkSub:{fontSize:13,color:'var(--color-text-secondary)',lineHeight:1.7,marginBottom:0},
  moti:{background:'#edfaf5',border:'0.5px solid #b8e8d8',borderRadius:8,padding:'14px',marginTop:16,display:'flex',flexDirection:'column',alignItems:'center',gap:6,textAlign:'center'},
  motiT:{fontSize:13,color:'#1d6a50',fontWeight:500},
  motiS:{fontSize:11,color:'#2BAE8E',marginTop:0},
  dr:{background:'var(--color-background-secondary)',borderRadius:8,padding:'12px 14px',textAlign:'left',marginTop:14},
};
