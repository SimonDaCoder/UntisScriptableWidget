const SERVER = "www.webuntis.com";
const SCHOOL = "School Name";
const USERNAME = "UserName"; // username
const PASSWORD = "PassWort"; // password
const CLIENT = "ScriptableUntisWidgetNowNext";
const REFRESH_MINUTES = 5;

function pad(n){ return n.toString().padStart(2,'0'); }
function localDateYMD(d){ return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`; }
function addDays(d,n){ let x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }

async function jsonRpc(method, params={}) {
  const url=`https://${SERVER}/WebUntis/jsonrpc.do?school=${encodeURIComponent(SCHOOL)}`;
  const req=new Request(url);
  req.method="POST";
  req.headers={"Content-Type":"application/json"};
  req.body=JSON.stringify({id:CLIENT,jsonrpc:"2.0",method,params});
  const res=await req.loadJSON();
  if(res.error) throw new Error(JSON.stringify(res.error));
  return res.result;
}

async function login() {
  const r=await jsonRpc("authenticate",{user:USERNAME,password:PASSWORD,client:CLIENT});
  if(!r.sessionId) throw new Error("Login fehlgeschlagen");
  return r;
}
async function logout(){ try{ await jsonRpc("logout"); }catch(e){} }

async function getDayTimetable(personId, personType, dateYMD){
  const opts={options:{id:Date.now(),element:{id:personId,type:personType},startDate:dateYMD,endDate:dateYMD,showLsText:true,showStudentgroup:true,showLsNumber:true,showSubstText:true,showInfo:true,showBooking:true,klasseFields:['id','name'],roomFields:['id','name'],subjectFields:['id','name','longname'],teacherFields:['id','name']}};
  const res=await jsonRpc("getTimetable",opts);
  return res.periods||res||[];
}

function normalizePeriods(raw){
  return (raw||[]).map(item=>{
    let subject=(item.su&&item.su[0]&&(item.su[0].longname||item.su[0].name))||item.lstext||"";
    subject=subject.replace(/\s+[eg]A$/,"");
    const room=(item.ro&&item.ro[0]&&item.ro[0].name)||"";
    const teacher=(item.te&&item.te[0]&&item.te[0].name)||"";
    return {
      subject,
      room,
      teacher,
      lessonNumber:item.lessonNumber||null,
      startTime:item.startTime,
      endTime:item.endTime
    };
  }).filter(p=>p.subject);
}

function toMinutes(n){ const h=Math.floor(n/100), m=n%100; return h*60+m; }

async function buildWidget(){
  const widget=new ListWidget();
  widget.setPadding(10,10,10,10);
  widget.backgroundColor=new Color("#151515");

  try {
    const loginRes=await login();
    const personId=loginRes.personId, personType=loginRes.personType;
    let today=new Date();
    let nextTwo=[];

    for(let add=0;add<7;add++){
      let checkDate=addDays(today,add);
      if(checkDate.getDay()===0||checkDate.getDay()===6) continue;
      let periods=normalizePeriods(await getDayTimetable(personId, personType, localDateYMD(checkDate)));
      const nowMin=add===0 ? today.getHours()*60+today.getMinutes() : -1;
      const valid=periods.filter(p=>!p.endTime || toMinutes(p.endTime)>nowMin);
      if(valid.length>0){
        nextTwo=valid.slice(0,2);
        break;
      }
    }

    await logout();

    if(nextTwo.length===0){
      const err=widget.addText("Keine Stunden gefunden");
      err.font=Font.systemFont(12);
      err.textColor=Color.red();
      return widget;
    }

    const tint=widget.tintColor||new Color("#6DB1F2");
    const nowMin=today.getHours()*60+today.getMinutes();

    for(const p of nextTwo){
      const row=widget.addStack();
      row.layoutHorizontally();
      row.cornerRadius=8;
      row.setPadding(12,12,12,12);

      let isCurrent=false;
      if(p.startTime&&p.endTime){
        const s=toMinutes(p.startTime), e=toMinutes(p.endTime);
        if(nowMin>=s && nowMin<e) isCurrent=true;
      }

      if(isCurrent){
        row.backgroundColor=tint;
      } else {
        row.backgroundColor=new Color("#000000",0);
        row.borderColor=tint;
        row.borderWidth=2;
      }

      const textStack=row.addStack();
      textStack.layoutVertically();
      const subjText=textStack.addText(p.subject);
      subjText.font=Font.semiboldSystemFont(16);
      subjText.textColor=new Color("#FFFFFF");
      const detailText=textStack.addText(p.teacher+" | "+p.room);
      detailText.font=Font.systemFont(14);
      detailText.textColor=new Color("#FFFFFF");

      row.addSpacer();
      if(p.lessonNumber){
        const numText=row.addText(p.lessonNumber.toString());
        numText.font=Font.boldSystemFont(16);
        numText.textColor=new Color("#FFFFFF");
      }

      widget.addSpacer(6);
    }

    widget.refreshAfterDate=new Date(Date.now()+REFRESH_MINUTES*60*1000);
    return widget;

  } catch(e) {
    const err=widget.addText("Fehler: "+(e.message||e));
    err.font=Font.systemFont(12);
    err.textColor=Color.red();
    return widget;
  }
}

const w=await buildWidget();
Script.setWidget(w);
Script.complete();
if(!config.runsInWidget) await w.presentMedium();
