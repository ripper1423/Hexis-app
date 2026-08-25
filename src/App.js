// probe2
// probe
imgPos="center 72%"// cache-bust
import { useState, useEffect } from 'react';
import { PROFILES, WORKOUTS, MEALS, getTodayWorkout, getTodayIndex, getCardioProtocol, getMobilityProtocol } from './data/profiles';
import { BREATHING_PROTOCOLS, SLEEP_PREP } from './data/wellness';
import {
  saveProfile, loadProfile, savePlan, loadPlan, saveUserData, loadUserData,
  saveHabits, loadHabits, saveExercises, loadExercises,
  saveWater, loadWater, saveWeight, loadWeightLog,
  updateStreak, loadStreak, clearAll,
  ensureCloudSession, syncProfileToCloud, logExerciseToCloud, logWeightToCloud,
  fetchSubscriptionTier, redeemProCode,
  saveSetLog, loadSetLogs, removeSetLog, saveVo2Test, loadVo2Log, logVo2ToCloud,
  saveGoalWeight, loadGoalWeight, saveSteps, loadStepsLog, saveSleep, loadSleepLog, logWellnessToCloud,
  saveCycle, loadCycle, saveMirrorEntry, loadMirrorLog,
  getAccountStatus, linkEmailToAccount, restoreAccountByEmail,
  fetchCloudProfile, fetchCloudHistory, restoreLocalLogs,
  uploadProgressPhoto, fetchProgressPhotos, deleteProgressPhoto
} from './storage';
import { getAdaptiveWeight, weeklyVolume, weeklyEffort, fatigueRatio, vo2Category, weeklyCaloriesBurned, weeklySleep, volumeByMuscleGroup, weightTrend, computeHexisAge } from './adaptive';
import { computeCoherenceScore, MIRROR_PROMPTS } from './coherence';
import { getRecoveryStatus } from './recovery';
import { CYCLES, applyCycleMacros, getCycleProgress } from './cycles';
import { analyzePhotoRemote } from './api';
import { EXERCISES, MUSCLE_GROUPS } from './data/exercises';
import { FOODS, SUPPLEMENTS, MACRO_INFO } from './data/foods';

// ── ACCESO DE PROPIETARIO (testing interno) ─────────────────────────
// Visitar la app una vez con ?hexisOwner=<token> desbloquea HEXIS PRO
// de forma permanente en ESE dispositivo/navegador (queda guardado en
// localStorage, no depende de cuenta ni de conexión). Pensado solo para
// que el propio equipo pueda probar la app en cualquier móvil/ordenador
// sin canjear un código cada vez. No lo compartas: cualquiera con este
// enlace desbloquea PRO gratis en su dispositivo.
const OWNER_UNLOCK_TOKEN = 'hx-oscar-9f31c7';
const OWNER_UNLOCK_KEY = 'hexis_owner_unlocked';
function checkOwnerUnlock() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('hexisOwner') === OWNER_UNLOCK_TOKEN) {
      localStorage.setItem(OWNER_UNLOCK_KEY, '1');
    }
    return localStorage.getItem(OWNER_UNLOCK_KEY) === '1';
  } catch (e) {
    return false;
  }
}

const G = "#C8AA50";
const PF = "'Playfair Display',Georgia,serif";
const BG = "#050505";

// ── CONSTANTS ────────────────────────────────────────────────────
const PRINCIPLES = [
  {n:"01",title:"Identidad antes que resultado",body:"No 'quiero perder 10kg'. Sino 'soy alguien que cuida su cuerpo'. Cada pequeña acción vota por quien estás eligiendo ser. La identidad cambia por repetición, no por intensidad puntual.",icon:"🧠"},
  {n:"02",title:"Sistemas antes que motivación",body:"La motivación aparece y desaparece. Un sistema bien diseñado funciona cuando la motivación no está. HEXIS es ese sistema. Diseñado para trabajar con tu naturaleza, no contra ella.",icon:"⚙️"},
  {n:"03",title:"Pequeños pasos antes que cambios extremos",body:"Lo que no se siente como esfuerzo se repite. Lo que se repite se consolida. Lo que se consolida transforma. La acumulación silenciosa es el método más poderoso.",icon:"🔄"},
  {n:"04",title:"Coherencia antes que perfección",body:"Un día malo no rompe el proceso. HEXIS está construido para humanos reales. El sistema absorbe los fallos y continúa. Las personas perfectas no existen.",icon:"🛡"},
  {n:"05",title:"Medir para entender, no para obsesionar",body:"Solo mostramos las métricas que generan acción útil. Peso como tendencia. Macros como guía. Consistencia como foco principal.",icon:"📊"},
  {n:"06",title:"Eficiencia humana",body:"Máximo resultado útil. Mínima fricción innecesaria. Tu cuerpo lleva millones de años perfeccionando este principio. HEXIS no lucha contra eso. Lo usa.",icon:"⚡"},
];

const TIPS = [
  {tag:"Ciencia",icon:"🔬",color:"#C8AA50",title:"Tensión mecánica real",body:"La hipertrofia ocurre cuando el músculo se contrae bajo carga suficiente con rango completo. No es el peso, es la tensión. Siente el músculo, no solo mueves el peso."},
  {tag:"Nutrición",icon:"🍽",color:"#A09060",title:"El anabolic window ya no existe",body:"Tienes 4-6 horas post-entreno para la proteína, no 30 minutos. Lo que sí importa es el total diario: 1.6-2.4g/kg de proteína en 3-4 comidas."},
  {tag:"Descanso",icon:"🌙",color:"#8BA4A0",title:"El músculo crece dormido",body:"La mayoría de los pulsos de hormona de crecimiento nocturnos ocurren en sueño profundo, sobre todo en las primeras horas de la noche. Sin 7-8h, el mejor entreno rinde muy por debajo de su potencial. Optimiza el sueño antes que el entreno."},
  {tag:"Hábitos",icon:"🔄",color:"#D4C5A9",title:"La regla de los 2 minutos",body:"Si un hábito tarda menos de 2 minutos en iniciarse, hazlo ahora. La acción mínima mantiene la identidad activa cada día."},
  {tag:"Mental",icon:"🧠",color:"#C8AA50",title:"El efecto identidad",body:"Cuando seas 'alguien que entrena', no necesitarás motivación. La identidad lo hace automático. No esperes motivación — actúa hasta crearla."},
  {tag:"Eficiencia",icon:"⚡",color:"#A09060",title:"El mínimo efectivo",body:"3-4 series por grupo muscular con buena ejecución producen el 80% de la adaptación. El volumen extra tiene rendimientos decrecientes."},
  {tag:"Tracking",icon:"📊",color:"#8BA4A0",title:"Media móvil semanal",body:"Pésate cada mañana en ayunas y calcula el promedio de 7 días. Ese número elimina el ruido de agua, sal y digestión. La tendencia es tu progreso real."},
  {tag:"Filosofía",icon:"🏛",color:"#C8AA50",title:"Kalokagathia aplicada",body:"Los griegos no separaban físico y carácter. Cuidar tu cuerpo con inteligencia no es vanidad, es coherencia. El físico es la expresión visible de cómo te tratas a ti mismo."},
  {tag:"Ciencia",icon:"🚶",color:"#8BA4A0",title:"NEAT: el gasto que no ves",body:"El 15-30% de tu gasto calórico diario no viene del entreno, sino del movimiento espontáneo: subir escaleras, caminar, moverte sin pensarlo. Sube tus pasos diarios y el déficit se sostiene sin necesitar más cardio estructurado."},
  {tag:"Ciencia",icon:"🔥",color:"#A09060",title:"HIIT vs. LISS: no compiten, se complementan",body:"El HIIT quema más por minuto y genera EPOC (sigues gastando horas después), pero fatiga más y puede interferir con la recuperación de fuerza. El LISS es más suave y no compite con tus ganancias. El sistema real usa ambos según la semana, no uno solo para siempre."},
  {tag:"Respiración",icon:"🫁",color:"#8BA4A0",title:"La técnica que más rápido te calma",body:"Un estudio de Stanford comparó 4 técnicas de respiración y meditación: la que más bajó la frecuencia respiratoria y más subió el ánimo en una sola sesión fue el 'suspiro fisiológico' — 2 inhalaciones seguidas por la nariz y una exhalación larga por la boca. 3-5 rondas bastan."},
];

const DAILY_QUOTES = [
  "La identidad cambia por repetición, no por intensidad puntual.",
  "Complejo por dentro. Simple por fuera. Eso es HEXIS.",
  "No necesitas motivación. Necesitas un sistema.",
  "Lo que no se mide, no puede mejorar.",
  "El músculo crece cuando descansas, no cuando entrenas.",
  "Máximo resultado útil. Mínima fricción innecesaria.",
  "Un día malo no rompe el proceso. Solo lo pausa.",
];

const FEELINGS = [
  {id:"strong",l:"Fuerza",i:"bolt",d:"Potencia y control"},
  {id:"light",l:"Ligereza",i:"leaf",d:"Sin peso ni tensión"},
  {id:"focused",l:"Enfoque",i:"target",d:"Claridad mental"},
  {id:"confident",l:"Seguridad",i:"shield",d:"Confianza real"},
  {id:"energetic",l:"Energía",i:"flame",d:"Vitalidad constante"},
  {id:"balanced",l:"Equilibrio",i:"scale",d:"Mente y cuerpo"},
];
const OBSTACLES = [
  {id:"notime",l:"No tengo tiempo",i:"hourglass"},
  {id:"noconstancy",l:"Me cuesta ser constante",i:"wreath"},
  {id:"confused",l:"No sé por dónde empezar",i:"labyrinth"},
  {id:"stress",l:"El estrés me bloquea",i:"spiral"},
  {id:"eating",l:"No controlo lo que como",i:"kylix"},
  {id:"motivation",l:"Pierdo la motivación",i:"column"},
];
// Iconos: recortes reales de las referencias griegas grabadas en plata que
// diste (no son un dibujo aproximado — son la imagen exacta, con fondo
// transparente y color intercambiable según selección).
function ThemeIcon({name,size=24,selected=false}){
  return(
    <img
      src={`/icons/${name}_${selected?"gold":"default"}.png`}
      alt=""
      style={{display:"block",margin:"0 auto",width:size,height:"auto",filter:"drop-shadow(0 1px 1px rgba(0,0,0,0.7))"}}
    />
  );
}

const typeIcon = {train:"💪",rest:"🌙",cardio:"🏃",mobility:"🧘"};
const levelColor = {Principiante:"#8BA4A0",Intermedio:"#C8AA50",Avanzado:"#D4C5A9"};
const sectionColor = {proteina:"#C8AA50",carbohidratos:"#A09060",verduras:"#5a7a5a",grasas:"#8BA4A0"};
const sectionLabel = {proteina:"Proteína",carbohidratos:"Carbohidratos",verduras:"Verduras",grasas:"Grasas"};

const MALE_PROFILES=["ALPHA","SHAPE","ZEN"];
const FEMALE_PROFILES=["HERA","ATENEA","GAIA"];

function detect(f,o,gender){
  const allowed=gender==="female"?FEMALE_PROFILES:MALE_PROFILES;
  let best=allowed[0],top=-1;
  Object.entries(PROFILES).forEach(([id,p])=>{
    if(!allowed.includes(id))return;
    let s=0;
    f.forEach(x=>{if(p.feeling.includes(x))s+=2;});
    o.forEach(x=>{if(p.obstacle.includes(x))s+=1;});
    if(s>top){top=s;best=id;}
  });
  return best;
}

function calcPlan(d,id){
  const w=parseFloat(d.weight)||75,h=parseFloat(d.height)||175,a=parseFloat(d.age)||28,act=parseFloat(d.activity)||1.55;
  const bmr=d.gender==="female"?10*w+6.25*h-5*a-161:10*w+6.25*h-5*a+5;
  const tdee=Math.round(bmr*act);
  const m={ALPHA:1.095,HERA:0.9,ZEN:1,SHAPE:0.85,ATENEA:1.0,GAIA:0.95};
  // g de proteína por kg de peso/día. Rango general 1.4-2.0 g/kg (ISSN
  // Position Stand, Jäger et al. 2017) para quien entrena fuerza; sube a
  // 2.3-3.1 g/kg en fase de déficit para proteger la masa magra (mismo
  // documento). HERA y SHAPE están en déficit -> banda alta. ALPHA en
  // superávit se queda cerca del techo general para maximizar síntesis.
  const pg={ALPHA:2.2,HERA:2.3,ZEN:1.8,SHAPE:2.4,ATENEA:2.0,GAIA:1.9};
  const cal=Math.round(tdee*(m[id]||1));
  const prot=Math.round(w*(pg[id]||1.8));
  const fat=Math.round(cal*0.27/9);
  const carbs=Math.round((cal-prot*4-fat*9)/4);
  return {tdee,cal,prot,fat,carbs};
}

// ── SVG FIGURES ──────────────────────────────────────────────────
function FigW(){return(<svg viewBox="0 0 300 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}><defs><radialGradient id="fw" cx="50%" cy="28%" r="68%"><stop offset="0%" stopColor="#221808"/><stop offset="100%" stopColor="#050505"/></radialGradient></defs><rect width="300" height="480" fill="url(#fw)"/><ellipse cx="150" cy="100" rx="27" ry="33" fill="#1e1a10"/><ellipse cx="150" cy="96" rx="21" ry="25" fill="#231f13" opacity="0.8"/><rect x="130" y="130" width="40" height="22" rx="8" fill="#181410"/><rect x="122" y="150" width="56" height="85" rx="6" fill="#161208"/><rect x="94" y="156" width="24" height="68" rx="8" fill="#121008"/><rect x="182" y="156" width="24" height="68" rx="8" fill="#121008"/><ellipse cx="106" cy="172" rx="13" ry="15" fill="#1a1610" opacity="0.7"/><ellipse cx="194" cy="172" rx="13" ry="15" fill="#1a1610" opacity="0.7"/><rect x="126" y="233" width="22" height="95" rx="7" fill="#111008"/><rect x="152" y="233" width="22" height="95" rx="7" fill="#111008"/><rect x="182" y="185" width="3" height="120" rx="1" fill="#C8AA50" opacity="0.35"/><text x="150" y="455" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C8AA50" opacity="0.18" letterSpacing="7">HEXIS</text></svg>)}
function FigG(){return(<svg viewBox="0 0 300 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}><defs><radialGradient id="fgo" cx="50%" cy="25%" r="68%"><stop offset="0%" stopColor="#1a1408"/><stop offset="100%" stopColor="#050505"/></radialGradient></defs><rect width="300" height="480" fill="url(#fgo)"/><ellipse cx="150" cy="100" rx="22" ry="28" fill="#1c1810"/><ellipse cx="150" cy="86" rx="26" ry="14" fill="#161210"/><path d="M120 142 Q150 130 180 142 L190 270 Q150 285 110 270 Z" fill="#141210"/><path d="M110 155 Q92 175 88 215 L110 222 Z" fill="#121008"/><path d="M190 155 Q208 175 212 215 L190 222 Z" fill="#121008"/><path d="M110 268 Q150 286 190 268 L196 400 Q150 414 104 400 Z" fill="#111008"/><text x="150" y="455" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C8AA50" opacity="0.18" letterSpacing="7">HEXIS</text></svg>)}
function FigA(){return(<svg viewBox="0 0 300 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}><defs><radialGradient id="fat" cx="50%" cy="20%" r="72%"><stop offset="0%" stopColor="#221a08"/><stop offset="100%" stopColor="#060606"/></radialGradient></defs><rect width="300" height="480" fill="url(#fat)"/><ellipse cx="150" cy="96" rx="28" ry="34" fill="#201c0e"/><ellipse cx="150" cy="140" rx="46" ry="17" fill="#1c1810"/><ellipse cx="132" cy="172" rx="19" ry="22" fill="#181408"/><ellipse cx="168" cy="172" rx="19" ry="22" fill="#181408"/><rect x="132" y="192" width="12" height="9" rx="4" fill="#161206"/><rect x="156" y="192" width="12" height="9" rx="4" fill="#161206"/><rect x="132" y="205" width="12" height="9" rx="4" fill="#141004"/><rect x="156" y="205" width="12" height="9" rx="4" fill="#141004"/><rect x="128" y="228" width="22" height="105" rx="8" fill="#111008"/><rect x="150" y="228" width="22" height="105" rx="8" fill="#111008"/><text x="150" y="455" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C8AA50" opacity="0.18" letterSpacing="7">HEXIS</text></svg>)}

// Fotos reales de estatua por arquetipo — ya en blanco y negro, brillo
// igualado entre las 6 y fondo fundido a negro (procesadas fuera de la app,
// nada de recorte de silueta para evitar bordes/halos raros).
function ArchImg({src,pos}){
  return <img src={src} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:pos}}/>;
}
const FIGS={
  ALPHA:()=><ArchImg src="/estatuas/arquetipo_alpha_v2.png" pos="50% 0%"/>,
  HERA:()=><ArchImg src="/estatuas/arquetipo_hera.png" pos="50% 0%"/>,
  ZEN:()=><ArchImg src="/estatuas/arquetipo_zen.png" pos="50% 0%"/>,
  SHAPE:()=><ArchImg src="/estatuas/arquetipo_shape.png" pos="50% 0%"/>,
  ATENEA:()=><ArchImg src="/estatuas/arquetipo_atenea.png" pos="50% 0%"/>,
  GAIA:()=><ArchImg src="/estatuas/arquetipo_gaia.png" pos="50% 0%"/>,
};

// ── UI COMPONENTS ────────────────────────────────────────────────
function Hero({Fig,img,imgPos,children,h=220}){
  return(
    <div style={{position:"relative",height:h,overflow:"hidden",flexShrink:0,background:BG}}>
      {img?(
        <img src={img} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:imgPos||"center 20%",filter:"grayscale(35%) brightness(0.8)"}}/>
      ):(
        <Fig/>
      )}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(5,5,5,0) 20%,rgba(5,5,5,0.8) 65%,rgba(5,5,5,1) 100%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 18px",zIndex:3}}>{children}</div>
    </div>
  );
}

function PBar({pct,h=3,fixed=false}){
  const s=fixed?{position:"fixed",top:0,left:0,right:0,height:h,background:"#111",zIndex:100}:{background:"#111",borderRadius:100,height:h,overflow:"hidden"};
  return(<div style={s}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${G},#E8C870)`,transition:"width 0.4s",borderRadius:100}}/></div>);
}

function MacroGrid({cal,prot,carbs,fat,color}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
      {[[cal,"kcal","Cal",color||G],[prot,"g","Prot","#fff"],[carbs,"g","Carb","#fff"],[fat,"g","Grasa","#fff"]].map(([v,u,l,c])=>(
        <div key={l} style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:10,padding:"11px 6px",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
          <div style={{fontSize:11,color:"#8a8a8a"}}>{u}</div>
          <div style={{fontSize:8,letterSpacing:1,color:"#787878",textTransform:"uppercase",marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Quote({text,attr,color=G}){
  return(
    <div style={{borderLeft:`2px solid ${color}`,background:"#080808",borderRadius:"0 10px 10px 0",padding:16,marginBottom:10}}>
      <div style={{fontFamily:PF,fontSize:13,fontStyle:"italic",color:"#777",lineHeight:1.7}}>{text}</div>
      {attr&&<div style={{fontSize:11,color:"#7a7a7a",letterSpacing:2,marginTop:8,textTransform:"uppercase"}}>— {attr}</div>}
    </div>
  );
}

function SLabel({text,right}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>{text}</div>
      {right&&<div style={{fontSize:11,color:"#8a8a8a"}}>{right}</div>}
    </div>
  );
}

// ── RANK BADGE — XP, nivel e insignias del día ──────────────────
const RANK_BADGES=[
  {id:"entreno_completo",label:"Entreno completo",icon:"🏋️",check:s=>s.exTotal>0&&s.exDone===s.exTotal},
  {id:"habitos",label:"Hábitos del día",icon:"✅",check:s=>s.habitsTotal>0&&s.habitsDone===s.habitsTotal},
  {id:"hidratacion",label:"Hidratación al día",icon:"💧",check:s=>s.water>=8},
  {id:"constancia",label:"Constancia activa",icon:"🔥",check:s=>s.streakDay>=3},
];
function computeRank({habitsDone,exDone,water}){
  const xp=habitsDone*10+exDone*15+Math.min(water,8)*3;
  const level=Math.floor(xp/100)+1;
  const progress=xp%100;
  return{xp,level,progress};
}
function RankBadge({color,habitsDone,habitsTotal,exDone,exTotal,water,streakDay}){
  const state={habitsDone,habitsTotal,exDone,exTotal,water,streakDay};
  const{level,progress}=computeRank(state);
  const unlocked=RANK_BADGES.filter(b=>b.check(state));
  return(
    <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:14,padding:16,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{flexShrink:0,border:`1.5px solid ${color}`,borderRadius:10,padding:"8px 12px",fontFamily:PF,fontWeight:700,fontSize:15,color,textAlign:"center"}}>Nv. {level}</div>
        <div style={{flex:1}}>
          <div style={{height:8,background:"#1a1a1a",borderRadius:100,overflow:"hidden",marginBottom:5}}>
            <div style={{height:"100%",borderRadius:100,width:`${progress}%`,background:color,transition:"width 0.4s"}}/>
          </div>
          <div style={{fontSize:11,color:"#8a8a8a"}}>{progress} / 100 XP para el siguiente nivel</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
        {RANK_BADGES.map(b=>{
          const on=unlocked.some(u=>u.id===b.id);
          return(
            <div key={b.id} title={b.label} style={{flexShrink:0,width:68,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 6px",borderRadius:10,background:on?"rgba(200,170,80,0.08)":"#151515",opacity:on?1:0.4,filter:on?"none":"grayscale(1)"}}>
              <span style={{fontSize:18}}>{b.icon}</span>
              <span style={{fontSize:8.5,color:"#ccc",textAlign:"center",lineHeight:1.2}}>{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LOGROS AUTOMÁTICOS — cruces de datos ya trackeados, sin input nuevo ──
// Complementa a RankBadge (que mira hábitos/entreno/hidratación/racha corta)
// con señales que solo se ven cruzando varias fuentes: pasos, sueño,
// esfuerzo real y si el peso avanza hacia la meta.
const AUTO_ACHIEVEMENTS=[
  {id:"pasos",label:"Objetivo de pasos",icon:"🚶",check:s=>s.avgSteps>0&&s.avgSteps>=s.stepsTarget},
  {id:"sueno",label:"Sueño 7h+",icon:"🌙",check:s=>s.avgSleep>=7},
  {id:"esfuerzo",label:"Esfuerzo real alto",icon:"⚡",check:s=>s.effortLast!=null&&s.effortLast>=6},
  {id:"racha7",label:"7+ días de racha",icon:"🔥",check:s=>s.streakDay>=7},
  {id:"peso",label:"Rumbo a tu meta",icon:"🎯",check:s=>s.weightOnTrack===true},
];
function AutoAchievements({stats,color}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(96px,1fr))",gap:8}}>
      {AUTO_ACHIEVEMENTS.map(a=>{
        const on=a.check(stats);
        return(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,background:on?"rgba(200,170,80,0.06)":"#0c0c0c",border:`1px solid ${on?color+"55":"#161616"}`,borderRadius:10,padding:"9px 10px"}}>
            <span style={{fontSize:14,opacity:on?1:0.35}}>{a.icon}</span>
            <span style={{fontSize:10.5,color:on?"#ddd":"#555",lineHeight:1.25}}>{a.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── SCORE DE COHERENCIA — ¿tus acciones encajan con tu identidad? ──
function CoherenceCard({archetype,color,stats}){
  const {score,label,color:tierColor,pillars}=computeCoherenceScore(archetype,stats);
  return(
    <div style={{background:"#0c0c0c",border:`1px solid ${tierColor}55`,borderRadius:14,padding:16,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
        <div style={{flexShrink:0,width:56,height:56,borderRadius:"50%",border:`2px solid ${tierColor}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:tierColor}}>{score}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,letterSpacing:3,color:tierColor,textTransform:"uppercase",marginBottom:2}}>Score de Coherencia</div>
          <div style={{fontSize:15,fontWeight:700}}>{label}</div>
          <div style={{fontSize:11,color:"#666",marginTop:2}}>¿Tus acciones de hoy encajan con quien eliges ser?</div>
        </div>
      </div>
      {pillars.map((pl,i)=>(
        <div key={i} style={{marginBottom:i===pillars.length-1?0:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <div style={{fontSize:11,color:"#aaa"}}>{pl.label}</div>
            <div style={{fontSize:11,color:"#666"}}>{pl.pct}%</div>
          </div>
          <div style={{height:5,background:"#1a1a1a",borderRadius:100,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pl.pct}%`,background:color,borderRadius:100,transition:"width 0.4s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── RECOVERY INTEGRADO — ¿hoy toca empujar o descansar? ──────────
function RecoveryCard({archetype,fatigue,avgSleep}){
  const r=getRecoveryStatus(archetype,fatigue,avgSleep);
  if(!r.hasData){
    return(
      <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
        <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>🔋 Recovery</div>
        <div style={{fontSize:12,color:"#666",lineHeight:1.6}}>Registra un par de entrenos y tus horas de sueño en Métricas para que HEXIS te diga si hoy toca empujar o descansar.</div>
      </div>
    );
  }
  return(
    <div style={{background:"#0c0c0c",border:`1px solid ${r.color}55`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{fontSize:18}}>🔋</div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,letterSpacing:3,color:r.color,textTransform:"uppercase"}}>Recovery de hoy</div>
          <div style={{fontSize:14,fontWeight:700}}>{r.label}</div>
        </div>
      </div>
      <div style={{fontSize:12,color:"#aaa",lineHeight:1.7}}>{r.message}</div>
      {r.level==='high'&&(()=>{const br=BREATHING_PROTOCOLS.sigh;return(
        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1a1a1a"}}>
          <div style={{fontSize:10,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>🫁 {br.label}</div>
          <div style={{fontSize:11,color:"#888",lineHeight:1.6}}>{br.protocol}</div>
        </div>
      );})()}
    </div>
  );
}

// ── ESPEJO DE COHERENCIA — cierre diario, opcional, nunca obligatorio ─
function MirrorScreen({onBack,isPro,onUnlocked,archetype,color,stats,mirrorLog,onSave}){
  const today=new Date().toISOString().split('T')[0];
  const already=mirrorLog.find(e=>e.date===today);
  const [note,setNote]=useState(already?.note||'');
  const [saved,setSaved]=useState(!!already);

  if(!isPro){
    return(
      <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
            <div style={{fontSize:16,fontWeight:700}}>Espejo de Coherencia</div>
          </div>
        </div>
        <div style={{padding:20}}>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7,marginBottom:16}}>Un cierre de día opcional que resume si tus acciones encajaron con tu identidad — es una función de HEXIS PRO.</div>
          <ProCodeInput onUnlocked={onUnlocked}/>
        </div>
      </div>
    );
  }

  const {score,label,color:tierColor,pillars}=computeCoherenceScore(archetype,stats);
  const prompt=MIRROR_PROMPTS[archetype]||MIRROR_PROMPTS.ALPHA;
  const recent=mirrorLog.slice(-7);
  const maxScore=Math.max(...recent.map(e=>e.score),1);

  const handleSave=()=>{
    const log=saveMirrorEntry({date:today,note:note.trim(),score,label});
    onSave(log);
    setSaved(true);
  };

  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
          <div style={{fontSize:16,fontWeight:700}}>Espejo de Coherencia</div>
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:80,height:80,borderRadius:"50%",border:`2px solid ${tierColor}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
            <div style={{fontSize:26,fontWeight:900,color:tierColor}}>{score}</div>
          </div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{label}</div>
          <div style={{fontSize:11,color:"#666"}}>Tu coherencia de hoy</div>
        </div>

        {pillars.map((pl,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <div style={{fontSize:11,color:"#aaa"}}>{pl.label}</div>
              <div style={{fontSize:11,color:"#666"}}>{pl.pct}%</div>
            </div>
            <div style={{height:5,background:"#1a1a1a",borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pl.pct}%`,background:color,borderRadius:100}}/>
            </div>
          </div>
        ))}

        <div style={{borderLeft:`2px solid ${color}`,background:"#080808",borderRadius:"0 10px 10px 0",padding:16,margin:"20px 0"}}>
          <div style={{fontFamily:PF,fontSize:15,fontStyle:"italic",color:"#ccc",lineHeight:1.6,marginBottom:12}}>{prompt}</div>
          <textarea
            value={note}
            onChange={e=>{setNote(e.target.value);setSaved(false);}}
            placeholder="Escribe algo si te apetece — o deja esto en blanco y guarda igual."
            rows={3}
            style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"10px 12px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:13,outline:"none",resize:"none"}}
          />
        </div>

        <div onClick={handleSave} style={{textAlign:"center",padding:"13px",borderRadius:8,background:saved?"#111":color,color:saved?"#8a8a8a":"#050505",fontSize:12,fontWeight:700,letterSpacing:1,cursor:"pointer",marginBottom:24}}>
          {saved?"✓ Día cerrado":"Cerrar el día"}
        </div>

        {recent.length>0&&(
          <>
            <SLabel text="Últimos días" right="Score de Coherencia"/>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
                {recent.map((e,i)=>(
                  <div key={e.date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:8,color:"#666"}}>{e.score}</div>
                    <div style={{width:"100%",height:Math.max(4,Math.round((e.score/maxScore)*44)),background:i===recent.length-1?color:"#1a1a1a",borderRadius:3}}/>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{fontSize:10,color:"#555",marginTop:16,textAlign:"center",lineHeight:1.6}}>Este espacio nunca es obligatorio. Un día sin cerrar no rompe nada.</div>
      </div>
    </div>
  );
}

// ── ANÁLISIS DE FOTOS CON IA (plato / físico) ─────────────────────
function AnalyzeScreen({onBack,isPro,onUnlocked,color}){
  const [mode,setMode]=useState('plato');
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);

  const onFileChange=(e)=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const onAnalyze=async()=>{
    if(!file||loading)return;
    setLoading(true);
    const res=await analyzePhotoRemote(file,mode);
    setResult(res);
    setLoading(false);
  };

  if(!isPro){
    return(
      <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
            <div style={{fontSize:16,fontWeight:700}}>Análisis con IA</div>
          </div>
        </div>
        <div style={{padding:20}}>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7,marginBottom:16}}>Sube una foto de tu plato o tu físico y recibe un desglose — es una función de HEXIS PRO.</div>
          <ProFeatureRow icon="📸" title="Análisis con IA" desc="Sube una foto de tu plato o tu físico y recibe un desglose visual." unlocked={false}/>
          <div style={{height:12}}/>
          <ProCodeInput onUnlocked={onUnlocked}/>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
          <div style={{fontSize:16,fontWeight:700}}>Análisis con IA</div>
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["plato","🍽 Plato"],["fisico","🏋️ Físico"]].map(([id,label])=>(
            <div key={id} onClick={()=>{setMode(id);setResult(null);}} style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${mode===id?color:"#1a1a1a"}`,background:mode===id?"rgba(200,170,80,0.08)":"transparent",color:mode===id?color:"#666"}}>{label}</div>
          ))}
        </div>

        <label style={{display:"block",border:"1px dashed #333",borderRadius:12,padding:preview?0:30,textAlign:"center",cursor:"pointer",marginBottom:16,overflow:"hidden"}}>
          <input type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{display:"none"}}/>
          {preview?(
            <img src={preview} alt="" style={{width:"100%",display:"block",maxHeight:280,objectFit:"cover"}}/>
          ):(
            <div style={{fontSize:12,color:"#666"}}>📷 Toca para subir una foto {mode==="plato"?"de tu plato":"de tu físico"}</div>
          )}
        </label>

        {file&&(
          <div onClick={onAnalyze} style={{textAlign:"center",padding:"13px",borderRadius:8,background:loading?"#111":color,color:loading?"#555":"#050505",fontSize:12,fontWeight:700,letterSpacing:1,cursor:loading?"default":"pointer",marginBottom:16}}>
            {loading?"Analizando...":"Analizar con IA"}
          </div>
        )}

        {result&&(
          <div style={{background:"#0c0c0c",border:`1px solid ${result.ok?"rgba(200,170,80,0.3)":"#333"}`,borderRadius:12,padding:"14px 16px"}}>
            {result.ok?(
              <>
                <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:8}}>Análisis</div>
                <div style={{fontSize:13,color:"#ccc",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{result.analysis}</div>
              </>
            ):(
              <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>{result.message||"El análisis con IA todavía no está disponible. Vuelve pronto."}</div>
            )}
          </div>
        )}

        <div style={{fontSize:10,color:"#555",marginTop:16,lineHeight:1.6}}>El análisis es orientativo (visual, no una medición exacta) y no sustituye el consejo de un profesional de nutrición o salud.</div>
      </div>
    </div>
  );
}

// ── FOTOS DE PROGRESO (Antes/Después) — HEXIS START ──────────────
// Disponible desde el plan base, igual que el registro de peso o
// hábitos. Fotos privadas (Supabase Storage, RLS por usuario) +
// feedback de texto opcional. No usa IA, es solo registro visual.
function ProgressPhotosScreen({onBack,userId,color}){
  const [photos,setPhotos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);
  const [pendingType,setPendingType]=useState(null); // 'antes' | 'despues' mientras se sube
  const [feedback,setFeedback]=useState('');
  const [weightInput,setWeightInput]=useState('');

  const reload=async()=>{
    if(!userId){setLoading(false);return;}
    setLoading(true);
    const list=await fetchProgressPhotos(userId);
    setPhotos(list);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{reload();},[]);

  const onFileChange=async(e,type)=>{
    const file=e.target.files&&e.target.files[0];
    e.target.value='';
    if(!file||!userId)return;
    setUploading(true);
    setPendingType(type);
    const w=parseFloat(weightInput);
    await uploadProgressPhoto(userId,file,{type,feedback:feedback.trim()||null,weightKg:(w&&w>20&&w<300)?w:null});
    setFeedback('');
    setWeightInput('');
    setUploading(false);
    setPendingType(null);
    reload();
  };

  const onDelete=async(photo)=>{
    setPhotos(prev=>prev.filter(p=>p.id!==photo.id));
    await deleteProgressPhoto(photo.id,photo.storage_path);
  };

  const antes=photos.filter(p=>p.photo_type==='antes');
  const despues=photos.filter(p=>p.photo_type==='despues');

  const UploadCard=({type,label,icon,list})=>(
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:8}}>{icon} {label}</div>
      <label style={{display:"block",border:"1px dashed #333",borderRadius:12,padding:list.length?0:20,textAlign:"center",cursor:uploading?"default":"pointer",marginBottom:10,overflow:"hidden",minHeight:list.length?0:90}}>
        <input type="file" accept="image/*" capture="environment" disabled={uploading} onChange={e=>onFileChange(e,type)} style={{display:"none"}}/>
        {uploading&&pendingType===type?(
          <div style={{fontSize:11,color:"#666",padding:"30px 0"}}>Subiendo...</div>
        ):(
          <div style={{fontSize:11,color:"#666",padding:list.length?"12px 0":"28px 0"}}>📷 Añadir foto {label.toLowerCase()}</div>
        )}
      </label>
      {list.slice().reverse().map(ph=>(
        <div key={ph.id} style={{position:"relative",marginBottom:8}}>
          {ph.url?(
            <img src={ph.url} alt="" style={{width:"100%",borderRadius:10,display:"block"}}/>
          ):(
            <div style={{width:"100%",height:120,background:"#0c0c0c",borderRadius:10}}/>
          )}
          <div onClick={()=>onDelete(ph)} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:11,background:"rgba(0,0,0,0.6)",color:"#e0a0a0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</div>
          <div style={{fontSize:10,color:"#666",marginTop:4}}>{ph.log_date}{ph.weight_kg?` · ${ph.weight_kg}kg`:""}</div>
          {ph.feedback&&<div style={{fontSize:11,color:"#999",marginTop:2,lineHeight:1.5,fontStyle:"italic"}}>"{ph.feedback}"</div>}
        </div>
      ))}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:color||G,textTransform:"uppercase"}}>Progreso visual</div>
          <div style={{fontSize:16,fontWeight:700}}>Antes / Después</div>
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{fontSize:12,color:"#888",lineHeight:1.7,marginBottom:16}}>Sube fotos para comparar tu progreso a lo largo del tiempo. Son privadas — solo tú puedes verlas.</div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#666",marginBottom:6}}>Peso el día de la foto (opcional)</div>
          <input
            type="number"
            placeholder="Ej: 74.5"
            value={weightInput}
            onChange={e=>setWeightInput(e.target.value)}
            style={{width:"100%",background:"#111",border:"1px solid #1a1a1a",borderRadius:6,padding:"8px 12px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:13,outline:"none",marginBottom:10}}
          />
          <div style={{fontSize:11,color:"#666",marginBottom:6}}>Feedback / cómo te sientes (opcional)</div>
          <textarea
            placeholder="Ej: Más definido, con más energía por las mañanas..."
            value={feedback}
            onChange={e=>setFeedback(e.target.value)}
            rows={2}
            style={{width:"100%",background:"#111",border:"1px solid #1a1a1a",borderRadius:6,padding:"8px 12px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:13,outline:"none",resize:"vertical"}}
          />
        </div>

        {loading?(
          <div style={{fontSize:12,color:"#555",textAlign:"center",padding:"30px 0"}}>Cargando...</div>
        ):(
          <div style={{display:"flex",gap:14}}>
            <UploadCard type="antes" label="Antes" icon="◐" list={antes}/>
            <UploadCard type="despues" label="Después" icon="◑" list={despues}/>
          </div>
        )}

        <div style={{fontSize:10,color:"#555",marginTop:20,lineHeight:1.6}}>El feedback es opcional y solo lo ves tú — no se comparte ni se analiza automáticamente.</div>
      </div>
    </div>
  );
}

// ── HEXIS PRO — funciones futuras visibles con candado ──────────
// Sustituye esta URL por el checkout real del upgrade en Hotmart cuando exista.
const PRO_UPGRADE_URL="https://pay.hotmart.com/K107168260M";
const PRO_FEATURES=[
  {icon:"🧬",title:"Arquitectura de Dominio",desc:"Ciclos reales (Hipertrofia, Definición, Fuerza, Salud, Rendimiento, Mantenimiento) en vez de un plan fijo."},
  {icon:"📈",title:"Motor adaptativo",desc:"Tu entreno evoluciona con tu progreso real, no con un split fijo por arquetipo."},
  {icon:"🎯",title:"Score de Coherencia",desc:"Mide si tus acciones diarias encajan con tu identidad y tu arquetipo."},
  {icon:"🔋",title:"Recovery integrado",desc:"Reglas de descanso y recuperación personalizadas por arquetipo."},
  {icon:"📸",title:"Análisis con IA",desc:"Sube una foto de tu plato o tu físico y recibe un desglose visual."},
];
function ProFeatureRow({icon,title,desc,unlocked}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,background:"#0c0c0c",border:`1px solid ${unlocked?"rgba(200,170,80,0.2)":"#1a1a1a"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,opacity:unlocked?1:0.75}}>
      <div style={{fontSize:18,flexShrink:0,filter:unlocked?"none":"grayscale(0.3)"}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,color:unlocked?"#ddd":"#bbb",marginBottom:2}}>{title}</div>
        <div style={{fontSize:11,color:"#666",lineHeight:1.4}}>{desc}</div>
      </div>
      <div style={{fontSize:14,color:unlocked?G:"#555",flexShrink:0}}>{unlocked?"✓":"🔒"}</div>
    </div>
  );
}
const PRO_CODE_ERRORS={
  invalid_code:"Ese código no existe. Revisa que lo hayas copiado bien.",
  already_used:"Ese código ya se ha usado antes.",
  no_session:"No se pudo conectar con tu perfil. Prueba de nuevo en unos segundos.",
};
// Campo reutilizable para introducir el código PRO — se usa tanto en la
// pestaña Inicio (ProTeaser) como en Perfil ("Tu plan"), mismo mecanismo.
function ProCodeInput({onUnlocked,compact}){
  const[showInput,setShowInput]=useState(false);
  const[code,setCode]=useState('');
  const[status,setStatus]=useState(null); // null | 'checking' | 'error'
  const[errMsg,setErrMsg]=useState('');

  const submit=async()=>{
    if(!code.trim())return;
    setStatus('checking');setErrMsg('');
    const res=await redeemProCode(code.trim());
    if(res.ok){
      setStatus(null);
      onUnlocked&&onUnlocked();
    }else{
      setStatus('error');
      setErrMsg(PRO_CODE_ERRORS[res.error]||"No se pudo validar el código. Inténtalo de nuevo.");
    }
  };

  if(showInput){
    return(
      <div style={{marginBottom:compact?0:12}}>
        <input
          type="text"
          placeholder="HEXIS-PRO-XXXXXX"
          value={code}
          onChange={e=>setCode(e.target.value.toUpperCase())}
          style={{...inp,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}
        />
        {status==='error'&&<div style={{fontSize:11,color:"#c86a6a",marginBottom:8}}>{errMsg}</div>}
        <Btn label={status==='checking'?"Comprobando...":"Desbloquear"} onClick={submit} disabled={status==='checking'}/>
      </div>
    );
  }
  return(
    <>
      <div onClick={()=>setShowInput(true)} style={{textAlign:"center",fontSize:11,color:G,padding:"10px 0",cursor:"pointer"}}>¿Ya tienes tu código?</div>
      {!compact&&(
        <a href={PRO_UPGRADE_URL} target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block"}}>
          <Btn label="Quiero actualizar a PRO"/>
        </a>
      )}
    </>
  );
}
function ProTeaser({isPro,onUnlocked}){
  return(
    <>
      <SLabel text="HEXIS PRO" right={isPro?"Activo":"Próximamente"}/>
      <div style={{background:"rgba(200,170,80,0.05)",border:"1px solid rgba(200,170,80,0.15)",borderRadius:12,padding:"14px 16px 4px",marginBottom:16}}>
        <div style={{fontSize:11,color:"#8a8a8a",lineHeight:1.6,marginBottom:12}}>
          {isPro
            ?"Tienes PRO activo. Estas funciones se irán activando dentro de la app a medida que se construyan."
            :"El sistema completo, más allá del plan inicial. Estas funciones se irán desbloqueando en próximas versiones."}
        </div>
        {PRO_FEATURES.map((f,i)=>(<ProFeatureRow key={i} {...f} unlocked={isPro}/>))}
        {!isPro&&<ProCodeInput onUnlocked={onUnlocked}/>}
      </div>
    </>
  );
}

// Vincular email — para no perder los datos si el usuario cambia de móvil,
// borra el navegador o reinstala. Solo lo pide una vez, sin contraseña.
function AccountLinkCard(){
  const[status,setStatus]=useState(null); // null (cargando) | { linked, email }
  const[showInput,setShowInput]=useState(false);
  const[email,setEmail]=useState('');
  const[sendState,setSendState]=useState('idle'); // idle | sending | sent | error
  const[errMsg,setErrMsg]=useState('');

  useEffect(()=>{ getAccountStatus().then(setStatus); },[]);

  const submit=async()=>{
    if(!email.trim())return;
    setSendState('sending');setErrMsg('');
    const res=await linkEmailToAccount(email.trim());
    if(res.ok){ setSendState('sent'); }
    else{ setSendState('error'); setErrMsg(res.error||''); }
  };

  if(!status)return null;

  return(
    <>
      <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:10}}>Tu email</div>
      <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:24}}>
        {status.linked?(
          <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>
            Cuenta vinculada a <strong style={{color:"#ccc"}}>{status.email}</strong>. Si cambias de móvil, entra en "¿Ya tienes cuenta?" al abrir la app por primera vez y recuperarás todo tu historial.
          </div>
        ):sendState==='sent'?(
          <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>
            Te hemos enviado un enlace a <strong style={{color:"#ccc"}}>{email}</strong>. Ábrelo para confirmar y no perder tus datos si cambias de móvil.
          </div>
        ):showInput?(
          <>
            <input style={inp} type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            {sendState==='error'&&<div style={{fontSize:11,color:"#c86a6a",marginBottom:8}}>No se pudo vincular{errMsg?`: ${errMsg}`:''}.</div>}
            <Btn label={sendState==='sending'?"Enviando...":"Vincular este email"} onClick={submit} disabled={sendState==='sending'||!email.trim()}/>
          </>
        ):(
          <>
            <div style={{fontSize:12,color:"#888",lineHeight:1.6,marginBottom:12}}>Tus datos solo están en este dispositivo salvo que vincules un email. Sin contraseña, sin fricción — solo para poder recuperarlos si cambias de móvil.</div>
            <div onClick={()=>setShowInput(true)} style={{textAlign:"center",padding:"12px",borderRadius:8,border:`1px solid ${G}`,color:G,fontSize:12,fontWeight:600,letterSpacing:1,cursor:"pointer"}}>Vincular mi email</div>
          </>
        )}
      </div>
    </>
  );
}

function Btn({label,onClick,disabled,color=G,outline=false}){
  return(
    <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:15,background:disabled?"#111":outline?"transparent":`linear-gradient(135deg,${color},${color}bb)`,border:outline?`1px solid ${color}`:"none",borderRadius:4,color:disabled?"#333":outline?color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",marginBottom:8}}>{label}</button>
  );
}

const inp={width:"100%",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"12px 14px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:14,outline:"none",marginBottom:12,appearance:"none",display:"block"};

// ── BODY MAP ─────────────────────────────────────────────────────
// ── CUERPO GRIEGO INTERACTIVO ──────────────────────────────────────
// Antes era una silueta plana de color piso. Ahora es la ilustración
// anatómica real (encargo propio, línea blanca sobre fondo oscuro,
// estilo estatua clásica) con las mismas zonas clicables de siempre —
// la interacción no cambia, solo deja de parecer un boceto.
function BodyMap({gender,view,activeZone,onZoneClick}){
  // 18 ago — ampliado de 8 a 20 zonas siguiendo los 20 grupos reales del
  // esquema anatómico de Oscar. No todos los 21 grupos de MUSCLE_GROUPS
  // tienen rectángulo propio: trapecio (completo), glúteo superior,
  // glúteo inferior, sóleo y "otros" se solapan casi por completo con
  // zonas vecinas en una silueta plana (ej. sóleo vive debajo del gemelo,
  // no hay forma de recortarlos aparte sin amontonar rectángulos
  // imposibles de tocar con el dedo) — esos grupos se filtran igual desde
  // los chips de músculo debajo del mapa, que cubren los 21 sin excepción.
  const zones = view==="front" ? [
    {id:"deltoides",x:22,y:24,w:13,h:8,label:"Deltoides"},
    {id:"deltoides",x:65,y:24,w:13,h:8,label:"Deltoides"},
    {id:"pectoral",x:34,y:25,w:31,h:12,label:"Pectoral"},
    {id:"serrato",x:25,y:34,w:9,h:9,label:"Serrato"},
    {id:"serrato",x:68,y:34,w:9,h:9,label:"Serrato"},
    {id:"biceps",x:13,y:33,w:12,h:13,label:"Bíceps"},
    {id:"biceps",x:80,y:33,w:12,h:13,label:"Bíceps"},
    {id:"abdominales",x:37,y:40,w:26,h:13,label:"Abdominales"},
    {id:"cuadriceps",x:31,y:56,w:17,h:12,label:"Cuádriceps"},
    {id:"cuadriceps",x:52,y:56,w:17,h:12,label:"Cuádriceps"},
    {id:"tibial_anterior",x:33,y:69,w:13,h:17,label:"Tibial anterior"},
    {id:"tibial_anterior",x:54,y:69,w:13,h:17,label:"Tibial anterior"},
  ] : [
    {id:"deltoides",x:19,y:24,w:13,h:7,label:"Deltoides"},
    {id:"deltoides",x:68,y:24,w:13,h:7,label:"Deltoides"},
    {id:"trapecio_alto",x:42,y:23,w:16,h:6,label:"Trapecio superior"},
    {id:"espalda_media",x:36,y:29,w:28,h:9,label:"Espalda media"},
    {id:"espalda_baja",x:36,y:38,w:28,h:5,label:"Espalda baja"},
    {id:"dorsal",x:20,y:29,w:16,h:14,label:"Dorsal"},
    {id:"dorsal",x:64,y:29,w:16,h:14,label:"Dorsal"},
    {id:"triceps",x:10,y:32,w:11,h:15,label:"Tríceps"},
    {id:"triceps",x:79,y:32,w:11,h:15,label:"Tríceps"},
    {id:"gluteo_mayor",x:31,y:43,w:38,h:11,label:"Glúteo mayor"},
    {id:"gluteo_medio",x:22,y:42,w:10,h:9,label:"Glúteo medio"},
    {id:"gluteo_medio",x:68,y:42,w:10,h:9,label:"Glúteo medio"},
    {id:"isquiotibiales",x:31,y:54,w:17,h:13,label:"Isquiotibiales"},
    {id:"isquiotibiales",x:52,y:54,w:17,h:13,label:"Isquiotibiales"},
    {id:"gemelos",x:33,y:69,w:13,h:17,label:"Gemelos"},
    {id:"gemelos",x:54,y:69,w:13,h:17,label:"Gemelos"},
  ];
  // Sufijo _v2 (24 ago) para forzar refresco — Cloudflare cacheaba en el
  // edge la imagen anterior en la misma ruta y el navegador la seguía
  // sirviendo aunque el archivo en GitHub ya fuera el nuevo.
  const img = gender==="female"
    ? (view==="front" ? "/estatuas/cuerpo_mujer_frente_v2.png" : "/estatuas/cuerpo_mujer_espalda_v2.png")
    : (view==="front" ? "/estatuas/cuerpo_hombre_frente_v2.png" : "/estatuas/cuerpo_hombre_espalda_v2.png");
  // Las 4 imágenes (18 ago) vienen del mismo recorte 347×954 — mismo
  // aspect-ratio para las 4, así las zonas (en %) no se desplazan.
  const [dw,dh]=[347,954];
  const az = zones.find(z=>z.id===activeZone);
  return(
    <div style={{position:"relative",width:"100%",maxWidth:220,aspectRatio:`${dw} / ${dh}`,margin:"0 auto"}}>
      <img src={img} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      {zones.map((z,i)=>(
        <div key={i} onClick={()=>onZoneClick(z.id)} style={{position:"absolute",left:`${z.x}%`,top:`${z.y}%`,width:`${z.w}%`,height:`${z.h}%`,cursor:"pointer"}}/>
      ))}
      {az&&(
        <>
          <div style={{position:"absolute",left:`calc(${az.x+az.w/2}% - 7px)`,top:`calc(${az.y+az.h/2}% - 7px)`,width:14,height:14,borderRadius:"50%",background:"#fff",boxShadow:"0 0 14px 4px rgba(255,255,255,0.85), 0 0 30px 12px rgba(255,255,255,0.3)",zIndex:5,pointerEvents:"none"}}/>
          <div style={{position:"absolute",left:`calc(${az.x+az.w/2}% + 7px)`,top:`calc(${az.y+az.h/2}% - 21px)`,width:38,height:1,background:"#fff",opacity:0.75,transform:"rotate(-33deg)",transformOrigin:"0 0",zIndex:4,pointerEvents:"none"}}/>
          <div style={{position:"absolute",left:`calc(${az.x+az.w/2}% + 39px)`,top:`calc(${az.y+az.h/2}% - 42px)`,width:5,height:5,borderRadius:"50%",background:"#fff",opacity:0.8,zIndex:4,pointerEvents:"none"}}/>
        </>
      )}
    </div>
  );
}

// Bottom sheet del músculo tocado — nombre + ejercicios relacionados
// (datos reales de EXERCISES, nada inventado). La sección "Funciones"
// queda pendiente del texto que dé Oscar por músculo.
function MuscleSheet({zone,onClose}){
  if(!zone) return null;
  const m=MUSCLE_GROUPS[zone];
  const exs=EXERCISES.filter(e=>e.muscle===zone);
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:90}}/>
      <div style={{position:"fixed",left:0,right:0,bottom:0,maxWidth:430,margin:"0 auto",background:"#0a0a0a",border:"1px solid #1a1a1a",borderBottom:"none",borderRadius:"20px 20px 0 0",padding:"20px 20px 28px",zIndex:91,maxHeight:"65vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontFamily:PF,fontSize:17,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{m.label}</div>
          <div onClick={onClose} style={{fontSize:16,color:"#666",cursor:"pointer",padding:"4px 6px"}}>✕</div>
        </div>
        <div style={{fontSize:10,letterSpacing:3,color:"#555",textTransform:"uppercase",marginBottom:8}}>Ejercicios relacionados</div>
        {exs.length===0?(
          <div style={{fontSize:12,color:"#555"}}>Aún no hay ejercicios de este grupo en la base de datos.</div>
        ):exs.map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 4px",borderBottom:"1px solid #161616"}}>
            <div style={{fontSize:18,flexShrink:0}}>{e.icon}</div>
            <div style={{flex:1,fontSize:12.5,fontWeight:600,color:"#ddd",letterSpacing:0.5,textTransform:"uppercase"}}>{e.name}</div>
            <div style={{fontSize:13,color:"#555"}}>›</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── PLATE MODEL ──────────────────────────────────────────────────
function PlateModel({active,onSection}){
  const secs=[
    {id:"proteina",path:"M50,50 L50,10 A40,40 0 0,1 90,50 Z",label:"Proteína",lx:74,ly:35},
    {id:"carbohidratos",path:"M50,50 L90,50 A40,40 0 0,1 50,90 Z",label:"Carbos",lx:74,ly:68},
    {id:"verduras",path:"M50,50 L50,90 A40,40 0 0,1 10,50 Z",label:"Verduras",lx:22,ly:68},
    {id:"grasas",path:"M50,50 L10,50 A40,40 0 0,1 50,10 Z",label:"Grasa",lx:24,ly:35},
  ];
  return(
    <svg viewBox="0 0 100 100" style={{width:"100%",maxWidth:200,display:"block",margin:"0 auto"}}>
      <circle cx="50" cy="50" r="42" fill="#111" stroke="#222" strokeWidth="1"/>
      {secs.map(s=>(
        <g key={s.id} onClick={()=>onSection(s.id)} style={{cursor:"pointer"}}>
          <path d={s.path} fill={sectionColor[s.id]} opacity={active===s.id?0.85:0.28}/>
          <path d={s.path} fill="none" stroke="#050505" strokeWidth="0.6"/>
          <text x={s.lx} y={s.ly} textAnchor="middle" fontSize="3.5" fill={active===s.id?"#fff":"#777"} fontFamily="sans-serif">{s.label}</text>
        </g>
      ))}
      <circle cx="50" cy="50" r="17" fill="#080808" stroke="#1a1a1a" strokeWidth="0.8"/>
      <text x="50" y="49" textAnchor="middle" fontSize="3.5" fill="#444" fontFamily="sans-serif">Tu</text>
      <text x="50" y="54" textAnchor="middle" fontSize="3.5" fill="#444" fontFamily="sans-serif">plato</text>
    </svg>
  );
}

// ── EXERCISE DB SCREEN ───────────────────────────────────────────
// Reparto de volumen por grupo muscular — barras horizontales (no radar,
// para no calcar la forma de spider-chart de apps de referencia). Mismo
// dato (dónde se concentra tu entreno), lenguaje visual 100% HEXIS.
function MuscleVolumeChart({data}){
  const max=Math.max(...data.map(d=>d.volume),1);
  const hasData=data.some(d=>d.volume>0);
  return(
    <div>
      {!hasData?(
        <div style={{fontSize:12,color:"#666"}}>Registra series de distintos grupos musculares en Entreno para ver aquí el reparto real de tu volumen.</div>
      ):(
        data.map(d=>(
          <div key={d.key} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontSize:12,color:"#ccc"}}>{d.label}</div>
              <div style={{fontSize:11,color:"#777"}}>{d.volume?`${Math.round(d.volume/1000)}t`:"—"}</div>
            </div>
            <div style={{height:6,background:"#1a1a1a",borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.round((d.volume/max)*100)}%`,background:d.color,borderRadius:100,transition:"width 0.4s"}}/>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Edad HEXIS — índice motivacional (VO2, sueño, pasos, esfuerzo) vs.
// edad real. Nunca se presenta como dato médico ni diagnóstico.
function HexisAgeCard({result,color}){
  if(!result) return <div style={{fontSize:12,color:"#666"}}>Añade tu edad en el onboarding y registra VO2, sueño y pasos para ver tu Edad HEXIS.</div>;
  const {chronoAge,hexisAge,delta}=result;
  const younger=delta<0;
  return(
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
        <div style={{fontSize:34,fontWeight:900,color}}>{hexisAge}</div>
        <div style={{fontSize:12,color:"#8a8a8a"}}>vs. {chronoAge} años reales</div>
      </div>
      <div style={{fontSize:12,color:younger?"#8BA4A0":delta>0?"#c86a6a":"#aaa",marginBottom:10}}>
        {delta===0?"En línea con tu edad real.":younger?`${Math.abs(delta)} años por debajo de tu edad real.`:`${delta} años por encima de tu edad real.`}
      </div>
      <div style={{fontSize:11,color:"#666",lineHeight:1.6}}>Estimación motivacional a partir de tu VO2 máx, sueño, pasos y esfuerzo real registrados — no es un dato médico ni sustituye pruebas clínicas.</div>
    </div>
  );
}

function MetricsScreen({isPro,onUnlocked,onBack,setLogs,vo2Log,color,gender,age,onLogVo2,stepsLog,sleepLog,weightLog,goalWeight,bodyWeightKg,p,habitsDone,habitsTotal,exDone,exTotal,onLogSteps,onLogSleep,onSetGoalWeight}){
  const [vo2Input,setVo2Input]=useState('');
  const [stepsInput,setStepsInput]=useState('');
  const [sleepInput,setSleepInput]=useState('');
  const [goalInput,setGoalInput]=useState(goalWeight?String(goalWeight):'');
  const [editingGoal,setEditingGoal]=useState(false);

  if(!isPro){
    return(
      <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
            <div style={{fontSize:16,fontWeight:700}}>Métricas de rendimiento</div>
          </div>
        </div>
        <div style={{padding:"20px"}}>
          <div style={{fontSize:12,color:"#888",lineHeight:1.7,marginBottom:16}}>Las gráficas de tensión mecánica, esfuerzo, fatiga, VO2 máx, calorías, sueño, peso y objetivos se calculan sobre tu historial real — es una función de HEXIS PRO.</div>
          <ProFeatureRow icon="📈" title="Motor adaptativo" desc="Tu entreno evoluciona con tu progreso real, no con un split fijo." unlocked={false}/>
          <div style={{height:12}}/>
          <ProCodeInput onUnlocked={onUnlocked}/>
        </div>
      </div>
    );
  }

  const vol=weeklyVolume(setLogs);
  const eff=weeklyEffort(setLogs);
  const fat=fatigueRatio(setLogs);
  const maxVol=Math.max(...vol.map(v=>v.volume),1);
  const lastVo2=vo2Log.length>0?vo2Log[vo2Log.length-1]:null;
  const cal=weeklyCaloriesBurned(setLogs,stepsLog,bodyWeightKg);
  const maxCal=Math.max(...cal.map(c=>c.kcal),1);
  const sleep=weeklySleep(sleepLog);
  const maxSleep=Math.max(...sleep.map(s=>s.hours),8);
  const validW=weightLog.map(e=>e.value);
  const lastWeight=validW.length?validW[validW.length-1]:null;
  const stepsHabit=(p.habits||[]).find(h=>/pasos/i.test(h));
  const stepsTarget=stepsHabit?parseInt(stepsHabit.match(/\d+/)?.[0]||'8000'):8000;
  const last7Steps=stepsLog.slice(-7);
  const avgSteps=last7Steps.length?Math.round(last7Steps.reduce((s,e)=>s+e.steps,0)/last7Steps.length):0;
  const last7Sleep=sleepLog.slice(-7);
  const avgSleep=last7Sleep.length?Math.round((last7Sleep.reduce((s,e)=>s+e.hours,0)/last7Sleep.length)*10)/10:0;
  const habitsPct=habitsTotal?Math.round((habitsDone/habitsTotal)*100):0;
  const exPct=exTotal?Math.round((exDone/exTotal)*100):0;
  const weightDiff=lastWeight&&goalWeight?Math.round((lastWeight-goalWeight)*10)/10:null;
  const muscleVolume=volumeByMuscleGroup(setLogs,EXERCISES);
  const wTrendData=weightTrend(weightLog);
  const effWeekly=weeklyEffort(setLogs);
  const effortLast=effWeekly.length?effWeekly[effWeekly.length-1].effort:null;
  const hexisAge=computeHexisAge({age:age?parseInt(age):null,gender,vo2max:lastVo2?.vo2max,avgSleep,avgSteps,stepsTarget,effortAvg:effortLast});

  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>HEXIS PRO</div>
          <div style={{fontSize:16,fontWeight:700}}>Métricas de rendimiento</div>
        </div>
      </div>
      <div style={{padding:"20px"}}>

        <SLabel text="Tensión mecánica" right="Volumen semanal"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {vol.length===0?(
            <div style={{fontSize:12,color:"#666"}}>Registra tus series con peso y reps reales en Entreno para ver esta gráfica.</div>
          ):(
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
              {vol.map((v,i)=>(
                <div key={v.week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:8,color:"#666"}}>{Math.round(v.volume/1000)}t</div>
                  <div style={{width:"100%",height:Math.max(4,Math.round((v.volume/maxVol)*54)),background:i===vol.length-1?color:"#1a1a1a",borderRadius:3}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,color:"#8a8a8a",marginTop:10,lineHeight:1.6}}>Kg × repeticiones × series por semana. Es el estímulo real que provoca hipertrofia — debe subir poco a poco, no de golpe.</div>
        </div>

        <SLabel text="Volumen por grupo muscular" right="Últimos 30 días"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <MuscleVolumeChart data={muscleVolume}/>
          <div style={{fontSize:11,color:"#8a8a8a",marginTop:10,lineHeight:1.6}}>Dónde se concentra tu entreno real, calculado sobre las series que registraste — no un plan teórico.</div>
        </div>

        <SLabel text="Esfuerzo" right="Media semanal (0-10)"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {eff.length===0?(
            <div style={{fontSize:12,color:"#666"}}>Registra el RIR de cada serie para ver tu esfuerzo real.</div>
          ):(
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
              {eff.map((e,i)=>(
                <div key={e.week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:8,color:"#666"}}>{e.effort}</div>
                  <div style={{width:"100%",height:Math.max(4,Math.round((e.effort/10)*54)),background:i===eff.length-1?color:"#1a1a1a",borderRadius:3}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,color:"#8a8a8a",marginTop:10,lineHeight:1.6}}>Calculado a partir del RIR (repeticiones en reserva) que registras en cada serie. Más cerca del fallo, más esfuerzo.</div>
        </div>

        <SLabel text="Fatiga" right="Carga aguda vs crónica"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {fat.ratio===null?(
            <div style={{fontSize:12,color:"#666"}}>Necesitas varias semanas de entrenos registrados para ver tu fatiga.</div>
          ):(
            <>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
                <div style={{fontSize:28,fontWeight:900,color:fat.label==="Alta"?"#c86a6a":fat.label.startsWith("Baja")?"#8BA4A0":color}}>{fat.ratio}</div>
                <div style={{fontSize:13,color:"#aaa"}}>{fat.label}</div>
              </div>
              <div style={{fontSize:11,color:"#8a8a8a",lineHeight:1.6}}>Ratio de carga aguda (últimos 7 días) frente a tu media crónica (últimas 4 semanas). Por encima de 1.3 hay riesgo de sobreentreno; por debajo de 0.8 estás en descarga.</div>
            </>
          )}
        </div>

        <SLabel text="VO2 máx" right="Capacidad cardiorrespiratoria"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {lastVo2&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:28,fontWeight:900,color}}>{lastVo2.vo2max}<span style={{fontSize:13,color:"#8a8a8a"}}> ml/kg/min</span></div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{vo2Category(lastVo2.vo2max,gender)}</div>
            </div>
          )}
          <div style={{fontSize:11,color:"#8a8a8a",lineHeight:1.6,marginBottom:10}}>Test de Cooper: corre lo más lejos posible durante 12 minutos y anota los metros recorridos.</div>
          <div style={{display:"flex",gap:8}}>
            <input type="number" placeholder="Ej: 2400 (metros)" value={vo2Input} onChange={e=>setVo2Input(e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>
            <button onClick={()=>{const v=parseFloat(vo2Input);if(!v||v<800||v>5000)return;onLogVo2(v);setVo2Input('');}} style={{padding:"0 16px",background:color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Registrar</button>
          </div>
        </div>

        <SLabel text="Edad HEXIS" right="Motivacional · no médico"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <HexisAgeCard result={hexisAge} color={color}/>
        </div>

        <SLabel text="Calorías quemadas" right="Estimado semanal"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {cal.length===0?(
            <div style={{fontSize:12,color:"#666"}}>Registra tus series y tus pasos diarios para ver esta gráfica.</div>
          ):(
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
              {cal.map((c,i)=>(
                <div key={c.week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:8,color:"#666"}}>{c.kcal}</div>
                  <div style={{width:"100%",height:Math.max(4,Math.round((c.kcal/maxCal)*54)),background:i===cal.length-1?color:"#1a1a1a",borderRadius:3}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,color:"#8a8a8a",margin:"10px 0"}}>Estimado a partir de tus series de fuerza (MET 6) y tus pasos diarios (NEAT). No incluye tu gasto basal.</div>
          <div style={{display:"flex",gap:8}}>
            <input type="number" placeholder="Pasos de hoy" value={stepsInput} onChange={e=>setStepsInput(e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>
            <button onClick={()=>{const v=parseInt(stepsInput);if(!v||v<0||v>60000)return;onLogSteps(v);setStepsInput('');}} style={{padding:"0 16px",background:color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Registrar</button>
          </div>
        </div>

        <SLabel text="Sueño" right="Media semanal (h)"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {sleep.length===0?(
            <div style={{fontSize:12,color:"#666"}}>Registra tus horas de sueño cada mañana para ver esta gráfica.</div>
          ):(
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
              {sleep.map((s,i)=>(
                <div key={s.week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:8,color:"#666"}}>{s.hours}h</div>
                  <div style={{width:"100%",height:Math.max(4,Math.round((s.hours/maxSleep)*54)),background:i===sleep.length-1?(s.hours>=7?color:"#c86a6a"):"#1a1a1a",borderRadius:3}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:11,color:"#8a8a8a",margin:"10px 0"}}>El 80% de la hormona de crecimiento se libera en sueño profundo. Objetivo: 7-8h estables cada noche.</div>
          <div style={{display:"flex",gap:8}}>
            <input type="number" step="0.5" placeholder="Horas dormidas anoche" value={sleepInput} onChange={e=>setSleepInput(e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>
            <button onClick={()=>{const v=parseFloat(sleepInput);if(!v||v<0||v>16)return;onLogSleep(v);setSleepInput('');}} style={{padding:"0 16px",background:color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Registrar</button>
          </div>
        </div>

        <SLabel text="Peso y objetivo" right={lastWeight?`Actual: ${lastWeight}kg`:"Sin datos"}/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {validW.length<2?(
            <div style={{fontSize:12,color:"#666",marginBottom:12}}>Registra tu peso en Inicio varios días para ver tu evolución aquí.</div>
          ):(
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60,marginBottom:10,position:"relative"}}>
              {(()=>{const min=Math.min(...validW,goalWeight||validW[0])-0.5;const max=Math.max(...validW,goalWeight||validW[0])+0.5;return weightLog.slice(-14).map((e,i)=>(
                <div key={e.date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",height:Math.max(4,Math.round(((e.value-min)/(max-min))*44)+8),background:i===weightLog.slice(-14).length-1?color:"#1a1a1a",borderRadius:2}}/>
                </div>
              ));})()}
            </div>
          )}
          {goalWeight?(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:12,color:"#aaa"}}>Meta: <span style={{color,fontWeight:700}}>{goalWeight}kg</span>{weightDiff!==null&&<span style={{color:"#666"}}> · {weightDiff>0?`${weightDiff}kg por encima`:weightDiff<0?`${Math.abs(weightDiff)}kg por debajo`:"en tu meta"}</span>}</div>
              <div onClick={()=>setEditingGoal(true)} style={{fontSize:11,color:G,cursor:"pointer"}}>Editar</div>
            </div>
          ):(
            <div style={{fontSize:12,color:"#666",marginBottom:8}}>Aún no has definido un peso objetivo.</div>
          )}
          {(editingGoal||!goalWeight)&&(
            <div style={{display:"flex",gap:8}}>
              <input type="number" placeholder="Peso objetivo (kg)" value={goalInput} onChange={e=>setGoalInput(e.target.value)} style={{...inp,marginBottom:0,flex:1}}/>
              <button onClick={()=>{const v=parseFloat(goalInput);if(!v||v<30||v>250)return;onSetGoalWeight(v);setEditingGoal(false);}} style={{padding:"0 16px",background:color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Guardar</button>
            </div>
          )}
          {wTrendData&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:10,color:"#8a8a8a",letterSpacing:1,textTransform:"uppercase"}}>Tendencia (media 7d)</div>
                  <div style={{fontSize:16,fontWeight:700}}>{wTrendData.lastTrend} kg</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"#8a8a8a",letterSpacing:1,textTransform:"uppercase"}}>Proyección 30 días</div>
                  <div style={{fontSize:16,fontWeight:700,color}}>{wTrendData.projection30} kg</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
                {wTrendData.periods.map(pr=>(
                  <div key={pr.days} style={{background:"#080808",borderRadius:6,padding:"6px 2px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#666"}}>{pr.days}d</div>
                    <div style={{fontSize:11,fontWeight:700,color:pr.diff==null?"#555":pr.diff>0?"#C8AA50":pr.diff<0?"#8BA4A0":"#aaa"}}>{pr.diff==null?"—":`${pr.diff>0?"+":""}${pr.diff}`}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:"#666",marginTop:8,lineHeight:1.5}}>Basado en medias móviles de 7 días. La proyección es una extrapolación simple de tu tendencia actual, no una promesa.</div>
            </div>
          )}
        </div>

        <SLabel text="Resultados vs. objetivos" right="Esta semana"/>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          {[
            {label:"Entrenos completados",pct:exPct,detail:`${exDone}/${exTotal} hoy`},
            {label:"Hábitos diarios",pct:habitsPct,detail:`${habitsDone}/${habitsTotal} hoy`},
            {label:"Pasos (media 7 días)",pct:avgSteps?Math.min(100,Math.round((avgSteps/stepsTarget)*100)):0,detail:`${avgSteps} / ${stepsTarget} pasos`},
            {label:"Sueño (media 7 días)",pct:avgSleep?Math.min(100,Math.round((avgSleep/7.5)*100)):0,detail:`${avgSleep || "—"} / 7-8h`},
          ].map((r,i)=>(
            <div key={i} style={{marginBottom:i===3?0:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:12,color:"#ccc"}}>{r.label}</div>
                <div style={{fontSize:11,color:"#777"}}>{r.detail}</div>
              </div>
              <div style={{height:6,background:"#1a1a1a",borderRadius:100,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${r.pct}%`,background:r.pct>=90?color:r.pct>=50?"#8a8a5a":"#7a4a4a",borderRadius:100,transition:"width 0.4s"}}/>
              </div>
            </div>
          ))}
        </div>

        <Quote text='"Lo que no se mide, no puede mejorar."' attr="Filosofía HEXIS"/>
      </div>
    </div>
  );
}

function PerfilScreen({profile,p,isPro,onUnlocked,onBack,onReset,cycle,onSetCycle}){
  const cycleProgress=getCycleProgress(cycle);
  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>Tu cuenta</div>
          <div style={{fontSize:16,fontWeight:700}}>Perfil y ajustes</div>
        </div>
      </div>
      <div style={{padding:"20px"}}>
        <div style={{background:"#0d0d0d",border:`1px solid ${p.color}`,borderRadius:14,padding:"18px 16px",marginBottom:24}}>
          <div style={{fontSize:11,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>Tu arquetipo</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:1,marginBottom:4}}>{profile}</div>
          <div style={{fontSize:12,color:"#666"}}>{p.sub} · {p.goal}</div>
        </div>

        <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:10}}>Tu plan</div>
        <div style={{background:"#0c0c0c",border:`1px solid ${isPro?"rgba(200,170,80,0.3)":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isPro?0:10}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:isPro?G:"#ccc"}}>{isPro?"HEXIS PRO":"HEXIS START"}</div>
              <div style={{fontSize:11,color:"#666",marginTop:2}}>{isPro?"Plan activo":"Plan base"}</div>
            </div>
            {isPro&&<div style={{fontSize:11,color:G}}>✓ Activo</div>}
          </div>
          {!isPro&&<ProCodeInput onUnlocked={onUnlocked} compact/>}
        </div>

        <AccountLinkCard/>

        <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:10}}>Ciclo de entrenamiento</div>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:24}}>
          {!isPro?(
            <div style={{fontSize:12,color:"#666",lineHeight:1.7}}>Elegir un ciclo (Hipertrofia, Definición, Fuerza, Salud, Rendimiento, Mantenimiento) que ajuste tus macros y el énfasis del entreno es una función de HEXIS PRO. 🔒</div>
          ):(
            <>
              {cycle&&cycleProgress&&(
                <div style={{background:"rgba(200,170,80,0.06)",border:`1px solid ${p.color}55`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontSize:12,fontWeight:700,color:p.color}}>{cycleProgress.cycle.icon} {cycleProgress.cycle.label} — activo</div>
                    <div style={{fontSize:11,color:"#8a8a8a"}}>Semana {cycleProgress.weekNum}/{cycleProgress.totalWeeks}</div>
                  </div>
                  <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{cycleProgress.cycle.desc}</div>
                </div>
              )}
              <div style={{fontSize:11,color:"#666",marginBottom:10}}>{cycle?"Cambiar de ciclo":"Elige tu ciclo actual"}:</div>
              {Object.values(CYCLES).map(c=>(
                <div key={c.id} onClick={()=>onSetCycle(c.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",background:cycle?.id===c.id?"rgba(200,170,80,0.08)":"transparent",border:`1px solid ${cycle?.id===c.id?p.color:"#1a1a1a"}`}}>
                  <div style={{fontSize:18}}>{c.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:cycle?.id===c.id?p.color:"#ccc"}}>{c.label}</div>
                    <div style={{fontSize:10,color:"#666"}}>{c.weeks} semanas · reps {c.repRange}</div>
                  </div>
                  {cycle?.id===c.id&&<div style={{fontSize:12,color:p.color}}>✓</div>}
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:10}}>Datos y almacenamiento</div>
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:24,fontSize:12,color:"#777",lineHeight:1.7}}>
          Tu progreso (peso, ejercicios, hábitos, racha) se guarda al instante en este dispositivo, y también se respalda en la nube en segundo plano. Para poder recuperarlo si cambias de móvil, vincula tu email arriba.
        </div>

        <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:10}}>Reiniciar</div>
        <div style={{background:"#160c0c",border:"1px solid #3a1a1a",borderRadius:12,padding:"16px",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:600,color:"#e0a0a0",marginBottom:6}}>Volver al principio de la app</div>
          <div style={{fontSize:11,color:"#888",lineHeight:1.6,marginBottom:14}}>Esto borra tu perfil, tu plan y todo tu historial guardado en este dispositivo, y vuelve a abrir el test desde cero. No se puede deshacer.</div>
          <div onClick={onReset} style={{textAlign:"center",padding:"12px",borderRadius:8,border:"1px solid #e0a0a0",color:"#e0a0a0",fontSize:12,fontWeight:600,letterSpacing:1,cursor:"pointer"}}>
            Reiniciar aplicación desde el principio
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseDB({onBack,initialTab}){
  const [tab,setTab]=useState(initialTab||"musculos");
  const [gender,setGender]=useState("male");
  const [view,setView]=useState("front");
  const [zone,setZone]=useState(null);
  const [showInfo,setShowInfo]=useState(false);
  const [openGroup,setOpenGroup]=useState(null);
  const [selEx,setSelEx]=useState(null);
  const [matFilter,setMatFilter]=useState("all");
  const mats=["all","Barra","Mancuernas","Máquina","Cable","Peso corporal"];
  const filtered=EXERCISES.filter(e=>matFilter==="all"||e.mat===matFilter);
  const counts={};
  Object.keys(MUSCLE_GROUPS).forEach(k=>{ counts[k]=EXERCISES.filter(e=>e.muscle===k).length; });
  const TABS=[["musculos","Músculos"],["grupos","Grupos"],["ejercicios","Ejercicios"]];

  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:92}}>
      {tab==="musculos"&&(<>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"14px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div style={{flex:1,textAlign:"center",fontSize:11,letterSpacing:4,color:"#ddd",textTransform:"uppercase"}}>Vista {view==="front"?"frontal":"posterior"}</div>
          <div onClick={()=>setShowInfo(s=>!s)} style={{width:24,height:24,borderRadius:"50%",border:"1px solid #444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#888",cursor:"pointer",flexShrink:0}}>i</div>
        </div>
        {showInfo&&<div style={{padding:"12px 20px",fontSize:11,color:"#777",lineHeight:1.6,borderBottom:"1px solid #111"}}>Toca una zona del cuerpo para ver el músculo y sus ejercicios recomendados.</div>}
        <div style={{padding:"16px 20px 0",display:"flex",gap:8}}>
          <div style={{display:"flex",background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:8,overflow:"hidden",flex:1}}>
            {["male","female"].map(g=>(
              <div key={g} onClick={()=>setGender(g)} style={{flex:1,padding:"8px 0",textAlign:"center",fontSize:11,fontWeight:600,color:gender===g?"#050505":"#555",background:gender===g?G:"transparent",cursor:"pointer",transition:"all 0.2s"}}>
                {g==="male"?"♂ Hombre":"♀ Mujer"}
              </div>
            ))}
          </div>
          <div style={{display:"flex",background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:8,overflow:"hidden"}}>
            {["front","back"].map(v=>(
              <div key={v} onClick={()=>setView(v)} style={{padding:"8px 12px",fontSize:11,fontWeight:600,color:view===v?"#050505":"#555",background:view===v?G:"transparent",cursor:"pointer",transition:"all 0.2s"}}>
                {v==="front"?"↑ Frente":"↓ Espalda"}
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"18px 20px 30px"}}>
          <BodyMap gender={gender} view={view} activeZone={zone} onZoneClick={z=>setZone(zone===z?null:z)}/>
        </div>
        <MuscleSheet zone={zone} onClose={()=>setZone(null)}/>
      </>)}

      {tab==="grupos"&&(<>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>Cuerpo Griego</div>
            <div style={{fontSize:16,fontWeight:700}}>Grupos musculares</div>
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <SLabel text="Grupos musculares" right={`${Object.keys(MUSCLE_GROUPS).length} en total`}/>
          {Object.entries(MUSCLE_GROUPS).map(([k,m])=>(
            <div key={k} onClick={()=>setOpenGroup(openGroup===k?null:k)} style={{background:"#0c0c0c",border:`1px solid ${openGroup===k?m.color+"55":"#1a1a1a"}`,borderRadius:12,padding:"12px 16px",marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:20}}>{m.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd"}}>{m.label}</div>
                  <div style={{fontSize:11,color:"#666"}}>{counts[k]} ejercicio{counts[k]!==1?"s":""} en la base de datos</div>
                </div>
                <div style={{fontSize:14,color:"#7a7a7a"}}>{openGroup===k?"−":"+"}</div>
              </div>
              {openGroup===k&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a",display:"flex",flexWrap:"wrap",gap:6}}>
                  {counts[k]===0?(
                    <div style={{fontSize:12,color:"#666"}}>Aún no hay ejercicios de este grupo en la base de datos.</div>
                  ):EXERCISES.filter(e=>e.muscle===k).map(e=>(
                    <span key={e.id} style={{fontSize:11,padding:"4px 10px",borderRadius:100,background:"#111",color:m.color}}>{e.icon} {e.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>)}

      {tab==="ejercicios"&&(<>
        <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>Cuerpo Griego</div>
            <div style={{fontSize:16,fontWeight:700}}>Todos los ejercicios</div>
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
            {mats.map(m=>(
              <div key={m} onClick={()=>setMatFilter(m)} style={{flexShrink:0,padding:"4px 10px",borderRadius:100,border:`1px solid ${matFilter===m?G:"#111"}`,background:matFilter===m?"rgba(200,170,80,0.08)":"transparent",color:matFilter===m?G:"#444",fontSize:11,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}}>{m==="all"?"Todos":m}</div>
            ))}
          </div>
          <SLabel text={`${filtered.length} ejercicios`}/>
          {filtered.map(ex=>(
            <div key={ex.id} onClick={()=>setSelEx(selEx?.id===ex.id?null:ex)} style={{background:"#0c0c0c",border:`1px solid ${selEx?.id===ex.id?G+"44":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:22,flexShrink:0}}>{ex.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:4}}>{ex.name}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:"#111",color:MUSCLE_GROUPS[ex.muscle]?.color||G}}>{MUSCLE_GROUPS[ex.muscle]?.label}</span>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:"#111",color:"#666"}}>{ex.mat}</span>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:"#111",color:levelColor[ex.level]||"#888"}}>{ex.level}</span>
                    <span style={{fontSize:11,color:"#8a8a8a"}}>{ex.sets}</span>
                  </div>
                </div>
                <div style={{fontSize:14,color:"#7a7a7a"}}>{selEx?.id===ex.id?"−":"+"}</div>
              </div>
              {selEx?.id===ex.id&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                  <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Por qué funciona?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{ex.science}</div></div>
                  <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Cómo ejecutarlo</div><div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{ex.cues}</div></div>
                  <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Contexto científico</div><div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{ex.why}</div></div>
                  <div style={{display:"flex",gap:8}}>
                    {[["Series/Reps",ex.sets],["Descanso",ex.rest]].map(([l,v])=>(
                      <div key={l} style={{background:"#111",borderRadius:8,padding:"8px 12px",flex:1}}>
                        <div style={{fontSize:8,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{l}</div>
                        <div style={{fontSize:12,fontWeight:600,color:"#bbb"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </>)}

      <div style={{position:"fixed",left:0,right:0,bottom:0,maxWidth:430,margin:"0 auto",background:"#0a0a0a",borderTop:"1px solid #1a1a1a",display:"flex",zIndex:80}}>
        {TABS.map(([k,l])=>(
          <div key={k} onClick={()=>setTab(k)} style={{flex:1,textAlign:"center",padding:"10px 0 12px",cursor:"pointer",color:tab===k?G:"#555"}}>
            <div style={{fontSize:16,marginBottom:2}}>{k==="musculos"?"◈":k==="grupos"?"◎":"▤"}</div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── NUTRITION DB SCREEN ──────────────────────────────────────────
function NutritionDB({onBack}){
  const [dbTab,setDbTab]=useState("foods");
  const [activeSection,setActiveSection]=useState(null);
  const [selFood,setSelFood]=useState(null);
  const [selSupp,setSelSupp]=useState(null);
  const [expMacro,setExpMacro]=useState(null);
  const foods=activeSection?FOODS[activeSection]||[]:Object.values(FOODS).flat();
  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase"}}>Base de datos</div>
          <div style={{fontSize:16,fontWeight:700}}>Nutrición & Suplementos</div>
        </div>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:8,overflow:"hidden",marginBottom:16}}>
          {[["foods","🍽 Alimentos"],["supps","💊 Suplementos"]].map(([v,l])=>(
            <div key={v} onClick={()=>setDbTab(v)} style={{flex:1,padding:"11px 0",textAlign:"center",fontSize:12,fontWeight:600,color:dbTab===v?"#050505":"#555",background:dbTab===v?G:"transparent",cursor:"pointer",transition:"all 0.2s"}}>{l}</div>
          ))}
        </div>

        {dbTab==="foods"&&(
          <>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:14,padding:"16px 20px",marginBottom:12}}>
              <div style={{fontSize:11,color:"#555",textAlign:"center",marginBottom:10}}>Toca el plato para filtrar</div>
              <PlateModel active={activeSection} onSection={s=>setActiveSection(activeSection===s?null:s)}/>
              {activeSection&&<div style={{textAlign:"center",marginTop:8,fontSize:11,color:sectionColor[activeSection],letterSpacing:2,textTransform:"uppercase"}}>{sectionLabel[activeSection]} · {FOODS[activeSection]?.length} alimentos</div>}
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
              <div onClick={()=>setActiveSection(null)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${!activeSection?G:"#111"}`,background:!activeSection?"rgba(200,170,80,0.1)":"transparent",color:!activeSection?G:"#444",fontSize:11,cursor:"pointer"}}>Todos</div>
              {Object.entries(sectionLabel).map(([k,l])=>(
                <div key={k} onClick={()=>setActiveSection(activeSection===k?null:k)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${activeSection===k?sectionColor[k]:"#111"}`,background:activeSection===k?`${sectionColor[k]}22`:"transparent",color:activeSection===k?sectionColor[k]:"#444",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</div>
              ))}
            </div>
            {/* macros explainer */}
            <SLabel text="¿Qué son los macros?"/>
            {Object.entries(MACRO_INFO).map(([k,m])=>(
              <div key={k} onClick={()=>setExpMacro(expMacro===k?null:k)} style={{background:"#0a0a0a",border:`1px solid ${expMacro===k?m.color+"44":"#111"}`,borderRadius:10,padding:"12px 14px",marginBottom:6,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{m.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:expMacro===k?m.color:"#ddd"}}>{m.name}</div>
                    {expMacro!==k&&<div style={{fontSize:11,color:"#8a8a8a"}}>Toca para saber más</div>}
                  </div>
                  <div style={{fontSize:14,color:"#7a7a7a"}}>{expMacro===k?"−":"+"}</div>
                </div>
                {expMacro===k&&(
                  <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{fontSize:12,color:"#777",lineHeight:1.75,marginBottom:8}}>{m.desc}</div>
                    <div style={{fontSize:11,color:m.color,marginBottom:4}}>📌 {m.need}</div>
                    <div style={{fontSize:11,color:"#555"}}>💡 {m.example}</div>
                  </div>
                )}
              </div>
            ))}
            <div style={{height:8}}/>
            <SLabel text={`${foods.length} alimentos${activeSection?` · ${sectionLabel[activeSection]}`:""}`}/>
            {foods.map((f,i)=>(
              <div key={i} onClick={()=>setSelFood(selFood?.name===f.name?null:f)} style={{background:"#0c0c0c",border:`1px solid ${selFood?.name===f.name?G+"44":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:26,flexShrink:0}}>{f.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:4}}>{f.name}</div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"#888"}}>{f.per100.kcal} kcal</span>
                      <span style={{fontSize:11,color:G}}>{f.per100.prot}g prot</span>
                      <span style={{fontSize:11,color:"#A09060"}}>{f.per100.carbs}g carb</span>
                      <span style={{fontSize:11,color:"#8BA4A0"}}>{f.per100.fat}g grasa</span>
                      <span style={{fontSize:11,color:"#7a7a7a"}}>por 100g</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:"#7a7a7a"}}>{selFood?.name===f.name?"−":"+"}</div>
                </div>
                {selFood?.name===f.name&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{background:"#111",borderRadius:8,padding:"12px 14px",marginBottom:10}}>
                      <div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:6}}>Ración · {f.ration}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                        {[[f.rdata.kcal,"kcal","Cal",G],[f.rdata.prot,"g","Prot","#fff"],[f.rdata.carbs,"g","Carb","#fff"],[f.rdata.fat,"g","Gras","#fff"]].map(([v,u,l,c])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{fontSize:15,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
                            <div style={{fontSize:8,color:"#8a8a8a"}}>{u}</div>
                            <div style={{fontSize:7,color:"#7a7a7a",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{marginBottom:8}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Micronutrientes</div><div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{f.micro}</div></div>
                    {f.gi&&f.gi!=="—"&&<div style={{marginBottom:8}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Índice glucémico</div><div style={{fontSize:12,color:"#666"}}>{f.gi}</div></div>}
                    <div style={{borderLeft:`2px solid ${G}`,background:"#080808",borderRadius:"0 8px 8px 0",padding:"10px 12px"}}><div style={{fontSize:11,color:"#666",lineHeight:1.6}}>💡 {f.tip}</div></div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {dbTab==="supps"&&(
          <>
            <div style={{background:"#080808",border:`1px solid ${G}22`,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:6}}>Sin marcas comerciales</div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.7}}>Esta base describe únicamente los <strong style={{color:"#888"}}>compuestos activos</strong>. La evidencia científica es lo que importa, no el envase.</div>
            </div>
            <SLabel text={`${SUPPLEMENTS.length} suplementos documentados`}/>
            {SUPPLEMENTS.map((s,i)=>(
              <div key={i} onClick={()=>setSelSupp(selSupp?.name===s.name?null:s)} style={{background:"#0c0c0c",border:`1px solid ${selSupp?.name===s.name?G+"44":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:24,flexShrink:0}}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:4}}>{s.name}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:11}}>{s.ev}</span>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:100,background:"#111",color:"#666"}}>{s.cat}</span>
                      <span style={{fontSize:11,color:G}}>{s.dose}</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:"#7a7a7a"}}>{selSupp?.name===s.name?"−":"+"}</div>
                </div>
                {selSupp?.name===s.name&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Qué es?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{s.what}</div></div>
                    <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Para qué sirve?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{s.for}</div></div>
                    <div style={{marginBottom:10}}><div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>La ciencia dice</div><div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{s.science}</div></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      <div style={{background:"#111",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Dosis efectiva</div><div style={{fontSize:12,fontWeight:600,color:G}}>{s.dose}</div></div>
                      <div style={{background:"#111",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Cuándo tomarlo</div><div style={{fontSize:11,color:"#888"}}>{s.timing}</div></div>
                    </div>
                    <div style={{borderLeft:`2px solid ${G}`,background:"#080808",borderRadius:"0 8px 8px 0",padding:"10px 12px"}}><div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>Seguridad</div><div style={{fontSize:11,color:"#666",lineHeight:1.6}}>{s.safe}</div></div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── ONBOARDING ───────────────────────────────────────────────────

// Puerta de entrada antes del test: por defecto es el Onboarding de
// siempre, pero deja un hueco discreto para quien ya tiene cuenta HEXIS y
// solo necesita recuperarla en este móvil (no repetir el test ni perder
// su historial).
function RestoreForm({onBack}){
  const[email,setEmail]=useState('');
  const[status,setStatus]=useState('idle'); // idle | sending | sent | error
  const[errMsg,setErrMsg]=useState('');

  const submit=async()=>{
    if(!email.trim())return;
    setStatus('sending');setErrMsg('');
    const res=await restoreAccountByEmail(email.trim());
    if(res.ok){ setStatus('sent'); }
    else{ setStatus('error'); setErrMsg(res.error||''); }
  };

  return(
    <div style={{minHeight:"100vh",maxWidth:430,margin:"0 auto",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",display:"flex",flexDirection:"column",justifyContent:"center",padding:24}}>
      <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Restaurar mi cuenta</div>
      <div style={{fontFamily:PF,fontSize:22,fontWeight:700,textAlign:"center",marginBottom:16,lineHeight:1.3}}>Recupera tus datos<br/><em style={{color:G,fontStyle:"italic"}}>en este móvil</em></div>
      {status==='sent'?(
        <div style={{fontSize:13,color:"#aaa",textAlign:"center",lineHeight:1.7}}>
          Te hemos enviado un enlace a <strong style={{color:"#fff"}}>{email}</strong>. Ábrelo desde este móvil para entrar en tu cuenta con todo tu historial.
        </div>
      ):(
        <>
          <div style={{fontSize:12,color:"#8a8a8a",textAlign:"center",marginBottom:16,lineHeight:1.7}}>
            Solo funciona si antes vinculaste un email desde Perfil → Tu cuenta en tu otro dispositivo. Si es tu primera vez en HEXIS, no hace falta esto — vuelve al test.
          </div>
          <input style={inp} type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {status==='error'&&<div style={{fontSize:12,color:"#c86a6a",marginBottom:8}}>No se pudo enviar el enlace{errMsg?`: ${errMsg}`:''}.</div>}
          <Btn label={status==='sending'?"Enviando...":"Enviar enlace de acceso"} onClick={submit} disabled={status==='sending'||!email.trim()}/>
        </>
      )}
      <div style={{textAlign:"center",marginTop:20}}>
        <span style={{fontSize:12,color:"#8a8a8a",textDecoration:"underline",cursor:"pointer"}} onClick={onBack}>← Volver al test</span>
      </div>
    </div>
  );
}

function EntryGate({onDone}){
  const[mode,setMode]=useState('onboarding');
  if(mode==='restore') return <RestoreForm onBack={()=>setMode('onboarding')}/>;
  return(
    <div style={{position:"relative",maxWidth:430,margin:"0 auto",background:BG}}>
      <div onClick={()=>setMode('restore')} style={{position:"absolute",top:14,right:16,zIndex:20,fontSize:11,color:"#8a8a8a",textDecoration:"underline",cursor:"pointer"}}>¿Ya tienes cuenta?</div>
      <Onboarding onDone={onDone}/>
    </div>
  );
}

function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [feelings,setFeelings]=useState([]);
  const [obstacles,setObstacles]=useState([]);
  const [dp,setDp]=useState(null);
  const [fd,setFd]=useState({name:"",age:"",weight:"",height:"",gender:"",activity:""});
  const tf=id=>setFeelings(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const to=id=>setObstacles(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const next=()=>{if(step===3){setDp(detect(feelings,obstacles,fd.gender));}setStep(s=>s+1);};
  const ok=fd.name&&fd.age&&fd.weight&&fd.height&&fd.activity;
  const pc=dp?PROFILES[dp].color:G;
  const DFig=dp?FIGS[dp]:FigW;
  const pct=[0,10,22,35,48,60,72,86,100][step]||0;
  const scr={minHeight:"100vh",background:BG,fontFamily:"Poppins,sans-serif",color:"#fff"};

  if(step===0) return(
    <div key={step} style={{...scr,position:"relative",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <div style={{position:"relative",padding:"36px 20px 0",display:"flex",justifyContent:"center"}}>
        <img src="/estatuas/estatua_reclinada_kalokagathia.jpg" alt="" style={{width:"100%",maxWidth:400,height:"auto",display:"block",filter:"brightness(1.14)"}}/>
        <div style={{position:"absolute",left:0,right:0,bottom:0,height:140,background:"linear-gradient(to bottom,rgba(5,5,5,0) 0%,rgba(5,5,5,0.75) 45%,rgba(5,5,5,1) 78%)"}}/>
      </div>
      <div style={{position:"relative",zIndex:2,background:BG,padding:"0 28px 40px",textAlign:"center",marginTop:-6}}>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:8,color:G,marginBottom:6}}>HEXIS</div>
        <div style={{fontSize:11,letterSpacing:3,color:"#6b6b6b",textTransform:"uppercase",marginBottom:26}}>Fortaleza del cuerpo · Claridad de la mente</div>
        <div style={{fontFamily:PF,fontSize:32,fontWeight:700,lineHeight:1.1,marginBottom:14}}>El cuerpo que eres<br/><em style={{fontStyle:"italic",color:G}}>empieza aquí.</em></div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.75,marginBottom:26}}>No es una dieta. No es un reto.<br/>Es el sistema que trabaja con tu naturaleza.</div>
        <Btn label="Comenzar mi camino" onClick={next}/>
        <div style={{fontSize:11,color:"#3a3a3a",marginTop:12,letterSpacing:1}}>3 minutos · Gratis · Sin tarjeta</div>
      </div>
    </div>
  );

  if(step===1) return(
    <div key={step} style={scr}>
      <PBar pct={pct} fixed/>
      <div style={{position:"relative",height:195,overflow:"hidden",flexShrink:0,background:"#000"}}>
        <img src="/logo/hexis_logo.jpg" alt="HEXIS" style={{position:"absolute",top:"42%",left:"50%",transform:"translate(-50%,-50%)",width:"66%",maxWidth:280,display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(5,5,5,0) 20%,rgba(5,5,5,0.8) 65%,rgba(5,5,5,1) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 18px",zIndex:3}}>
          <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>Antes de empezar</div>
          <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>¿Cuál es tu <em style={{color:G,fontStyle:"italic"}}>sexo biológico?</em></div>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{fontSize:12,color:"#666",lineHeight:1.7,marginBottom:16}}>Lo usamos para calcular tu plan con precisión — metabolismo, calorías y tu arquetipo HEXIS.</div>
        <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid #1a1a1a",marginBottom:2}}>
          <img src="/estatuas/estatua_pareja_griega.jpg" alt="" style={{width:"100%",display:"block"}}/>
          <div onClick={()=>setFd(p=>({...p,gender:"female"}))} style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",cursor:"pointer"}}/>
          <div onClick={()=>setFd(p=>({...p,gender:"male"}))} style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",cursor:"pointer"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",marginBottom:20}}>
          <div onClick={()=>setFd(p=>({...p,gender:"female"}))} style={{textAlign:"center",padding:"10px 0",cursor:"pointer",fontSize:13,fontWeight:600,color:fd.gender==="female"?G:"#ddd"}}>{fd.gender==="female"?"✓ ":"♀ "}Mujer</div>
          <div onClick={()=>setFd(p=>({...p,gender:"male"}))} style={{textAlign:"center",padding:"10px 0",cursor:"pointer",fontSize:13,fontWeight:600,color:fd.gender==="male"?G:"#ddd"}}>{fd.gender==="male"?"✓ ":"♂ "}Hombre</div>
        </div>
        <Btn label="Continuar" onClick={next} disabled={!fd.gender}/>
      </div>
    </div>
  );

  if(step===2) return(
    <div key={step} style={scr}>
      <PBar pct={pct} fixed/>
      <Hero Fig={FigG} h={195}>
        <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>Paso 2 de 5</div>
        <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>¿Cómo quieres <em style={{color:G,fontStyle:"italic"}}>sentirte?</em></div>
      </Hero>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {FEELINGS.map(f=>(
            <div key={f.id} onClick={()=>tf(f.id)} style={{background:feelings.includes(f.id)?"rgba(200,170,80,0.08)":"#0c0c0c",border:`1px solid ${feelings.includes(f.id)?G:"#1a1a1a"}`,borderRadius:12,padding:"16px 8px 12px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
              <div style={{marginBottom:8}}><ThemeIcon name={f.i} size={50} selected={feelings.includes(f.id)}/></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:5}}>
                <div style={{width:14,height:1,background:feelings.includes(f.id)?G:"#333"}}/>
                <div style={{width:3,height:3,borderRadius:"50%",background:feelings.includes(f.id)?G:"#555"}}/>
              </div>
              <div style={{fontFamily:PF,fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:feelings.includes(f.id)?G:"#ddd",marginBottom:3}}>{f.l}</div>
              <div style={{fontSize:10.5,color:"#555"}}>{f.d}</div>
            </div>
          ))}
        </div>
        <Btn label="Continuar" onClick={next} disabled={!feelings.length}/>
      </div>
    </div>
  );

  if(step===3) return(
    <div key={step} style={scr}>
      <PBar pct={pct} fixed/>
      <Hero Fig={FigA} h={195}>
        <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>Paso 3 de 5</div>
        <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>¿Qué te ha <em style={{color:G,fontStyle:"italic"}}>frenado?</em></div>
      </Hero>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {OBSTACLES.map(o=>(
            <div key={o.id} onClick={()=>to(o.id)} style={{background:obstacles.includes(o.id)?"rgba(200,170,80,0.08)":"#0c0c0c",border:`1px solid ${obstacles.includes(o.id)?G:"#1a1a1a"}`,borderRadius:12,padding:"16px 8px 14px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
              <div style={{marginBottom:8}}><ThemeIcon name={o.i} size={50} selected={obstacles.includes(o.id)}/></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:5}}>
                <div style={{width:14,height:1,background:obstacles.includes(o.id)?G:"#333"}}/>
                <div style={{width:3,height:3,borderRadius:"50%",background:obstacles.includes(o.id)?G:"#555"}}/>
              </div>
              <div style={{fontFamily:PF,fontSize:11.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:obstacles.includes(o.id)?G:"#ddd"}}>{o.l}</div>
            </div>
          ))}
        </div>
        <Btn label="Continuar" onClick={next} disabled={!obstacles.length}/>
      </div>
    </div>
  );

  if(step===4&&dp){
    const p=PROFILES[dp];
    return(
      <div key={step} style={scr}>
        <PBar pct={pct} fixed/>
        <Hero Fig={DFig} h={210}>
          <div style={{fontSize:11,letterSpacing:4,color:pc,textTransform:"uppercase",marginBottom:4}}>Tu arquetipo</div>
          <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>Hemos encontrado<br/><em style={{color:pc,fontStyle:"italic"}}>tu perfil.</em></div>
        </Hero>
        <div style={{padding:"16px 20px"}}>
          <div style={{background:"#0d0d0d",border:`1px solid ${pc}`,borderRadius:14,padding:"20px 18px",marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:pc}}/>
            <div style={{fontSize:38,fontWeight:900,letterSpacing:2,marginBottom:4}}>{dp}</div>
            <div style={{fontSize:12,color:"#555",marginBottom:10}}>{p.sub}</div>
            <div style={{fontSize:13,color:"#888",lineHeight:1.7,marginBottom:14}}>{p.tagline}</div>
            <div style={{fontFamily:PF,fontSize:12,fontStyle:"italic",color:"#555",marginBottom:14,paddingTop:10,borderTop:"1px solid #1a1a1a"}}>"{p.manifesto}"</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Identidad","Sistema","Eficiencia","Progreso"].map(t=>(
                <div key={t} style={{fontSize:11,padding:"3px 10px",borderRadius:100,border:`1px solid ${pc}`,color:pc,textTransform:"uppercase",opacity:0.7,letterSpacing:1}}>{t}</div>
              ))}
            </div>
          </div>
          <Btn label="Continuar" onClick={next} color={pc}/>
        </div>
      </div>
    );
  }

  if(step===5) return(
    <div key={step} style={scr}>
      <PBar pct={pct} fixed/>
      <Hero img="/estatuas/estatua_zeus_kalokagathia.png" imgPos="center 12%" h={195}/>
      <div style={{padding:"16px 20px",overflowY:"auto"}}>
        {PRINCIPLES.slice(0,4).map(pr=>(
          <div key={pr.n} style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:10,padding:14,marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:18,flexShrink:0,marginTop:2}}>{pr.icon}</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:2,marginBottom:4}}>{pr.n}</div>
              <div style={{fontSize:13,fontWeight:600,color:"#ddd",marginBottom:4}}>{pr.title}</div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.65}}>{pr.body}</div>
            </div>
          </div>
        ))}
        <div style={{height:8}}/>
        <Btn label="Construir mi plan" onClick={next}/>
      </div>
    </div>
  );

  if(step===6) return(
    <div key={step} style={{...scr,padding:"72px 24px 40px",overflowY:"auto"}}>
      <PBar pct={pct} fixed/>
      <div style={{fontSize:11,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Paso 4 de 5</div>
      <div style={{fontFamily:PF,fontSize:26,fontWeight:700,textAlign:"center",marginBottom:24}}>Tus datos <em style={{color:G,fontStyle:"italic"}}>personales</em></div>
      <div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Tu nombre</div>
      <input style={inp} type="text" placeholder="Cómo te llamas" value={fd.name} onChange={e=>setFd(p=>({...p,name:e.target.value}))}/>
      <div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Edad</div>
      <input style={inp} type="number" placeholder="28" value={fd.age} onChange={e=>setFd(p=>({...p,age:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Peso (kg)</div><input style={inp} type="number" placeholder="75" value={fd.weight} onChange={e=>setFd(p=>({...p,weight:e.target.value}))}/></div>
        <div><div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Altura (cm)</div><input style={inp} type="number" placeholder="178" value={fd.height} onChange={e=>setFd(p=>({...p,height:e.target.value}))}/></div>
      </div>
      <div style={{fontSize:11,letterSpacing:2,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Nivel de actividad</div>
      <select style={inp} value={fd.activity} onChange={e=>setFd(p=>({...p,activity:e.target.value}))}>
        <option value="">Seleccionar</option>
        <option value="1.2">Sedentario · Poco o nada de ejercicio</option>
        <option value="1.375">Ligero · 1–3 días por semana</option>
        <option value="1.55">Moderado · 3–5 días por semana</option>
        <option value="1.725">Activo · 6–7 días por semana</option>
        <option value="1.9">Muy activo · Trabajo físico + ejercicio</option>
      </select>
      <Btn label="Calcular mi plan" onClick={next} disabled={!ok}/>
    </div>
  );

  if(step===7&&dp){
    const r=calcPlan(fd,dp);
    const pc2=PROFILES[dp].color;
    return(
      <div key={step} style={scr}>
        <PBar pct={100} fixed/>
        <Hero Fig={FIGS[dp]} h={210}>
          <div style={{fontSize:11,letterSpacing:4,color:pc2,textTransform:"uppercase",marginBottom:4}}>{dp} · Plan calculado</div>
          <div style={{fontFamily:PF,fontSize:26,fontWeight:700}}>Plan listo.<br/><em style={{color:pc2,fontStyle:"italic"}}>Empieza hoy.</em></div>
        </Hero>
        <div style={{padding:"16px 20px",overflowY:"auto"}}>
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:11,letterSpacing:3,color:"#8a8a8a",textTransform:"uppercase",marginBottom:6}}>Calorías diarias objetivo</div>
            <div style={{fontSize:36,fontWeight:700,color:pc2,lineHeight:1}}>{r.cal}<span style={{fontSize:14,color:"#8a8a8a",marginLeft:6}}>kcal/día</span></div>
            <div style={{fontSize:11,color:"#8a8a8a",marginTop:6}}>{PROFILES[dp].goal} · TDEE base {r.tdee} kcal</div>
          </div>
          <MacroGrid cal={r.cal} prot={r.prot} carbs={r.carbs} fat={r.fat} color={pc2}/>
          <Btn label="Acceder a mi plan →" onClick={()=>onDone(dp,fd,r)} color={pc2}/>
        </div>
      </div>
    );
  }
  return null;
}

// ── MAIN APP ─────────────────────────────────────────────────────
export default function App(){
  const [profile,setProfile]=useState(()=>loadProfile());
  const [plan,setPlan]=useState(()=>loadPlan());
  const [tab,setTab]=useState("inicio");
  const [screen,setScreen]=useState(null); // "exdb" | "nutdb"
  const [habits,setHabits]=useState(()=>{ const p=loadProfile(); return p&&PROFILES[p]?loadHabits(PROFILES[p].habits.length):[false,false,false,false]; });
  const [exercises,setExercises]=useState(()=>{ const p=loadProfile(); return p&&WORKOUTS[p]?loadExercises(getTodayWorkout(p).length):Array(5).fill(false); });
  const [water,setWater]=useState(()=>loadWater());
  const [expandMeal,setExpandMeal]=useState(null);
  const [expandEx,setExpandEx]=useState(null);
  const [expandDay,setExpandDay]=useState(null);
  const [expandSupp,setExpandSupp]=useState(null);
  const [expandTip,setExpandTip]=useState(null);
  const [expandPrinciple,setExpandPrinciple]=useState(null);
  const [weightLog, setWeightLog]=useState(()=>loadWeightLog());
  const [weightInput, setWeightInput]=useState('');
  const [showProgress,setShowProgress]=useState(false);
  const [streakData,setStreakData]=useState(()=>loadStreak());
  const streakDay=streakData.current;
  const streakBest=streakData.best;
  const [userId,setUserId]=useState(null);
  const [isPro,setIsPro]=useState(()=>checkOwnerUnlock());
  const [setLogs,setSetLogs]=useState(()=>loadSetLogs());
  const [vo2Log,setVo2Log]=useState(()=>loadVo2Log());
  const [loggingIdx,setLoggingIdx]=useState(null);
  const [logForm,setLogForm]=useState({weight:'',reps:'',rir:'2'});
  const [stepsLog,setStepsLog]=useState(()=>loadStepsLog());
  const [sleepLog,setSleepLog]=useState(()=>loadSleepLog());
  const [goalWeight,setGoalWeight]=useState(()=>loadGoalWeight());
  const [cycle,setCycle]=useState(()=>loadCycle());
  const [mirrorLog,setMirrorLog]=useState(()=>loadMirrorLog());

  useEffect(()=>{
    ensureCloudSession().then(async id=>{
      if(id){
        setUserId(id);
        const p=loadProfile();
        const ud=loadUserData();
        if(p&&ud){
          syncProfileToCloud(id,{name:ud.name,archetype:p,gender:ud.gender,age:ud.age,weight:ud.weight,height:ud.height,activity:ud.activity});
        }else{
          // Sin perfil en este dispositivo: puede ser un móvil nuevo en el
          // que el usuario acaba de entrar con el enlace de "Restaurar mi
          // cuenta" (mismo user_id de siempre). Si Supabase ya tiene un
          // perfil real para este user_id, se reconstruye aquí en vez de
          // mandarle otra vez al test de onboarding.
          const cloud=await fetchCloudProfile(id);
          if(cloud){
            const pd=calcPlan(cloud.userData,cloud.archetype);
            setProfile(cloud.archetype);setPlan(pd);
            saveProfile(cloud.archetype);savePlan(pd);saveUserData(cloud.userData);
            setExercises(loadExercises(getTodayWorkout(cloud.archetype).length));
            setHabits(loadHabits(PROFILES[cloud.archetype].habits.length));
            const hist=await fetchCloudHistory(id);
            restoreLocalLogs(hist);
            if(hist.weightLog.length)setWeightLog(hist.weightLog);
            if(hist.vo2Log.length)setVo2Log(hist.vo2Log);
            if(hist.stepsLog.length)setStepsLog(hist.stepsLog);
            if(hist.sleepLog.length)setSleepLog(hist.sleepLog);
          }
        }
        fetchSubscriptionTier(id).then(tier=>setIsPro(tier==='premium'||checkOwnerUnlock()));
      }
    });
  },[]);

  const handleDone=(prof,ud,pd)=>{
    setProfile(prof);setPlan(pd);
    saveProfile(prof);
    savePlan(pd);
    saveUserData(ud);
    setExercises(loadExercises(getTodayWorkout(prof).length));
    setHabits(loadHabits(PROFILES[prof].habits.length));
    ensureCloudSession().then(id=>{
      if(id){ setUserId(id); syncProfileToCloud(id,{name:ud.name,archetype:prof,gender:ud.gender,age:ud.age,weight:ud.weight,height:ud.height,activity:ud.activity}); }
    });
  };

  if(!profile) return <EntryGate onDone={handleDone}/>;

  // Sub-screens
  if(screen==="exdb") return <ExerciseDB onBack={()=>setScreen(null)} initialTab="musculos"/>;
  if(screen==="atlas") return <ExerciseDB onBack={()=>setScreen(null)} initialTab="grupos"/>;
  if(screen==="nutdb") return <NutritionDB onBack={()=>setScreen(null)}/>;
  if(screen==="perfil") return <PerfilScreen profile={profile} p={PROFILES[profile]} isPro={isPro} onUnlocked={()=>setIsPro(true)} onBack={()=>setScreen(null)} cycle={cycle} onSetCycle={(id)=>{const c=saveCycle(id);setCycle(c);}} onReset={()=>{
    if(window.confirm('¿Reiniciar la aplicación desde el principio? Se borrará todo tu progreso guardado en este dispositivo.')){
      clearAll();setProfile(null);setPlan(null);setWeightLog([]);setStreakData({current:0,best:0});setHabits([false,false,false,false]);setExercises(Array(5).fill(false));setWater(0);setScreen(null);setCycle(null);
    }
  }}/>;
  if(screen==="metrics") return <MetricsScreen
    isPro={isPro} onUnlocked={()=>setIsPro(true)} onBack={()=>setScreen(null)}
    setLogs={setLogs} vo2Log={vo2Log} stepsLog={stepsLog} sleepLog={sleepLog}
    weightLog={weightLog} goalWeight={goalWeight}
    color={PROFILES[profile].color} gender={(loadUserData()||{}).gender} age={(loadUserData()||{}).age}
    bodyWeightKg={(weightLog.length?weightLog[weightLog.length-1].value:null)||parseFloat((loadUserData()||{}).weight)||75}
    p={PROFILES[profile]} habitsDone={habits.filter(Boolean).length} habitsTotal={habits.length}
    exDone={exercises.filter(Boolean).length} exTotal={getTodayWorkout(profile).length}
    onLogVo2={(distance)=>{
      const log=saveVo2Test(distance);
      setVo2Log(log);
      const last=log[log.length-1];
      if(last) logVo2ToCloud(userId,last.vo2max);
    }}
    onLogSteps={(steps)=>{
      const log=saveSteps(steps);
      setStepsLog(log);
      logWellnessToCloud(userId,{steps});
    }}
    onLogSleep={(hours)=>{
      const log=saveSleep(hours);
      setSleepLog(log);
      logWellnessToCloud(userId,{sleepHours:hours});
    }}
    onSetGoalWeight={(v)=>{
      saveGoalWeight(v);
      setGoalWeight(v);
    }}
  />;
  if(screen==="analyze") return <AnalyzeScreen onBack={()=>setScreen(null)} isPro={isPro} onUnlocked={()=>setIsPro(true)} color={PROFILES[profile].color}/>;
  if(screen==="progress") return <ProgressPhotosScreen onBack={()=>setScreen(null)} userId={userId} color={PROFILES[profile].color}/>;

  const p=PROFILES[profile];
  const w=getTodayWorkout(profile);
  const meals=MEALS[profile];
  const done=exercises.filter(Boolean).length;
  const pct=done===0?0:Math.round(done/w.length*100);
  const habitsDone=habits.filter(Boolean).length;
  const todayIdx=getTodayIndex();
  const today=p.weekPlan[todayIdx];
  // Fechas reales de la semana actual (lunes=idx0..domingo=idx6), para
  // cruzar cada día de entreno del plan con el historial real de sets
  // (hexis_set_logs, ya tiene fecha por registro) y saber si de verdad se
  // entrenó ese día — antes "hecho" también era un dato fijo por perfil,
  // igual que "hoy" (ver getTodayIndex). Descanso/cardio/movilidad no
  // generan set_logs, así que para esos días se respeta el dato del plan.
  const _monday=new Date(); _monday.setDate(_monday.getDate()-todayIdx); _monday.setHours(0,0,0,0);
  const weekDates=Array.from({length:7},(_,i)=>{ const d=new Date(_monday); d.setDate(_monday.getDate()+i); return d.toISOString().split('T')[0]; });
  const trainedDates=new Set(setLogs.filter(l=>l.profile===profile).map(l=>l.date));
  const weekPlanDone=(d,i)=> d.type==="train" ? trainedDates.has(weekDates[i]) : d.done;
  const quoteIdx=streakDay%DAILY_QUOTES.length;
  const validW=weightLog.map(e=>e.value);
  const wTrend=validW.length>1?(validW[validW.length-1]-validW[0]).toFixed(1):0;

  // ── Score de Coherencia: stats derivados de datos reales ya trackeados
  const coherenceStepsHabit=(p.habits||[]).find(h=>/pasos/i.test(h));
  const coherenceStepsTarget=coherenceStepsHabit?parseInt(coherenceStepsHabit.match(/\d+/)?.[0]||'8000'):8000;
  const coherenceLast7Steps=stepsLog.slice(-7);
  const coherenceAvgSteps=coherenceLast7Steps.length?Math.round(coherenceLast7Steps.reduce((s,e)=>s+e.steps,0)/coherenceLast7Steps.length):0;
  const coherenceLast7Sleep=sleepLog.slice(-7);
  const coherenceAvgSleep=coherenceLast7Sleep.length?Math.round((coherenceLast7Sleep.reduce((s,e)=>s+e.hours,0)/coherenceLast7Sleep.length)*10)/10:0;
  const coherenceEffWeekly=weeklyEffort(setLogs);
  const coherenceEffortLast=coherenceEffWeekly.length?coherenceEffWeekly[coherenceEffWeekly.length-1].effort:null;
  let coherenceWeightOnTrack=null;
  if(goalWeight&&validW.length>=2){
    coherenceWeightOnTrack=Math.abs(validW[validW.length-1]-goalWeight)<Math.abs(validW[0]-goalWeight);
  }
  const coherenceStats={
    habitsPct:habits.length?Math.round((habitsDone/habits.length)*100):0,
    exPct:w.length?Math.round((done/w.length)*100):0,
    avgSteps:coherenceAvgSteps, stepsTarget:coherenceStepsTarget,
    avgSleep:coherenceAvgSleep, streakDay,
    effortLast:coherenceEffortLast, weightOnTrack:coherenceWeightOnTrack,
  };
  const recoveryFatigue=fatigueRatio(setLogs).ratio;
  if(screen==="mirror") return <MirrorScreen onBack={()=>setScreen(null)} isPro={isPro} onUnlocked={()=>setIsPro(true)} archetype={profile} color={p.color} stats={coherenceStats} mirrorLog={mirrorLog} onSave={(log)=>setMirrorLog(log)}/>;
  const baseMacros={cal:plan?.cal||p.cal, prot:plan?.prot||p.prot, carbs:plan?.carbs||p.carbs, fat:plan?.fat||p.fat};
  const activeMacros=(isPro&&cycle&&CYCLES[cycle.id])?applyCycleMacros(baseMacros,cycle.id):baseMacros;
  const cycleProgress=isPro?getCycleProgress(cycle):null;

  const scr={paddingBottom:90,overflowY:"auto",minHeight:"100vh",background:BG,fontFamily:"Poppins,sans-serif",color:"#fff"};
  const root={maxWidth:430,minHeight:"100vh",background:BG,margin:"0 auto",fontFamily:"Poppins,sans-serif",color:"#fff",position:"relative",overflow:"hidden"};

  return(
    <div style={root}>

    {tab==="inicio"&&(
      <div style={scr}>
        <div style={{position:"relative"}}>
          <Hero img="/estatuas/columnas_1.jpg" imgPos="center 35%" h={240}>
            <div style={{fontSize:11,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>{p.phase}</div>
            <div style={{fontSize:28,fontWeight:900,letterSpacing:2,marginBottom:3}}>{profile}</div>
            <div style={{fontSize:11,color:"#666"}}>{p.sub} · {p.goal}</div>
          </Hero>
          <div onClick={()=>setScreen("perfil")} title="Perfil y ajustes" style={{position:"absolute",top:16,right:16,zIndex:5,width:36,height:36,borderRadius:"50%",background:"rgba(5,5,5,0.55)",border:"1px solid rgba(200,170,80,0.35)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:G}}>👤</div>
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{background:"rgba(200,170,80,0.06)",border:"1px solid rgba(200,170,80,0.15)",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:28}}>🔥</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:900,color:G}}>{streakDay} días</div>
              <div style={{fontSize:11,color:"#666"}}>Racha activa · El sistema sigue contigo</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#8a8a8a",letterSpacing:2,textTransform:"uppercase"}}>Récord: {streakBest}d</div>
              <div style={{fontSize:11,color:"#555"}}>{habitsDone}/{habits.length} hábitos</div>
            </div>
          </div>
          <SLabel text="Tu progreso"/>
          <RankBadge color={p.color} habitsDone={habitsDone} habitsTotal={habits.length} exDone={done} exTotal={w.length} water={water} streakDay={streakDay}/>
          {isPro&&(
            <>
              <SLabel text="Identidad" right="HEXIS PRO"/>
              <CoherenceCard archetype={profile} color={p.color} stats={coherenceStats}/>
            </>
          )}
          {isPro&&cycle&&cycleProgress&&(
            <div style={{background:"#0c0c0c",border:`1px solid ${p.color}55`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,letterSpacing:3,color:p.color,textTransform:"uppercase"}}>{cycleProgress.cycle.icon} Ciclo · {cycleProgress.cycle.label}</div>
                <div style={{fontSize:11,color:"#8a8a8a"}}>Semana {cycleProgress.weekNum}/{cycleProgress.totalWeeks}</div>
              </div>
              <div style={{height:6,background:"#1a1a1a",borderRadius:100,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${cycleProgress.pct}%`,background:p.color,borderRadius:100}}/>
              </div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.6}}>{cycleProgress.cycle.emphasis}</div>
              {cycleProgress.done&&<div style={{fontSize:11,color:G,marginTop:8}}>✦ Ciclo completado — elige el siguiente en Perfil → Ciclo de entrenamiento.</div>}
            </div>
          )}
          <SLabel text="Macros de hoy" right={isPro&&cycle?`Ajustado: ${cycleProgress.cycle.label}`:undefined}/>
          <MacroGrid cal={activeMacros.cal} prot={activeMacros.prot} carbs={activeMacros.carbs} fat={activeMacros.fat} color={p.color}/>
          {today&&(
            <>
              <SLabel text="Hoy"/>
              <div onClick={()=>today.type!=="rest"&&setTab("entreno")} style={{background:today.type==="rest"?"#080808":"rgba(200,170,80,0.04)",border:`1px solid ${today.type==="rest"?"#111":"rgba(200,170,80,0.15)"}`,borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14,cursor:today.type==="rest"?"default":"pointer"}}>
                <div style={{fontSize:26}}>{typeIcon[today.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:2}}>{today.focus}</div>
                  <div style={{fontSize:11,color:"#555"}}>{today.type==="rest"?"Recuperación activa · No es perder el día":`${p.days} días/semana · Ver detalles en Entreno`}</div>
                </div>
                {today.type!=="rest"&&<div style={{fontSize:14,color:"#8a8a8a"}}>→</div>}
              </div>
            </>
          )}
          <SLabel text="Esta semana" right={`${p.weekPlan.filter((d,i)=>weekPlanDone(d,i)&&d.type==="train").length}/${p.weekPlan.filter(d=>d.type==="train").length} entrenos`}/>
          <div style={{display:"flex",gap:5,marginBottom:16}}>
            {p.weekPlan.map((d,i)=>{
              const isToday=i===todayIdx;
              const isDone=weekPlanDone(d,i);
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",aspectRatio:1,borderRadius:8,background:isToday?"rgba(200,170,80,0.12)":isDone?"rgba(200,170,80,0.06)":"#0c0c0c",border:`1px solid ${isToday?G:isDone?"rgba(200,170,80,0.25)":"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>
                    {isDone?(d.type==="rest"?"🌙":"✓"):(isToday?"→":"·")}
                  </div>
                  <span style={{fontSize:8,color:isToday?G:isDone?"#555":"#2a2a2a"}}>{d.day}</span>
                </div>
              );
            })}
          </div>
          <SLabel text="Entreno · vista rápida" right={`${done}/${w.length} · ${pct}%`}/>
          <PBar pct={pct} h={3}/>
          <div style={{height:8}}/>
          <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            {w.slice(0,3).map(({name,sets,reps,muscle},i)=>(
              <div key={i} onClick={()=>{
              const newE = exercises.map((v,j)=>j===i?!v:v);
              setExercises(newE);
              saveExercises(newE);
            }} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<2?"1px solid #0e0e0e":"none",cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:700,color:exercises[i]?"#2a2a2a":p.color,minWidth:18}}>{`0${i+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:exercises[i]?"#3a3a3a":"#bbb",textDecoration:exercises[i]?"line-through":"none"}}>{name}</div>
                  <div style={{fontSize:11,color:"#787878",marginTop:1}}>{muscle} · {sets}×{reps}</div>
                </div>
                <div style={{width:22,height:22,borderRadius:"50%",border:`1px solid ${exercises[i]?p.color:"#222"}`,background:exercises[i]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#050505",flexShrink:0}}>{exercises[i]?"✓":""}</div>
              </div>
            ))}
          </div>
          <SLabel text="Hábitos de hoy" right={`${habitsDone}/${habits.length}`}/>
          {p.habits.map((h,i)=>(
            <div key={i} onClick={()=>{
              const newH = habits.map((v,j)=>j===i?!v:v);
              setHabits(newH);
              saveHabits(newH);
              const s=updateStreak(newH.filter(Boolean).length);
              setStreakData(s);
            }} style={{display:"flex",alignItems:"center",gap:12,background:"#0c0c0c",border:`1px solid ${habits[i]?"rgba(200,170,80,0.1)":"#111"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
              <div style={{fontSize:16,flexShrink:0}}>{p.habitIcons[i]}</div>
              <div style={{flex:1,fontSize:13,color:habits[i]?"#444":"#aaa",textDecoration:habits[i]?"line-through":"none"}}>{h}</div>
              <div style={{width:20,height:20,borderRadius:"50%",border:`1px solid ${habits[i]?p.color:"#6b6b6b"}`,background:habits[i]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#050505",flexShrink:0}}>{habits[i]?"✓":""}</div>
            </div>
          ))}
          {habitsDone===habits.length&&habits.length>0&&(
            <div style={{background:"rgba(200,170,80,0.06)",border:"1px solid rgba(200,170,80,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:13,color:G,fontWeight:600}}>✦ Todos los hábitos completados</div>
              <div style={{fontSize:11,color:"#555",marginTop:3}}>El sistema sigue construyendo quien eres.</div>
            </div>
          )}
          {habitsDone<habits.length&&habitsDone>0&&(
            <div style={{background:"#08080a",border:"1px solid #111",borderRadius:10,padding:"12px 16px",marginBottom:12}}>
              <div style={{fontSize:11,color:"#555",lineHeight:1.65}}>💡 <span style={{color:"#777"}}>El sistema no se rompe si faltas un día.</span> La coherencia importa más que la perfección.</div>
            </div>
          )}
          <SLabel text="Logros automáticos" right="Cruzado con tus datos"/>
          <div style={{marginBottom:16}}>
            <AutoAchievements stats={coherenceStats} color={p.color}/>
          </div>
          <SLabel text="Seguimiento de peso" right={<span onClick={()=>setShowProgress(!showProgress)} style={{color:G,cursor:"pointer",fontSize:11}}>Ver gráfico</span>}/>
          <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#8a8a8a",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Media semanal</div>
                <div style={{fontSize:22,fontWeight:700}}>{(validW.reduce((a,b)=>a+b,0)/validW.length).toFixed(1)}<span style={{fontSize:12,color:"#8a8a8a"}}> kg</span></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#8a8a8a",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Tendencia</div>
                <div style={{fontSize:18,fontWeight:700,color:parseFloat(wTrend)<0?"#8BA4A0":parseFloat(wTrend)>0?"#C8AA50":"#666"}}>{wTrend>0?"+":""}{wTrend} kg</div>
              </div>
            </div>
            {showProgress&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:56,marginBottom:8}}>
                {["L","M","X","J","V","S","D"].map((d,i)=>{
                  const entry=weightLog.slice(-7)[i];
                  const val=entry?entry.value:null;
                  const min=Math.min(...validW)-0.5;
                  const max=Math.max(...validW)+0.5;
                  const bh=val?Math.round(((val-min)/(max-min))*44)+10:4;
                  return(
                    <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      {val&&<div style={{fontSize:7,color:"#555"}}>{val}</div>}
                      <div style={{width:"100%",height:bh,background:val?(i===6?G:"#1a1a1a"):"#0c0c0c",borderRadius:3,marginTop:"auto"}}/>
                      <div style={{fontSize:7,color:"#7a7a7a"}}>{d}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input
                type="number"
                placeholder="Ej: 74.5"
                value={weightInput}
                onChange={e=>setWeightInput(e.target.value)}
                style={{flex:1,background:"#111",border:"1px solid #1a1a1a",borderRadius:6,padding:"8px 12px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:13,outline:"none"}}
              />
              <button onClick={()=>{
                const v=parseFloat(weightInput);
                if(!v||v<20||v>300)return;
                const log=saveWeight(v);
                setWeightLog(log);
                setWeightInput('');
                logWeightToCloud(userId,v);
              }} style={{padding:"8px 14px",background:p.color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                Guardar
              </button>
            </div>
            <div style={{fontSize:11,color:"#8a8a8a",lineHeight:1.6}}>{validW.length===0?"Introduce tu peso cada mañana para ver la tendencia real.":"La tendencia semanal importa, no el número de hoy. El peso fluctúa ±1-2kg por agua y digestión."}</div>
          </div>
          <div onClick={()=>setScreen("progress")} style={{background:"rgba(200,170,80,0.04)",border:"1px solid rgba(200,170,80,0.15)",borderRadius:12,padding:"16px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:28}}>📸</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Antes / Después</div>
              <div style={{fontSize:11,color:"#555"}}>Fotos de progreso privadas + feedback opcional</div>
            </div>
            <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
          </div>
          {isPro&&(
            <div onClick={()=>setScreen("mirror")} style={{background:"rgba(200,170,80,0.04)",border:"1px solid rgba(200,170,80,0.15)",borderRadius:12,padding:"16px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>🪞</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Espejo de Coherencia</div>
                <div style={{fontSize:11,color:"#555"}}>{mirrorLog.some(e=>e.date===new Date().toISOString().split('T')[0])?"Hoy ya cerraste el día ✓":"Cierre opcional del día — nunca obligatorio"}</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          )}
          <ProTeaser isPro={isPro} onUnlocked={()=>setIsPro(true)}/>
          <Quote text={`"${DAILY_QUOTES[quoteIdx]}"`} attr="Filosofía HEXIS"/>
        </div>
      </div>
    )}

    {tab==="entreno"&&(
      <div style={scr}>
        <Hero img="/estatuas/columnas_2.jpg" imgPos="center 40%" h={200}>
          <div style={{fontSize:11,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>{p.phase}</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:2}}>{profile} · Sesión de hoy</div>
          <div style={{fontSize:11,color:"#555"}}>{w.length} ejercicios · {p.days} días/semana</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <PBar pct={pct} h={3}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4,marginBottom:16}}>
            <div style={{fontSize:11,color:"#8a8a8a"}}>{done} de {w.length} completados</div>
            <div style={{fontSize:11,color:pct===100?G:"#444",fontWeight:pct===100?700:400}}>{pct}%{pct===100?" ✦":""}</div>
          </div>
          {isPro&&<RecoveryCard archetype={profile} fatigue={recoveryFatigue} avgSleep={coherenceAvgSleep}/>}
          <SLabel text="Ciencia del entreno" right="Con fuente"/>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>🔬 Tensión mecánica</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>La hipertrofia ocurre cuando el músculo se contrae bajo carga suficiente con rango completo. No es solo el peso, es la tensión sostenida. Siente el músculo, no solo muevas la carga.</div>
              <div style={{fontSize:10,color:"#4a4a4a",marginTop:6}}>— ACSM Position Stand sobre entreno de fuerza (2026): carga, volumen, frecuencia y rango de movimiento son los factores que más pesan.</div>
            </div>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>📊 Volumen semanal de {profile}</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>Este plan reparte entre 10 y 20 series semanales por grupo muscular grande. Por debajo de 5 series/semana el crecimiento es escaso; por encima de 20 los resultados se aplanan y sube el riesgo de fatiga acumulada.</div>
              <div style={{fontSize:10,color:"#4a4a4a",marginTop:6}}>— Schoenfeld, Ogborn &amp; Krieger (2017), meta-análisis dosis-respuesta de volumen de entreno.</div>
            </div>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>🌙 Por qué crece en el descanso</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>La mayoría de los pulsos de hormona de crecimiento nocturnos ocurren durante el sueño profundo (ondas lentas), sobre todo en las primeras horas de sueño. El entreno rompe fibra; el descanso la reconstruye. Dormir menos de 7h recorta esa ventana.</div>
              <div style={{fontSize:10,color:"#4a4a4a",marginTop:6}}>— Van Cauter et al., fisiología de la secreción de GH ligada al sueño de ondas lentas.</div>
            </div>
            <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>💊 Suplementación de {profile}</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>{p.supps.slice(0,2).map(s=>s[0]).join(" + ")} son la base para este arquetipo. Ver dosis y timing exactos en Nutrición.</div>
              <div style={{fontSize:10,color:"#4a4a4a",marginTop:6}}>— ISSN Position Stands sobre creatina y proteína (los dos suplementos con más evidencia acumulada en fuerza).</div>
            </div>
          </div>
          <div style={{fontSize:10,color:"#3a3a3a",lineHeight:1.5,marginBottom:16,padding:"0 2px"}}>Los números de tu plan (series, %1RM, proteína g/kg, ritmo de déficit/superávit) están calibrados dentro de los rangos que recomiendan estas fuentes — no sustituyen la revisión de un entrenador o médico si tienes una lesión o condición previa.</div>

          <SLabel text="Ejercicios de hoy" right="Toca para ver técnica y registrar"/>
          {w.map(({name,sets,reps,weight,unit,muscle,rpe,lastWeek,rest,how},i)=>{
            const adaptive=isPro?getAdaptiveWeight(setLogs,name,weight,reps):{weight,source:'plan'};
            const suggested=adaptive.weight;
            return(
            <div key={i} onClick={()=>{const next=expandEx===i?null:i;setExpandEx(next);if(next===null)setLoggingIdx(null);}} style={{background:"#0c0c0c",border:`1px solid ${expandEx===i?"rgba(200,170,80,0.3)":exercises[i]?"rgba(200,170,80,0.1)":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",opacity:exercises[i]&&expandEx!==i?0.5:1,transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:11,fontWeight:700,color:exercises[i]?"#2a2a2a":p.color,minWidth:22}}>{`0${i+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:exercises[i]?"#3a3a3a":"#ddd",textDecoration:exercises[i]?"line-through":"none",marginBottom:4}}>{name}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"#777"}}>{sets}×{reps}</span>
                    <span style={{fontSize:11,color:"#888"}}>{suggested>0?`${suggested}${unit}`:unit}</span>
                    <span style={{fontSize:11,color:"#555"}}>{muscle}</span>
                    <span style={{fontSize:11,color:"#787878"}}>RPE {rpe}</span>
                    <span style={{fontSize:11,color:"#787878"}}>⏱ {rest}</span>
                  </div>
                  {!exercises[i]&&(
                    <div style={{fontSize:11,color:G,marginTop:4,opacity:0.7}}>
                      {adaptive.source==='progression'&&`↑ Progresaste — hoy toca ${suggested}${unit}`}
                      {adaptive.source==='deload'&&`↓ Dos sesiones al límite — hoy bajamos a ${suggested}${unit}`}
                      {adaptive.source==='hold'&&`→ Mantén ${suggested}${unit} esta sesión`}
                      {adaptive.source==='plan'&&lastWeek>0&&`Semana pasada: ${lastWeek}${unit} · Sube 2.5kg si completaste todo`}
                    </div>
                  )}
                </div>
                <div onClick={(e)=>{
                  e.stopPropagation();
                  if(exercises[i]){
                    const newE=exercises.map((v,j)=>j===i?false:v);
                    setExercises(newE);saveExercises(newE);
                    setSetLogs(removeSetLog(name));
                  }else{
                    setLoggingIdx(i);
                    setLogForm({weight:String(suggested||''),reps:String(parseInt(reps)||reps),rir:'2'});
                    setExpandEx(i);
                  }
                }} style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${exercises[i]?p.color:"#222"}`,background:exercises[i]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#050505",flexShrink:0}}>{exercises[i]?"✓":""}</div>
              </div>
              {expandEx===i&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:5}}>Técnica de ejecución</div>
                  <div style={{fontSize:12,color:"#888",lineHeight:1.7,marginBottom:10}}>{how}</div>
                  <div style={{display:"flex",gap:16,marginBottom:loggingIdx===i?14:0}}>
                    <div><div style={{fontSize:8,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Descanso</div><div style={{fontSize:12,color:"#aaa",fontWeight:600}}>{rest}</div></div>
                    <div><div style={{fontSize:8,color:"#8a8a8a",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Peso sugerido</div><div style={{fontSize:12,color:"#aaa",fontWeight:600}}>{suggested}{unit}{!isPro&&" (fijo)"}</div></div>
                  </div>
                  {loggingIdx===i&&(
                    <div style={{background:"#080808",border:"1px solid #151515",borderRadius:10,padding:12}}>
                      <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:8}}>Registra tu serie real</div>
                      <div style={{display:"flex",gap:8,marginBottom:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#666",marginBottom:3}}>Peso ({unit})</div>
                          <input type="number" value={logForm.weight} onChange={e=>setLogForm({...logForm,weight:e.target.value})} style={{...inp,marginBottom:0,padding:"8px 10px",fontSize:13}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:9,color:"#666",marginBottom:3}}>Reps hechas</div>
                          <input type="number" value={logForm.reps} onChange={e=>setLogForm({...logForm,reps:e.target.value})} style={{...inp,marginBottom:0,padding:"8px 10px",fontSize:13}}/>
                        </div>
                      </div>
                      <div style={{fontSize:9,color:"#666",marginBottom:4}}>RIR — repeticiones que te quedaban en el tanque</div>
                      <div style={{display:"flex",gap:6,marginBottom:12}}>
                        {[0,1,2,3,4].map(r=>(
                          <div key={r} onClick={()=>setLogForm({...logForm,rir:String(r)})} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${logForm.rir===String(r)?p.color:"#1a1a1a"}`,background:logForm.rir===String(r)?"rgba(200,170,80,0.12)":"transparent",color:logForm.rir===String(r)?p.color:"#666"}}>{r}</div>
                        ))}
                      </div>
                      <div onClick={()=>{
                        const wgt=parseFloat(logForm.weight)||0;
                        const rp=parseInt(logForm.reps)||0;
                        const rir=parseInt(logForm.rir);
                        const entry={date:new Date().toISOString().split('T')[0],exercise:name,profile,weight:wgt,reps:rp,sets:parseInt(sets)||1,rir};
                        setSetLogs(saveSetLog(entry));
                        const newE=exercises.map((v,j)=>j===i?true:v);
                        setExercises(newE);saveExercises(newE);
                        logExerciseToCloud(userId,{name,weight:wgt,reps:rp,sets:parseInt(sets)||1,rir});
                        setLoggingIdx(null);
                      }} style={{textAlign:"center",padding:"11px",borderRadius:8,background:p.color,color:"#050505",fontSize:12,fontWeight:700,letterSpacing:1,cursor:"pointer"}}>Registrar serie ✓</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
          <div style={{background:"#080808",border:"1px solid #111",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:11,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>⚙️ Sobrecarga progresiva</div>
            <div style={{fontSize:12,color:"#666",lineHeight:1.75}}>
              {isPro
                ?"Cada peso sugerido arriba se calcula con tu historial real: sube si completaste las reps con margen (RIR≥2), se mantiene si fue justo, y baja un 10% si fallas dos sesiones seguidas."
                :<>Si completaste todos los sets la semana pasada, sube <span style={{color:"#aaa"}}>2.5kg</span> en compuestos y <span style={{color:"#aaa"}}>1kg</span> en aislamiento. <span style={{color:G}}>El cálculo automático con tu progreso real es una función PRO.</span></>}
            </div>
          </div>
          <SLabel text="Plan semanal" right="Toca un día de cardio para ver el protocolo"/>
          {p.weekPlan.map((d,i)=>{
            const isToday=i===todayIdx;
            const isDone=weekPlanDone(d,i);
            const cardioProto=d.type==="cardio"?getCardioProtocol(d.focus):null;
            const mobilityProto=d.type==="mobility"?getMobilityProtocol(d.focus):null;
            const dayProto=cardioProto||mobilityProto;
            return(
            <div key={i} onClick={()=>dayProto&&setExpandDay(expandDay===i?null:i)} style={{background:isToday?"rgba(200,170,80,0.04)":"#0a0a0a",border:`1px solid ${expandDay===i?"rgba(200,170,80,0.3)":isToday?G:"#111"}`,borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:dayProto?"pointer":"default"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:isDone?(d.type==="rest"?"#0a0808":"rgba(200,170,80,0.1)"):"#0c0c0c",border:`1px solid ${isDone?(d.type==="rest"?"#1a1008":G):"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                  {isDone?(d.type==="rest"?"🌙":"✓"):(isToday?"→":typeIcon[d.type]||"·")}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:isToday?G:isDone?"#555":"#888"}}>{d.day}</div>
                  <div style={{fontSize:11,color:isToday?"#777":"#3a3a3a"}}>{d.focus}{dayProto&&" 🔬"}</div>
                </div>
                {isToday&&<div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",border:`1px solid ${G}`,padding:"2px 8px",borderRadius:100,opacity:0.7}}>HOY</div>}
              </div>
              {expandDay===i&&dayProto&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>
                  <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:5}}>{dayProto.label}</div>
                  <div style={{fontSize:12,color:"#aaa",lineHeight:1.7,marginBottom:8}}>{dayProto.protocol}</div>
                  <div style={{fontSize:11,color:"#666",lineHeight:1.6,marginBottom:8}}>{dayProto.why}</div>
                  {cardioProto&&<div style={{fontSize:11,color:"#8a8a8a"}}>💓 Zona objetivo: {cardioProto.fc}</div>}
                  {mobilityProto&&<div style={{fontSize:11,color:"#8a8a8a"}}>💡 {mobilityProto.tip}</div>}
                </div>
              )}
            </div>
            );
          })}
          {/* DB ACCESS */}
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginTop:8,cursor:"pointer"}} onClick={()=>setScreen("exdb")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>💪</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Base de datos de ejercicios</div>
                <div style={{fontSize:11,color:"#555"}}>43 ejercicios · Cuerpo interactivo · Ciencia aplicada</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          </div>
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginTop:8,cursor:"pointer"}} onClick={()=>setScreen("atlas")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>🏺</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Atlas muscular</div>
                <div style={{fontSize:11,color:"#555"}}>Los 20 grupos reales, con sus subdivisiones anatómicas</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          </div>
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginTop:8,marginBottom:16,cursor:"pointer"}} onClick={()=>setScreen("metrics")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>📊</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Métricas de rendimiento</div>
                <div style={{fontSize:11,color:"#555"}}>Tensión, calorías, sueño, VO2, peso y objetivos{!isPro?" 🔒":""}</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          </div>
          <Quote text='"La tensión mecánica progresiva es el único estímulo real de hipertrofia."' attr="Ciencia HEXIS"/>
        </div>
      </div>
    )}

    {tab==="nutricion"&&(
      <div style={scr}>
        <Hero img="/estatuas/columnas_3.jpg" imgPos="center 40%" h={190}>
          <div style={{fontSize:11,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>Nutrición · Hoy</div>
          <div style={{fontSize:18,fontWeight:700}}>{meals.reduce((s,m)=>s+m.kcal,0)} kcal · {meals.length} comidas</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <SLabel text="Macros objetivo"/>
          <MacroGrid cal={activeMacros.cal} prot={activeMacros.prot} carbs={activeMacros.carbs} fat={activeMacros.fat} color={p.color}/>
          {isPro&&cycle&&<div style={{fontSize:11,color:"#666",marginTop:-8,marginBottom:12}}>Ajustado por tu ciclo activo: {CYCLES[cycle.id]?.label}</div>}
          <div style={{background:"#0c0c0c",border:"1px solid #111",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:12,color:"#666"}}>💧 Hidratación objetivo 2.5L</div>
              <div style={{fontSize:11,color:"#8BA4A0",fontWeight:600}}>{water}/8 vasos</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} onClick={()=>{const nw=water===i+1?i:i+1;setWater(nw);saveWater(nw);}} style={{flex:1,aspectRatio:1,borderRadius:"50%",border:`1px solid ${water>i?"#8BA4A0":"#1a1a1a"}`,background:water>i?"rgba(139,164,160,0.18)":"#0c0c0c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer"}}>💧</div>
              ))}
            </div>
          </div>
          <SLabel text="Comidas del día"/>
          {meals.map((meal,i)=>(
            <div key={i} style={{background:"#0c0c0c",border:`1px solid ${expandMeal===i?"rgba(200,170,80,0.15)":"#111"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}} onClick={()=>setExpandMeal(expandMeal===i?null:i)}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{minWidth:44}}><div style={{fontSize:11,color:p.color,fontWeight:600,letterSpacing:1}}>{meal.time}</div></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:3}}>{meal.name}</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{meal.items}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#888"}}>{meal.kcal}<span style={{fontSize:11,color:"#8a8a8a"}}> kcal</span></div>
                  <div style={{fontSize:11,color:"#555"}}>{meal.prot}g prot</div>
                </div>
              </div>
              {expandMeal===i&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>
                  <div style={{fontSize:11,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>¿Por qué este plato?</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{meal.why}</div>
                </div>
              )}
            </div>
          ))}
          <SLabel text="Suplementación"/>
          <div style={{background:"#0a0a0a",border:"1px solid #111",borderRadius:12,overflow:"hidden",marginBottom:14}}>
            {p.supps.map(([name,dose,timing],i)=>(
              <div key={i} onClick={()=>setExpandSupp(expandSupp===i?null:i)} style={{padding:"13px 16px",borderBottom:i<p.supps.length-1?"1px solid #111":"none",cursor:"pointer",background:expandSupp===i?"rgba(200,170,80,0.03)":"transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#ddd"}}>{name}</div>
                  <div style={{fontSize:12,color:p.color,fontWeight:600}}>{dose}</div>
                </div>
                {expandSupp===i&&<div style={{fontSize:11,color:"#666",marginTop:6}}>⏰ {timing}</div>}
              </div>
            ))}
          </div>
          {/* DB ACCESS */}
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginBottom:12,cursor:"pointer"}} onClick={()=>setScreen("nutdb")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>🍽</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Base de datos nutricional</div>
                <div style={{fontSize:11,color:"#555"}}>Alimentos · Macros · Plato interactivo · Suplementos</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          </div>
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginBottom:16,cursor:"pointer"}} onClick={()=>setScreen("analyze")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>📸</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Analiza tu plato con IA</div>
                <div style={{fontSize:11,color:"#555"}}>Sube una foto y recibe un desglose{!isPro?" 🔒":""}</div>
              </div>
              <div style={{fontSize:18,color:"#8a8a8a"}}>→</div>
            </div>
          </div>
          <Quote text='"La nutrición no es una prisión. Es una guía flexible. La tendencia semanal importa más que el dato de hoy."' attr="Principio HEXIS"/>
        </div>
      </div>
    )}

    {tab==="tips"&&(
      <div style={scr}>
        <Hero img="/estatuas/columnas_4.jpg" imgPos="center 30%" h={190}>
          <div style={{fontSize:11,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>Conocimiento · Ciencia · Filosofía</div>
          <div style={{fontSize:18,fontWeight:700}}>HEXIS Tips</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{background:"#080808",border:`1px solid ${G}22`,borderRadius:12,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:8}}>Kalokagathia · καλοκαγαθία</div>
            <div style={{fontFamily:PF,fontSize:14,fontStyle:"italic",color:"#777",lineHeight:1.75,marginBottom:10}}>"La unión perfecta entre cuerpo bello y alma virtuosa. No como opuestos. Como una sola cosa."</div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>Los griegos no separaban el físico del carácter. El esculpido griego nacía de <strong style={{color:"#777"}}>vivir bien, de forma coherente, cada día.</strong></div>
          </div>
          <div style={{borderLeft:`2px solid ${p.color}`,background:"#080808",borderRadius:"0 10px 10px 0",padding:14,marginBottom:14}}>
            <div style={{fontSize:11,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>{profile} · Tu manifiesto</div>
            <div style={{fontFamily:PF,fontSize:13,fontStyle:"italic",color:"#777",lineHeight:1.7}}>"{p.manifesto}"</div>
          </div>
          <SLabel text="Los 6 principios HEXIS"/>
          {PRINCIPLES.map((pr,i)=>(
            <div key={pr.n} onClick={()=>setExpandPrinciple(expandPrinciple===i?null:i)} style={{background:"#0c0c0c",border:`1px solid ${expandPrinciple===i?"rgba(200,170,80,0.2)":"#111"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:20}}>{pr.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:2,marginBottom:3}}>{pr.n}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#ddd"}}>{pr.title}</div>
                </div>
                <div style={{fontSize:14,color:"#7a7a7a"}}>{expandPrinciple===i?"−":"+"}</div>
              </div>
              {expandPrinciple===i&&<div style={{fontSize:12,color:"#666",lineHeight:1.75,marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>{pr.body}</div>}
            </div>
          ))}
          <SLabel text="Ciencia aplicada"/>
          {TIPS.map((t,i)=>(
            <div key={i} onClick={()=>setExpandTip(expandTip===i?null:i)} style={{background:"#0c0c0c",border:`1px solid ${expandTip===i?t.color+"33":"#111"}`,borderRadius:12,padding:"16px",marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:expandTip===i?10:0}}>
                <span style={{fontSize:18}}>{t.icon}</span>
                <div style={{flex:1}}>
                  <span style={{fontSize:11,letterSpacing:3,color:t.color,textTransform:"uppercase"}}>{t.tag}</span>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginTop:3}}>{t.title}</div>
                </div>
                <div style={{fontSize:14,color:"#7a7a7a"}}>{expandTip===i?"−":"+"}</div>
              </div>
              {expandTip===i&&<div style={{fontSize:13,color:"#666",lineHeight:1.75,paddingTop:10,borderTop:"1px solid #1a1a1a"}}>{t.body}</div>}
            </div>
          ))}
          <SLabel text="Preparación al sueño"/>
          {(()=>{const sp=SLEEP_PREP[profile]||SLEEP_PREP.ALPHA;const br=BREATHING_PROTOCOLS[sp.breathing];return(
          <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,letterSpacing:2,color:p.color,textTransform:"uppercase",marginBottom:8}}>🌙 {profile}, antes de dormir</div>
            <div style={{fontSize:12,color:"#999",lineHeight:1.7,marginBottom:12,fontStyle:"italic"}}>{sp.intro}</div>
            {sp.checklist.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:8,fontSize:12,color:"#777",lineHeight:1.6}}>
                <span style={{color:p.color,flexShrink:0}}>✓</span><span>{item}</span>
              </div>
            ))}
            {br&&<div style={{marginTop:10,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>
              <div style={{fontSize:11,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>🫁 {br.label}</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.6,marginBottom:6}}>{br.protocol}</div>
              <div style={{fontSize:10,color:"#4a4a4a"}}>— {br.source}</div>
            </div>}
          </div>
          );})()}
          <Quote text='"Lo bueno, si es simple, es doblemente bueno."' attr="Baltasar Gracián"/>
          <Quote text='"Complejo por dentro. Simple por fuera. Eso es HEXIS."' attr="Manifiesto HEXIS"/>
          <div style={{height:8}}/>
        </div>
      </div>
    )}

    <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(5,5,5,0.97)",borderTop:"1px solid #111",display:"flex",zIndex:200,backdropFilter:"blur(12px)"}}>
      {[["inicio","⊙","Inicio"],["entreno","◈","Entreno"],["nutricion","◉","Nutrición"],["tips","◇","Tips"]].map(([id,icon,label])=>(
        <div key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"11px 0 14px",cursor:"pointer",gap:3}}>
          <span style={{fontSize:18}}>{icon}</span>
          <span style={{fontSize:11,letterSpacing:1,color:tab===id?G:"#333",textTransform:"uppercase"}}>{label}</span>
          <div style={{width:4,height:4,borderRadius:"50%",background:tab===id?G:"transparent"}}/>
        </div>
      ))}
    </nav>
    </div>
  );
}
