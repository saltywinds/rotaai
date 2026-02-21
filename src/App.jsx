import { useState, useEffect } from "react";

// ── Claude API (routed through Netlify function to avoid CORS) ───────────────
async function callClaude(system, user) {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_STAFF = [
  { id:1, name:"Daisy Miller", location:"Reigate", roles:["FOH"], days:["Sat", "Sun"], hours:12, note:"Will be finished college at the start of June so I will be able to work weekdays aswell as weekends" },
  { id:2, name:"Flynn McRobbie", location:"Both", roles:["Kitchen", "Pizza"], days:["Thu", "Fri", "Sat", "Sun"], hours:21, note:"If Saturday, only from 5, and wont be available everyweek | Working at the other job" },
  { id:3, name:"Sam Gu", location:"Both", roles:["Barista", "FOH"], days:["Mon", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:37, note:"I am happy to work 30-40hrs, 4-5 days per week, based upon your scheduling needs \n\nI have told Lauren that I will be finishing at the cafe in mid to late April. I don't have all of my plans for moving back to Canada clarified yet. I will make sure to give you at least 2 weeks notice when I decide to leave. | No other info I can think of right now" },
  { id:4, name:"Sian Jarvis", location:"Both", roles:["Kitchen", "Barista"], days:["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"], hours:39, note:"I am going backpack travelling from the 20th March-7th June so I\u2019ll be back and ready to work full-time again from the 8th June as I\u2019m not going to uni in September I\u2019ll be completing online courses. | I couldn\u2019t submit the form without pressing a day, but I am available all days of the week. \nJust some weekends I go to see my boyfriend and his family who live an hour away from me." },
  { id:5, name:"Elliot Johnston", location:"Both", roles:["Barista", "Pizza"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sun"], hours:33, note:"Thurday and Tuesday evening unavailable | Rugby" },
  { id:6, name:"Grace Adamson", location:"Both", roles:["Kitchen", "FOH"], days:["Mon", "Tue", "Wed", "Sat"], hours:28, note:"Saturdays when I don\u2019t have football (which I book off anyways) | My uni days and need one day off on the weekend (Sunday) as with uni aswell I need one day off a week" },
  { id:7, name:"Jude Stephens", location:"Oxted", roles:["Barista", "FOH"], days:["Mon", "Tue", "Thu", "Sun"], hours:24, note:"Can only work till 4pm | Not available 10/03-17/03 and 04/04" },
  { id:8, name:"Annie Ware", location:"Reigate", roles:["Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:34, note:"Any 3 full days . Plus extra when needed" },
  { id:9, name:"Amber Shorey", location:"Oxted", roles:["FOH"], days:["Thu", "Sat"], hours:16, note:"Monday afternoons, sometimes Friday evenings. My college timetable can change at any point with no warning, will let you know if this happens and my availability changes! | Can't do most Sundays." },
  { id:10, name:"Poppy McAllister", location:"Reigate", roles:["Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sun"], hours:22, note:"Can do the occasional Saturday for cover. | Mondays have a fortnightly appointment usually until 11." },
  { id:11, name:"Hollie Spencer", location:"Reigate", roles:["Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:28, note:"Available any day for part time hours weekly would rather do two week days one weekend day if available" },
  { id:12, name:"Elisa Yewman", location:"Oxted", roles:["Kitchen", "FOH", "Pizza"], days:["Fri", "Sat"], hours:16, note:"" },
  { id:13, name:"Issie Yewman", location:"Oxted", roles:["Kitchen", "Barista", "FOH", "Pizza"], days:["Wed", "Thu", "Fri", "Sun"], hours:20, note:"Up to three shifts a week so either two pizza shifts and one day shift or two day shifts and one pizza shift. | I work for my other job these days" },
  { id:14, name:"Olivia Hudson", location:"Oxted", roles:["FOH"], days:["Sun"], hours:8, note:"Pizzas nights if needed but exams are priority | School hours" },
  { id:15, name:"Emily Dayman", location:"Reigate", roles:["Kitchen", "Barista", "FOH"], days:["Mon", "Tue", "Wed", "Sat", "Sun"], hours:27, note:"I have another job so I have to work the days with them also. I message Lauren 2 weeks in advanced to let her know days I can and can\u2019t do, so this changes weekly. | At the moment I may not be available thurs and fri as I\u2019m looking at doing a teaching placement for two days a week, will confirm this in the next week. Also I\u2019d like to have some weekends off, ideally every second weekend so I can go and see the country (one reason I came to England)." },
  { id:16, name:"Afreen Karimi", location:"Oxted", roles:["Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:35, note:"Prefer day time shifts as caring for my grandparents" },
  { id:17, name:"Sam gardner", location:"Oxted", roles:["Kitchen", "Pizza"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], hours:30, note:"4-6 days preferred | From the 16/3 or 23/3 > im only available Thursday-sunday (3 days total please)" },
  { id:18, name:"Charlotte Good", location:"Reigate", roles:["Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:34, note:"5 days if possible please:) | If I could not do both weekend days all the time that would be lovely!" },
  { id:19, name:"Lucas Church-Wood", location:"Oxted", roles:["Pizza"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hours:0, note:"" },
  { id:20, name:"Ally", location:"Reigate", roles:["Kitchen", "Barista", "FOH"], days:["Mon", "Tue", "Wed", "Thu", "Fri", "Sun"], hours:0, note:"Netball commitment on saturdays until the 7 march and then can work saturdays | Netball" }
];

const DEFAULT_HOLIDAYS = [
  { id:1, staffId:4, name:"Sian Jarvis", from:"2026-03-20", to:"2026-06-07", type:"Travel", note:"Backpacking trip" },
  { id:2, staffId:20, name:"Ally", from:"2026-02-24", to:"2026-02-24", type:"Annual Leave", note:"" },
  { id:3, staffId:3, name:"Sam Gu", from:"2026-02-27", to:"2026-03-01", type:"Annual Leave", note:"" },
  { id:4, staffId:6, name:"Grace Adamson", from:"2026-02-28", to:"2026-03-01", type:"Annual Leave", note:"" },
  { id:5, staffId:10, name:"Poppy McAllister", from:"2026-02-28", to:"2026-03-01", type:"Annual Leave", note:"" },
  { id:6, staffId:7, name:"Jude Stephens", from:"2026-03-10", to:"2026-03-17", type:"Annual Leave", note:"" },
  { id:7, staffId:14, name:"Olivia Hudson", from:"2026-03-14", to:"2026-03-15", type:"Annual Leave", note:"" },
  { id:8, staffId:9, name:"Amber Shorey", from:"2026-03-14", to:"2026-03-14", type:"Annual Leave", note:"" },
  { id:9, staffId:2, name:"Flynn McRobbie", from:"2026-03-14", to:"2026-03-14", type:"Annual Leave", note:"" },
  { id:10, staffId:8, name:"Annie Ware", from:"2026-03-22", to:"2026-03-22", type:"Annual Leave", note:"" },
  { id:11, staffId:8, name:"Annie Ware", from:"2026-03-27", to:"2026-03-30", type:"Annual Leave", note:"" }
];

// ── Constants ────────────────────────────────────────────────────────────────
const ALL_DAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const LEAVE_TYPES = ["Annual Leave","Sick Leave","Travel","Unavailable","Other"];
const ROLE_COLORS = { Kitchen:"#2e75b6", Barista:"#548235", Pizza:"#c55a11", FOH:"#7b3fa0" };
const LOC_ACCENT  = { Oxted:"#2e75b6", Reigate:"#548235", Both:"#7b3fa0" };
const TYPE_STYLE  = {
  "Annual Leave": { bg:"#1e3d1e", color:"#6abf6a", icon:"🌴" },
  "Sick Leave":   { bg:"#2a1010", color:"#e07070", icon:"🤒" },
  "Travel":       { bg:"#1e2e42", color:"#6aaee0", icon:"✈️" },
  "Unavailable":  { bg:"#2a1800", color:"#e09a50", icon:"🚫" },
  "Other":        { bg:"#222",    color:"#aaa",     icon:"📌" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(n) { return n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }
function fmt(d)      { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }
function fmtShort(d) { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
function daysBetween(a,b) { return Math.round((new Date(b)-new Date(a))/(864e5))+1; }

function weekDates(start) {
  return Array.from({length:7},(_,i)=>{
    const d=new Date(start); d.setDate(d.getDate()+i); return d.toISOString().slice(0,10);
  });
}
function isOffThisWeek(holidays, staffId, weekStart) {
  const dates = weekDates(weekStart);
  return holidays.some(h=>h.staffId===staffId && dates.some(d=>d>=h.from&&d<=h.to));
}
function holidaysThisWeek(holidays, weekStart) {
  const ws=new Date(weekStart), we=new Date(weekStart);
  we.setDate(we.getDate()+6);
  return holidays.filter(h=>new Date(h.from)<=we&&new Date(h.to)>=ws);
}

// ── Shared styles ────────────────────────────────────────────────────────────
const S = {
  label: { fontSize:11, color:"#777", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:5, display:"block" },
  input: { width:"100%", background:"#111", border:"1px solid #2a2a35", color:"#f0f0f0", padding:"9px 12px", borderRadius:8, fontSize:14, outline:"none", fontFamily:"inherit" },
  card:  { background:"#15151e", border:"1px solid #1f1f2e", borderRadius:12, padding:"18px 20px", position:"relative", overflow:"hidden" },
};

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  // Persistent state via localStorage
  const [staff,     setStaff]     = useState(() => JSON.parse(localStorage.getItem("rota_staff")     || "null") || DEFAULT_STAFF);
  const [holidays,  setHolidays]  = useState(() => JSON.parse(localStorage.getItem("rota_holidays")  || "null") || DEFAULT_HOLIDAYS);
  const [savedRotas,setSavedRotas]= useState(() => JSON.parse(localStorage.getItem("rota_saved")    || "[]"));

  useEffect(() => { localStorage.setItem("rota_staff",    JSON.stringify(staff));     }, [staff]);
  useEffect(() => { localStorage.setItem("rota_holidays", JSON.stringify(holidays));  }, [holidays]);
  useEffect(() => { localStorage.setItem("rota_saved",    JSON.stringify(savedRotas));}, [savedRotas]);

  const [view,       setView]      = useState("rota");
  const [rota,       setRota]      = useState(null);
  const [generating, setGenerating]= useState(false);
  const [progress,   setProgress]  = useState("");
  const [weekStart,  setWeekStart] = useState("2026-02-23");
  const [editStaff,  setEditStaff] = useState(null);
  const [showHolForm,setShowHolForm]=useState(false);
  const [toast,      setToast]     = useState(null);

  function notify(msg, type="ok") {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  async function generateRota() {
    setGenerating(true); setRota(null);
    const steps=["Checking holiday blocks…","Matching staff availability…","Applying coverage rules…","Building rota with AI…"];
    for (const s of steps) { setProgress(s); await new Promise(r=>setTimeout(r,550)); }

    const offThisWeek = staff.filter(s=>isOffThisWeek(holidays,s.id,weekStart));
    const holLines    = holidaysThisWeek(holidays,weekStart).map(h=>`${h.name}: OFF ${fmt(h.from)}–${fmt(h.to)} (${h.type}${h.note?" · "+h.note:""})`).join("\n") || "None.";

    const staffLines = staff.map(s=>{
      const off = offThisWeek.find(o=>o.id===s.id);
      const offTag = off ? " ⛔ ON LEAVE THIS WEEK — DO NOT SCHEDULE" : "";
      return `${s.name} | ${s.location} | Roles: ${s.roles.join(",")} | Days: ${s.days.join(",")}${s.note?" | "+s.note:""}${offTag}`;
    }).join("\n");

    const ws = new Date(weekStart);
    const we = new Date(weekStart); we.setDate(we.getDate()+6);
    const weekLabel = `${fmtShort(weekStart)} – ${fmt(we.toISOString().slice(0,10))}`;

    const system = `You are an expert staff rota scheduler for two cafés (Oxted + Reigate) and a Pizza service. 
Return ONLY valid JSON — no markdown, no explanation, no code fences.

HARD RULES (never break these):
1) Availability + leave:
   - Only schedule staff on their listed available days.
   - Never schedule anyone marked ⛔ ON LEAVE THIS WEEK.
2) Location:
   - Oxted-only staff → Oxted only; Reigate-only → Reigate only; Both → either site.
3) No overlaps:
   - Do not schedule the same person in overlapping times across any location.
   - Pizza staff cannot simultaneously work café during pizza hours (Thu–Sat 16:00–22:00).
4) Continuous role coverage (check by shift block and overlap):
   - CAFÉS: At ALL times during each café shift block (and overlaps), there must be ≥1 Kitchen + ≥1 Barista on duty.
   - PIZZA: At ALL times during each pizza shift block, there must be ≥2 Pizza-capable staff on duty.
5) Headcount requirements must be met exactly for each shift block (total staff assigned = requiredTotal).
6) Staff with "LAST RESORT" in their note = only use if no other option exists for that role/coverage.
7) Respect notes that add time restrictions (e.g., "Sat only from 17:00", "Tue/Thu evenings unavailable").

SHIFT REQUIREMENTS (by location, day, and shift block)
OXTED
- Mon: 08:30–16:00 (requiredTotal 3)
- Tue: 08:30–16:00 (requiredTotal 3)
- Wed: 08:30–16:00 (requiredTotal 3)
- Thu: 08:30–16:00 (requiredTotal 3)
- Fri: 08:30–16:00 (requiredTotal 3)
- Fri: 10:00–14:00 (requiredTotal 1)
- Sat: 08:00–16:00 (requiredTotal 2)
- Sat: 09:00–16:00 (requiredTotal 2)
- Sun: 09:30–14:00 (requiredTotal 4)

REIGATE
- Mon: 08:30–16:00 (requiredTotal 3)
- Tue: 08:30–16:00 (requiredTotal 3)
- Wed: 08:30–16:00 (requiredTotal 3)
- Thu: 08:30–16:00 (requiredTotal 3)
- Fri: 08:30–16:00 (requiredTotal 3)
- Fri: 10:00–14:00 (requiredTotal 1)
- Sat: 08:30–16:00 (requiredTotal 4)
- Sat: 10:00–14:00 (requiredTotal 1)
- Sun: 09:30–14:00 (requiredTotal 5)

PIZZA
- Thu: 11:00–22:00 (requiredTotal 1)  [setup / long shift]
- Thu: 16:00–22:00 (requiredTotal 2)
- Fri: 16:00–22:00 (requiredTotal 3)
- Sat: 16:00–22:00 (requiredTotal 3)

Return this exact JSON structure (all 7 days):
{
  "weekLabel": "${weekLabel}",
  "days": [
    {
      "dayName": "Mon",
      "dateISO": "YYYY-MM-DD",
      "dateLabel": "2 Mar",
      "oxted": {
        "shifts": [
          { "hours":"08:30–16:00", "requiredTotal":3, "minKitchen":1, "minBarista":1,
            "staff":[{"name":"Full Name","role":"Kitchen"}], "flags":[] }
        ],
        "flags":[]
      },
      "reigate": {
        "shifts": [
          { "hours":"08:30–16:00", "requiredTotal":3, "minKitchen":1, "minBarista":1,
            "staff":[{"name":"Full Name","role":"Barista"}], "flags":[] }
        ],
        "flags":[]
      },
      "pizza": {
        "shifts": [],
        "flags":[]
      }
    }
  ],
  "flags": ["Any overall warnings here"],
  "summary": "2-3 sentence plain English summary of the week"
}`;

    const user = `Generate a rota for the week of ${weekLabel}.

STAFF DATABASE:
${staffLines}

HOLIDAY BLOCKS THIS WEEK:
${holLines}

Schedule the optimal rota respecting all rules. Flag any coverage gaps or risks.`;

    try {
      const raw = await callClaude(system, user);
      let parsed;
      try {
        // Strip markdown fences
        let clean = raw.replace(/```json|```/g,"").trim();
        // Extract just the JSON object
        const start = clean.indexOf("{");
        const end = clean.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON object found");
        clean = clean.slice(start, end + 1);
        parsed = JSON.parse(clean);
      } catch(parseErr) {
        console.error("Parse error:", parseErr, "\nRaw response:", raw);
        notify("Rota generated but couldn\'t be displayed — try again","err");
        setGenerating(false); setProgress("");
        return;
      }
      setRota(parsed);
      // Auto-save rota
      const saved = { id:Date.now(), weekLabel, weekStart, rota:parsed, createdAt:new Date().toISOString() };
      setSavedRotas(prev=>[saved,...prev].slice(0,12));
      notify("Rota generated and saved ✓");
    } catch(e) {
      console.error(e);
      notify("Generation failed — check your API key or try again","err");
    }
    setGenerating(false); setProgress("");
  }

  // ── Staff ──────────────────────────────────────────────────────────────────
  function saveStaff(p) {
    if (p.id) { setStaff(prev=>prev.map(s=>s.id===p.id?p:s)); notify(`${p.name} updated`); }
    else       { setStaff(prev=>[...prev,{...p,id:Date.now()}]); notify(`${p.name} added to team`); }
    setEditStaff(null);
  }
  function removeStaff(id) {
    const p=staff.find(s=>s.id===id);
    if (!window.confirm(`Remove ${p.name} from the system?`)) return;
    setStaff(prev=>prev.filter(s=>s.id!==id));
    setHolidays(prev=>prev.filter(h=>h.staffId!==id));
    notify(`${p.name} removed`);
  }

  // ── Holidays ───────────────────────────────────────────────────────────────
  function addHoliday(h)    { setHolidays(prev=>[...prev,{...h,id:Date.now()}]); notify(`Holiday logged for ${h.name}`); }
  function removeHoliday(id){ setHolidays(prev=>prev.filter(h=>h.id!==id)); notify("Holiday block removed"); }

  const thisWeekHols = holidaysThisWeek(holidays, weekStart);

  return (
    <div style={{minHeight:"100vh",background:"#0d0d10",color:"#f0f0f0",fontFamily:"'DM Sans',sans-serif"}}>

      {/* Toast */}
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      {/* Header */}
      <header style={{background:"#11111a",borderBottom:"1px solid #1a1a28",padding:"0 28px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:58,maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#2e75b6,#548235)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>☕</div>
            <div>
              <div style={{fontWeight:800,fontSize:15,letterSpacing:"-0.3px"}}>RotaAI</div>
              <div style={{fontSize:9,color:"#444",marginTop:-2,textTransform:"uppercase",letterSpacing:"0.8px"}}>Oxted · Reigate · Pizza</div>
            </div>
          </div>

          <nav style={{display:"flex",gap:2}}>
            {[["rota","📋 Rota"],["staff","👥 Staff"],["holiday","🏖️ Holiday"],["history","🗂 History"]].map(([v,label])=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",
                background:view===v?"#2e75b6":"transparent",
                color:view===v?"#fff":"#555",fontWeight:view===v?700:400,
                fontSize:12,transition:"all 0.15s",fontFamily:"inherit",
              }}>{label}</button>
            ))}
          </nav>


        </div>
      </header>

      <main style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>

        {/* ── ROTA VIEW ──────────────────────────────────────────────────── */}
        {view==="rota"&&(
          <div>
            {/* Controls */}
            <div style={{display:"flex",alignItems:"flex-end",gap:14,marginBottom:20,flexWrap:"wrap"}}>
              <div>
                <span style={S.label}>Week starting</span>
                <input type="date" value={weekStart} onChange={e=>setWeekStart(e.target.value)}
                  style={{...S.input,width:"auto"}}/>
              </div>

              {/* Who's off badges */}
              <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",paddingBottom:2}}>
                {thisWeekHols.length>0&&<span style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px"}}>Off this week:</span>}
                {thisWeekHols.map(h=>{
                  const ts=TYPE_STYLE[h.type]||TYPE_STYLE.Other;
                  return <span key={h.id} style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:ts.bg,color:ts.color,border:`1px solid ${ts.color}33`}}>{ts.icon} {h.name.split(" ")[0]}</span>;
                })}
              </div>

              <button onClick={generateRota} disabled={generating} style={{
                display:"flex",alignItems:"center",gap:9,
                background:generating?"#1a1a22":"linear-gradient(135deg,#2e75b6,#1a5276)",
                color:"#fff",border:"none",padding:"10px 26px",borderRadius:10,
                fontWeight:700,fontSize:14,cursor:generating?"not-allowed":"pointer",
                boxShadow:generating?"none":"0 4px 20px rgba(46,117,182,0.35)",
                transition:"all 0.2s",fontFamily:"inherit",
              }}>
                {generating?<><Spinner/>{progress}</>:"✦ Generate Rota"}
              </button>
            </div>

            {/* Rota grid */}
            {rota&&!generating&&(
              <div>
                {rota.summary&&(
                  <div style={{background:"#0f1e10",border:"1px solid #548235",borderRadius:10,padding:"12px 18px",marginBottom:16,fontSize:13,color:"#8ecf8e",lineHeight:1.6}}>
                    📋 {rota.summary}
                  </div>
                )}
                {rota.flags?.length>0&&(
                  <div style={{background:"#1e1000",border:"1px solid #c55a11",borderRadius:10,padding:"12px 18px",marginBottom:16}}>
                    <div style={{fontWeight:700,color:"#c55a11",fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px"}}>⚠ Coverage Flags</div>
                    {rota.flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#d4896a",marginTop:3}}>• {f}</div>)}
                  </div>
                )}
                <RotaGrid rota={rota}/>
              </div>
            )}

            {!rota&&!generating&&(
              <div style={{textAlign:"center",padding:"80px 0",color:"#333"}}>
                <div style={{fontSize:52,marginBottom:14}}>📋</div>
                <div style={{fontSize:17,fontWeight:700,color:"#444",marginBottom:6}}>No rota generated yet</div>
                <div style={{fontSize:13,color:"#333"}}>Pick a week and hit Generate Rota</div>
              </div>
            )}
          </div>
        )}

        {/* ── STAFF VIEW ─────────────────────────────────────────────────── */}
        {view==="staff"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h2 style={{margin:0,fontSize:19,fontWeight:800}}>Staff</h2>
                <div style={{fontSize:12,color:"#555",marginTop:2}}>{staff.length} members · {staff.filter(s=>!s.note?.includes("LAST RESORT")).length} regular</div>
              </div>
              <button onClick={()=>setEditStaff({name:"",location:"Oxted",roles:[],days:[],hours:0,note:""})}
                style={{background:"linear-gradient(135deg,#548235,#2d5a1e)",color:"#fff",border:"none",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                + Add Staff Member
              </button>
            </div>
            <StaffGrid staff={staff} holidays={holidays} onEdit={setEditStaff} onRemove={removeStaff}/>
          </div>
        )}

        {/* ── HOLIDAY VIEW ───────────────────────────────────────────────── */}
        {view==="holiday"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h2 style={{margin:0,fontSize:19,fontWeight:800}}>Holiday & Leave</h2>
                <div style={{fontSize:12,color:"#555",marginTop:2}}>{holidays.length} block{holidays.length!==1?"s":""} logged</div>
              </div>
              <button onClick={()=>setShowHolForm(true)}
                style={{background:"linear-gradient(135deg,#c55a11,#7b2d00)",color:"#fff",border:"none",padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                + Add Holiday
              </button>
            </div>

            <div style={{background:"#0f1e10",border:"1px solid #548235",borderRadius:10,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:18}}>💡</span>
              <div style={{fontSize:13,color:"#8ecf8e",lineHeight:1.5}}>
                Any holiday logged here is <strong>automatically excluded</strong> from the rota when you generate. Just add the dates and generate — no manual steps needed.
              </div>
            </div>

            <HolidayList holidays={holidays} onRemove={removeHoliday}/>
          </div>
        )}

        {/* ── HISTORY VIEW ───────────────────────────────────────────────── */}
        {view==="history"&&(
          <div>
            <div style={{marginBottom:20}}>
              <h2 style={{margin:0,fontSize:19,fontWeight:800}}>Rota History</h2>
              <div style={{fontSize:12,color:"#555",marginTop:2}}>{savedRotas.length} rota{savedRotas.length!==1?"s":""} saved</div>
            </div>
            {savedRotas.length===0?(
              <div style={{textAlign:"center",padding:"60px 0",color:"#333"}}>
                <div style={{fontSize:40,marginBottom:12}}>🗂</div>
                <div style={{fontSize:14,color:"#444"}}>No rotas saved yet — generate one to see it here</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {savedRotas.map(r=>(
                  <div key={r.id} style={{...S.card,display:"flex",alignItems:"center",gap:16,cursor:"pointer"}}
                    onClick={()=>{ setRota(r.rota); setWeekStart(r.weekStart); setView("rota"); }}>
                    <div style={{width:40,height:40,borderRadius:9,background:"linear-gradient(135deg,#2e75b6,#1a5276)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📋</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{r.weekLabel}</div>
                      <div style={{fontSize:11,color:"#555",marginTop:2}}>Generated {new Date(r.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    <div style={{fontSize:12,color:"#2e75b6",fontWeight:600}}>View →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showHolForm&&<HolidayModal staff={staff} onAdd={h=>{addHoliday(h);setShowHolForm(false);}} onClose={()=>setShowHolForm(false)}/>}
      {editStaff&&<StaffModal person={editStaff} onSave={saveStaff} onClose={()=>setEditStaff(null)}/>}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        button:not(:disabled):hover{filter:brightness(1.08)}
        select option{background:#1a1a22}
      `}</style>
    </div>
  );
}

// ── Rota Grid ────────────────────────────────────────────────────────────────
function RotaGrid({rota}) {
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"80px repeat(7,1fr)",gap:6,minWidth:820}}>
        <div/>
        {rota.days.map((d,i)=>{
          const wknd=["Sat","Sun"].includes(d.dayName);
          return (
            <div key={i} style={{background:wknd?"#191e2e":"#141420",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${wknd?"#2e75b622":"#1a1a28"}`}}>
              <div style={{fontWeight:700,fontSize:13,color:wknd?"#2e75b6":"#bbb"}}>{d.dayName}</div>
              <div style={{fontSize:10,color:"#444",marginTop:1}}>{d.dateLabel || d.date}</div>
            </div>
          );
        })}

        {[
          {key:"oxted",  label:"☕ OXTED",  sub:"café",   color:"#2e75b6", bg:"#0d1b2a"},
          {key:"reigate",label:"☕ REIGATE",sub:"café",   color:"#548235", bg:"#0d1f0d"},
          {key:"pizza",  label:"🍕 PIZZA",  sub:"evening",color:"#c55a11", bg:"#1c0e00"},
        ].map(loc=>(
          <>
            <div key={loc.key+"L"} style={{display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,fontSize:10,color:loc.color,lineHeight:1.3}}>{loc.label}</div>
                <div style={{fontSize:9,color:"#333"}}>{loc.sub}</div>
              </div>
            </div>
            {rota.days.map((day,i)=>(
              <ServiceCell key={i} service={day[loc.key]} color={loc.color} bg={loc.bg}/>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

// ── Service Cell ─────────────────────────────────────────────────────────────
function ServiceCell({service,color,bg}) {
  const shifts = service?.shifts || (service?.hours ? [{ hours: service.hours, staff: service.staff || [], flags: service.flags || [] }] : []);
  const empty  = !shifts.length || shifts.every(sh => !sh.staff?.length);
  const flagged = (service?.flags?.length>0) || shifts.some(sh => sh.flags?.length>0);

  return (
    <div style={{background:empty?"#0a0a0f":bg,border:`1px solid ${flagged?"#c55a11":empty?"#111":color+"22"}`,borderRadius:8,padding:"8px 9px",minHeight:85}}>
      {empty
        ? <div style={{color:"#1e1e2e",fontSize:10,textAlign:"center",paddingTop:20,fontStyle:"italic"}}>—</div>
        : <>
            {shifts.map((sh,si)=> {
              const shFlagged = sh.flags?.length>0;
              return (
                <div key={si} style={{borderTop: si===0 ? "none" : `1px dashed ${color}22`, paddingTop: si===0 ? 0 : 7, marginTop: si===0 ? 0 : 7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{fontSize:9,color:color,fontWeight:700,opacity:0.75}}>{sh.hours}</div>
                    {typeof sh.requiredTotal === "number" && (
                      <div style={{marginLeft:"auto",fontSize:9,color:"#444"}}>{(sh.staff?.length||0)}/{sh.requiredTotal}</div>
                    )}
                  </div>

                  {sh.staff?.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                      <div style={{width:15,height:15,borderRadius:3,background:color+"20",border:`1px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,fontWeight:800,color,flexShrink:0}}>
                        {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <span style={{fontSize:10,color:"#ccc",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name.split(" ")[0]}</span>
                      <span style={{fontSize:8,color:"#3a3a4a",marginLeft:"auto",whiteSpace:"nowrap"}}>{s.role}</span>
                    </div>
                  ))}

                  {shFlagged && <div style={{marginTop:4,fontSize:9,color:"#c55a11",padding:"2px 5px",background:"#1e0800",borderRadius:3}}>⚠ {sh.flags[0]}</div>}
                </div>
              );
            })}
            {service?.flags?.length>0 && <div style={{marginTop:6,fontSize:9,color:"#c55a11",padding:"2px 5px",background:"#1e0800",borderRadius:3}}>⚠ {service.flags[0]}</div>}
          </>
      }
    </div>
  );
}

// ── Staff Grid ───────────────────────────────────────────────────────────────
 ───────────────────────────────────────────────────────────────
function StaffGrid({staff,holidays,onEdit,onRemove}) {
  const today=new Date().toISOString().slice(0,10);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10}}>
      {staff.map(p=>{
        const acc=LOC_ACCENT[p.location]||"#888";
        const onHol=holidays.some(h=>h.staffId===p.id&&today>=h.from&&today<=h.to);
        const lastResort=p.note?.includes("LAST RESORT");
        return (
          <div key={p.id} style={{...S.card,opacity:onHol?0.72:1,borderColor:lastResort?"#c55a1133":"#1f1f2e"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:lastResort?"#c55a11":acc}}/>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${acc},${acc}55)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>
                {initials(p.name)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                <div style={{fontSize:11,color:"#555",marginTop:1}}>{p.location} · {p.hours}h/wk</div>
              </div>
              {onHol&&<span style={{fontSize:9,background:"#2a1000",color:"#c55a11",padding:"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>On leave</span>}
              {lastResort&&<span style={{fontSize:9,background:"#1a0a0a",color:"#c55a11",padding:"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>Last resort</span>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
              {p.roles.map(r=><span key={r} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:ROLE_COLORS[r]+"1a",color:ROLE_COLORS[r],border:`1px solid ${ROLE_COLORS[r]}33`,textTransform:"uppercase",letterSpacing:"0.3px"}}>{r}</span>)}
            </div>
            <div style={{display:"flex",gap:3,marginBottom:p.note?8:10}}>
              {ALL_DAYS.map(d=><div key={d} style={{width:25,height:19,borderRadius:3,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",background:p.days.includes(d)?acc+"1a":"#0d0d12",color:p.days.includes(d)?acc:"#222",border:`1px solid ${p.days.includes(d)?acc+"33":"#181820"}`}}>{d[0]}</div>)}
            </div>
            {p.note&&<div style={{fontSize:10,color:"#555",fontStyle:"italic",marginBottom:10}}>ℹ {p.note}</div>}
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>onEdit(p)} style={{flex:1,background:"#1a1a28",border:"1px solid #242435",color:"#999",padding:"6px 0",borderRadius:7,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
              <button onClick={()=>onRemove(p.id)} style={{background:"#1a0f0f",border:"1px solid #3a1818",color:"#c07070",padding:"6px 12px",borderRadius:7,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Holiday List ─────────────────────────────────────────────────────────────
function HolidayList({holidays,onRemove}) {
  const today=new Date().toISOString().slice(0,10);
  if (!holidays.length) return (
    <div style={{textAlign:"center",padding:"60px 0",color:"#333"}}>
      <div style={{fontSize:40,marginBottom:12}}>🏖️</div>
      <div style={{fontSize:14,color:"#444"}}>No holiday blocks logged yet</div>
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {["Active","Upcoming","Past"].map(group=>{
        const items=holidays.filter(h=>{
          if (group==="Active")   return h.from<=today&&h.to>=today;
          if (group==="Upcoming") return h.from>today;
          return h.to<today;
        });
        if (!items.length) return null;
        return (
          <div key={group}>
            <div style={{fontSize:10,fontWeight:700,color:"#444",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6,marginTop:8}}>{group}</div>
            {items.map(h=>{
              const ts=TYPE_STYLE[h.type]||TYPE_STYLE.Other;
              const days=daysBetween(h.from,h.to);
              return (
                <div key={h.id} style={{background:"#12121a",border:"1px solid #1a1a28",borderRadius:10,padding:"13px 15px",display:"flex",alignItems:"center",gap:13,borderLeft:`4px solid ${ts.color}`}}>
                  <div style={{width:34,height:34,borderRadius:8,flexShrink:0,background:`${ts.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{ts.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontWeight:700,fontSize:14}}>{h.name}</span>
                      <span style={{fontSize:10,background:ts.bg,color:ts.color,padding:"1px 7px",borderRadius:20,fontWeight:600}}>{h.type}</span>
                    </div>
                    <div style={{fontSize:12,color:"#666"}}>
                      {fmt(h.from)} → {fmt(h.to)}
                      <span style={{color:"#444",marginLeft:8}}>{days} day{days!==1?"s":""}</span>
                      {h.note&&<span style={{color:"#444",marginLeft:8}}>· {h.note}</span>}
                    </div>
                  </div>
                  <button onClick={()=>onRemove(h.id)} style={{background:"#1a0f0f",border:"1px solid #3a1818",color:"#c07070",padding:"5px 12px",borderRadius:7,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontWeight:600,fontFamily:"inherit"}}>Remove</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Modals ───────────────────────────────────────────────────────────────────
function Modal({children,onClose,title,width=480}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#13131c",border:"1px solid #222230",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:17}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#444",fontSize:22,cursor:"pointer",lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HolidayModal({staff,onAdd,onClose}) {
  const [f,setF]=useState({staffId:"",from:"",to:"",type:"Annual Leave",note:""});
  const sel=staff.find(s=>s.id===Number(f.staffId));
  const days=f.from&&f.to?daysBetween(f.from,f.to):0;
  function submit() {
    if (!f.staffId||!f.from||!f.to){alert("Please fill in all fields");return;}
    if (f.to<f.from){alert("End date must be after start date");return;}
    onAdd({...f,staffId:Number(f.staffId),name:sel.name});
  }
  return (
    <Modal title="Add Holiday / Leave" onClose={onClose}>
      <div style={{marginBottom:14}}>
        <span style={S.label}>Staff Member *</span>
        <select value={f.staffId} onChange={e=>setF(p=>({...p,staffId:e.target.value}))} style={{...S.input,cursor:"pointer"}}>
          <option value="">Select staff member…</option>
          {staff.map(s=><option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {[["From *","from"],["To *","to"]].map(([label,key])=>(
          <div key={key}>
            <span style={S.label}>{label}</span>
            <input type="date" value={f[key]} onChange={e=>setF(p=>({...p,[key]:e.target.value}))} style={S.input}/>
          </div>
        ))}
      </div>
      {days>0&&<div style={{background:"#0f1e10",border:"1px solid #548235",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#8ecf8e",fontWeight:600}}>📅 {days} day{days!==1?"s":""} · {fmtShort(f.from)} to {fmtShort(f.to)}</div>}
      <div style={{marginBottom:14}}>
        <span style={S.label}>Type</span>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {LEAVE_TYPES.map(t=>{const ts=TYPE_STYLE[t];return(
            <button key={t} onClick={()=>setF(p=>({...p,type:t}))} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${f.type===t?ts.color:"#2a2a35"}`,background:f.type===t?ts.bg:"#111",color:f.type===t?ts.color:"#555",fontWeight:f.type===t?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              {ts.icon} {t}
            </button>
          );})}
        </div>
      </div>
      <div style={{marginBottom:22}}>
        <span style={S.label}>Note (optional)</span>
        <input value={f.note} onChange={e=>setF(p=>({...p,note:e.target.value}))} placeholder="e.g. Pre-approved annual leave" style={S.input}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,background:"#1a1a22",border:"1px solid #2a2a35",color:"#777",padding:"11px 0",borderRadius:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Cancel</button>
        <button onClick={submit} style={{flex:2,background:"linear-gradient(135deg,#c55a11,#7b2d00)",color:"#fff",border:"none",padding:"11px 0",borderRadius:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Save Holiday Block</button>
      </div>
    </Modal>
  );
}

function StaffModal({person,onSave,onClose}) {
  const [f,setF]=useState({...person});
  const toggleDay  = d=>setF(p=>({...p,days:  p.days.includes(d)?  p.days.filter(x=>x!==d):  [...p.days,d]}));
  const toggleRole = r=>setF(p=>({...p,roles: p.roles.includes(r)? p.roles.filter(x=>x!==r): [...p.roles,r]}));
  return (
    <Modal title={person.id?"Edit Staff Member":"Add Staff Member"} onClose={onClose}>
      <div style={{marginBottom:14}}>
        <span style={S.label}>Full Name</span>
        <input value={f.name||""} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="e.g. Jane Smith" style={S.input}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div>
          <span style={S.label}>Location</span>
          <div style={{display:"flex",gap:5}}>
            {["Oxted","Reigate","Both"].map(l=><button key={l} onClick={()=>setF(p=>({...p,location:l}))} style={{flex:1,padding:"8px 0",borderRadius:7,border:`1px solid ${f.location===l?LOC_ACCENT[l]:"#2a2a35"}`,background:f.location===l?LOC_ACCENT[l]+"22":"#111",color:f.location===l?LOC_ACCENT[l]:"#555",fontWeight:f.location===l?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
          </div>
        </div>
        <div>
          <span style={S.label}>Hours / Week</span>
          <input type="number" value={f.hours||""} onChange={e=>setF(p=>({...p,hours:Number(e.target.value)}))} style={S.input}/>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <span style={S.label}>Roles</span>
        <div style={{display:"flex",gap:6}}>
          {["Kitchen","Barista","Pizza","FOH"].map(r=><button key={r} onClick={()=>toggleRole(r)} style={{flex:1,padding:"8px 0",borderRadius:7,border:`1px solid ${f.roles.includes(r)?ROLE_COLORS[r]:"#2a2a35"}`,background:f.roles.includes(r)?ROLE_COLORS[r]+"1a":"#111",color:f.roles.includes(r)?ROLE_COLORS[r]:"#555",fontWeight:f.roles.includes(r)?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{r}</button>)}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <span style={S.label}>Available Days</span>
        <div style={{display:"flex",gap:5}}>
          {ALL_DAYS.map(d=><button key={d} onClick={()=>toggleDay(d)} style={{flex:1,padding:"8px 0",borderRadius:7,border:`1px solid ${f.days.includes(d)?"#2e75b6":"#2a2a35"}`,background:f.days.includes(d)?"#2e75b61a":"#111",color:f.days.includes(d)?"#2e75b6":"#555",fontWeight:f.days.includes(d)?700:400,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{d}</button>)}
        </div>
      </div>
      <div style={{marginBottom:22}}>
        <span style={S.label}>Notes</span>
        <input value={f.note||""} onChange={e=>setF(p=>({...p,note:e.target.value}))} placeholder="e.g. Thu–Sat only, no Crystal Palace home game Saturdays" style={S.input}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,background:"#1a1a22",border:"1px solid #2a2a35",color:"#777",padding:"11px 0",borderRadius:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>Cancel</button>
        <button onClick={()=>onSave(f)} style={{flex:2,background:"linear-gradient(135deg,#2e75b6,#1a5276)",color:"#fff",border:"none",padding:"11px 0",borderRadius:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{person.id?"Save Changes":"Add Staff Member"}</button>
      </div>
    </Modal>
  );
}

// ── Utility components ───────────────────────────────────────────────────────
function Toast({msg,type}) {
  return (
    <div style={{position:"fixed",top:18,right:18,zIndex:9999,background:type==="err"?"#4a0f0f":"#0f2d1a",color:"#fff",padding:"11px 20px",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 24px rgba(0,0,0,0.6)",animation:"toastIn 0.25s ease",border:`1px solid ${type==="err"?"#7a2020":"#2a5a2a"}`}}>
      {type==="err"?"⚠ ":"✓ "}{msg}
    </div>
  );
}

function Spinner() {
  return <div style={{width:13,height:13,border:"2px solid #ffffff30",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>;
}
