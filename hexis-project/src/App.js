import { useState } from 'react';
import { PROFILES, WORKOUTS, MEALS } from './data/profiles';
import {
  saveProfile, loadProfile, savePlan, loadPlan, saveUserData, loadUserData,
  saveHabits, loadHabits, saveExercises, loadExercises,
  saveWater, loadWater, saveWeight, loadWeightLog,
  updateStreak, loadStreak, clearAll
} from './storage';
import { EXERCISES, MUSCLE_GROUPS } from './data/exercises';
import { FOODS, SUPPLEMENTS, MACRO_INFO } from './data/foods';

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
  {tag:"Descanso",icon:"🌙",color:"#8BA4A0",title:"El músculo crece dormido",body:"El 80% de la GH se libera en sueño profundo. Sin 7-8h, el mejor entreno da la mitad de resultados. Optimiza el sueño antes que el entreno."},
  {tag:"Hábitos",icon:"🔄",color:"#D4C5A9",title:"La regla de los 2 minutos",body:"Si un hábito tarda menos de 2 minutos en iniciarse, hazlo ahora. La acción mínima mantiene la identidad activa cada día."},
  {tag:"Mental",icon:"🧠",color:"#C8AA50",title:"El efecto identidad",body:"Cuando seas 'alguien que entrena', no necesitarás motivación. La identidad lo hace automático. No esperes motivación — actúa hasta crearla."},
  {tag:"Eficiencia",icon:"⚡",color:"#A09060",title:"El mínimo efectivo",body:"3-4 series por grupo muscular con buena ejecución producen el 80% de la adaptación. El volumen extra tiene rendimientos decrecientes."},
  {tag:"Tracking",icon:"📊",color:"#8BA4A0",title:"Media móvil semanal",body:"Pésate cada mañana en ayunas y calcula el promedio de 7 días. Ese número elimina el ruido de agua, sal y digestión. La tendencia es tu progreso real."},
  {tag:"Filosofía",icon:"🏛",color:"#C8AA50",title:"Kalokagathia aplicada",body:"Los griegos no separaban físico y carácter. Cuidar tu cuerpo con inteligencia no es vanidad, es coherencia. El físico es la expresión visible de cómo te tratas a ti mismo."},
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
  {id:"strong",l:"Fuerte",i:"⚡",d:"Potencia y control"},
  {id:"light",l:"Ligero",i:"🌬",d:"Sin peso ni tensión"},
  {id:"focused",l:"Enfocado",i:"🎯",d:"Claridad mental"},
  {id:"confident",l:"Seguro",i:"🛡",d:"Confianza real"},
  {id:"energetic",l:"Energético",i:"🔥",d:"Vitalidad constante"},
  {id:"balanced",l:"Equilibrado",i:"⚖️",d:"Mente y cuerpo"},
];
const OBSTACLES = [
  {id:"notime",l:"No tengo tiempo",i:"⏱"},
  {id:"noconstancy",l:"Me cuesta ser constante",i:"🔄"},
  {id:"confused",l:"No sé por dónde empezar",i:"🧭"},
  {id:"stress",l:"El estrés me bloquea",i:"🌀"},
  {id:"eating",l:"No controlo lo que como",i:"🍽"},
  {id:"motivation",l:"Pierdo la motivación",i:"📉"},
];

const typeIcon = {train:"💪",rest:"🌙",cardio:"🏃",mobility:"🧘"};
const levelColor = {Principiante:"#8BA4A0",Intermedio:"#C8AA50",Avanzado:"#D4C5A9"};
const sectionColor = {proteina:"#C8AA50",carbohidratos:"#A09060",verduras:"#5a7a5a",grasas:"#8BA4A0"};
const sectionLabel = {proteina:"Proteína",carbohidratos:"Carbohidratos",verduras:"Verduras",grasas:"Grasas"};

function detect(f,o){
  let best="ALPHA",top=-1;
  Object.entries(PROFILES).forEach(([id,p])=>{
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
  const m={ALPHA:1.095,HERA:0.9,ZEN:1,SHAPE:0.85,CORE:0.95};
  const pg={ALPHA:2.2,HERA:2.0,ZEN:1.8,SHAPE:2.4,CORE:1.6};
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
function FigAn(){return(<svg viewBox="0 0 300 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}><defs><radialGradient id="fan" cx="50%" cy="28%" r="65%"><stop offset="0%" stopColor="#141210"/><stop offset="100%" stopColor="#050505"/></radialGradient></defs><rect width="300" height="480" fill="url(#fan)"/><circle cx="150" cy="88" r="24" fill="none" stroke="#C8AA50" strokeWidth="1.5" opacity="0.22"/><ellipse cx="150" cy="105" rx="20" ry="26" fill="#1c1812"/><path d="M150 135 Q112 115 76 100 Q94 126 112 155 Q128 145 150 140 Z" fill="#141210" opacity="0.85"/><path d="M150 135 Q188 115 224 100 Q206 126 188 155 Q172 145 150 140 Z" fill="#141210" opacity="0.85"/><path d="M130 140 Q150 130 170 140 L178 265 Q150 278 122 265 Z" fill="#161210"/><path d="M122 263 Q150 280 178 263 L184 395 Q150 408 116 395 Z" fill="#111008"/><rect x="180" y="105" width="3" height="185" rx="1" fill="#C8AA50" opacity="0.22"/><text x="150" y="455" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C8AA50" opacity="0.18" letterSpacing="7">HEXIS</text></svg>)}
function FigB(){return(<svg viewBox="0 0 300 480" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}><defs><radialGradient id="fbk" cx="50%" cy="32%" r="62%"><stop offset="0%" stopColor="#1c1810"/><stop offset="100%" stopColor="#050505"/></radialGradient></defs><rect width="300" height="480" fill="url(#fbk)"/><ellipse cx="150" cy="98" rx="22" ry="27" fill="#1c1810"/><path d="M130 123 Q150 112 170 123 L182 146 Q150 155 118 146 Z" fill="#181610"/><path d="M118 146 Q112 180 114 228 Q128 242 150 246 Q172 242 186 228 Q188 180 182 146 Q150 155 118 146 Z" fill="#161410"/><ellipse cx="132" cy="182" rx="17" ry="22" fill="#1a1810" opacity="0.55"/><ellipse cx="168" cy="182" rx="17" ry="22" fill="#1a1810" opacity="0.55"/><rect x="147" y="150" width="6" height="84" rx="3" fill="#1e1c12" opacity="0.5"/><path d="M114 244 Q150 262 186 244 L188 350 Q150 364 112 350 Z" fill="#111008"/><rect x="120" y="348" width="24" height="96" rx="8" fill="#0f0d06"/><rect x="156" y="348" width="24" height="96" rx="8" fill="#0f0d06"/><text x="150" y="455" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C8AA50" opacity="0.18" letterSpacing="7">HEXIS</text></svg>)}

const FIGS={ALPHA:FigW,HERA:FigG,ZEN:FigAn,SHAPE:FigA,CORE:FigB};

// ── UI COMPONENTS ────────────────────────────────────────────────
function Hero({Fig,children,h=220}){
  return(
    <div style={{position:"relative",height:h,overflow:"hidden",flexShrink:0,background:BG}}>
      <Fig/>
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
          <div style={{fontSize:9,color:"#444"}}>{u}</div>
          <div style={{fontSize:8,letterSpacing:1,color:"#3a3a3a",textTransform:"uppercase",marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Quote({text,attr,color=G}){
  return(
    <div style={{borderLeft:`2px solid ${color}`,background:"#080808",borderRadius:"0 10px 10px 0",padding:16,marginBottom:10}}>
      <div style={{fontFamily:PF,fontSize:13,fontStyle:"italic",color:"#777",lineHeight:1.7}}>{text}</div>
      {attr&&<div style={{fontSize:9,color:"#333",letterSpacing:2,marginTop:8,textTransform:"uppercase"}}>— {attr}</div>}
    </div>
  );
}

function SLabel({text,right}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase"}}>{text}</div>
      {right&&<div style={{fontSize:10,color:"#444"}}>{right}</div>}
    </div>
  );
}

function Btn({label,onClick,disabled,color=G,outline=false}){
  return(
    <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:15,background:disabled?"#111":outline?"transparent":`linear-gradient(135deg,${color},${color}bb)`,border:outline?`1px solid ${color}`:"none",borderRadius:4,color:disabled?"#333":outline?color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",marginBottom:8}}>{label}</button>
  );
}

const inp={width:"100%",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:8,padding:"12px 14px",color:"#fff",fontFamily:"Poppins,sans-serif",fontSize:14,outline:"none",marginBottom:12,appearance:"none",display:"block"};

// ── BODY MAP ─────────────────────────────────────────────────────
function BodyMap({gender,view,activeZone,onZoneClick}){
  const zones = view==="front" ? [
    {id:"pecho",x:35,y:26,w:30,h:14,label:"Pecho"},
    {id:"hombros",x:22,y:20,w:14,h:11,label:"Hombro"},
    {id:"hombros",x:64,y:20,w:14,h:11,label:"Hombro"},
    {id:"biceps",x:14,y:32,w:11,h:13,label:"Bíceps"},
    {id:"biceps",x:75,y:32,w:11,h:13,label:"Bíceps"},
    {id:"core",x:37,y:41,w:26,h:15,label:"Core"},
    {id:"pierna",x:32,y:57,w:16,h:22,label:"Pierna"},
    {id:"pierna",x:52,y:57,w:16,h:22,label:"Pierna"},
  ] : [
    {id:"espalda",x:30,y:22,w:40,h:22,label:"Espalda"},
    {id:"hombros",x:20,y:18,w:12,h:10,label:"Hombro"},
    {id:"hombros",x:68,y:18,w:12,h:10,label:"Hombro"},
    {id:"triceps",x:13,y:30,w:10,h:13,label:"Tríceps"},
    {id:"triceps",x:77,y:30,w:10,h:13,label:"Tríceps"},
    {id:"gluteo",x:33,y:48,w:34,h:13,label:"Glúteo"},
    {id:"isquios",x:32,y:62,w:16,h:18,label:"Isquios"},
    {id:"isquios",x:52,y:62,w:16,h:18,label:"Isquios"},
  ];
  const skin="#221a0a";
  return(
    <svg viewBox="0 0 100 100" style={{width:"100%",maxWidth:180,display:"block",margin:"0 auto"}}>
      {view==="front"?(
        <g opacity="0.75">
          <ellipse cx="50" cy="11" rx="8" ry="9" fill={skin}/>
          <rect x="46" y="19" width="8" height="5" fill={skin}/>
          <path d="M30 24 Q28 26 27 44 L35 46 L35 57 L65 57 L65 46 L73 44 Q72 26 70 24 Z" fill={skin}/>
          <path d="M27 25 Q19 28 17 44 L22 46 Q25 37 30 27 Z" fill={skin}/>
          <path d="M73 25 Q81 28 83 44 L78 46 Q75 37 70 27 Z" fill={skin}/>
          <path d="M17 44 Q15 57 17 64 L22 63 Q21 54 22 46 Z" fill={skin}/>
          <path d="M83 44 Q85 57 83 64 L78 63 Q79 54 78 46 Z" fill={skin}/>
          <path d="M35 57 Q33 71 34 87 L42 87 Q42 71 43 57 Z" fill={skin}/>
          <path d="M65 57 Q67 71 66 87 L58 87 Q58 71 57 57 Z" fill={skin}/>
          <ellipse cx="38" cy="88" rx="6" ry="3" fill={skin}/>
          <ellipse cx="62" cy="88" rx="6" ry="3" fill={skin}/>
          {gender==="female"&&<>
            <ellipse cx="43" cy="33" rx="6" ry="5" fill={skin} opacity="0.6"/>
            <ellipse cx="57" cy="33" rx="6" ry="5" fill={skin} opacity="0.6"/>
            <path d="M38 72 Q50 68 62 72" stroke={skin} strokeWidth="1" fill="none" opacity="0.4"/>
          </>}
        </g>
      ):(
        <g opacity="0.75">
          <ellipse cx="50" cy="11" rx="8" ry="9" fill={skin}/>
          <rect x="46" y="19" width="8" height="5" fill={skin}/>
          <path d="M30 24 Q28 26 27 44 L35 46 L35 59 L65 59 L65 46 L73 44 Q72 26 70 24 Z" fill={skin}/>
          <path d="M27 25 Q19 28 17 44 L22 46 Q25 37 30 27 Z" fill={skin}/>
          <path d="M73 25 Q81 28 83 44 L78 46 Q75 37 70 27 Z" fill={skin}/>
          <path d="M17 44 Q15 57 17 64 L22 63 Q21 54 22 46 Z" fill={skin}/>
          <path d="M83 44 Q85 57 83 64 L78 63 Q79 54 78 46 Z" fill={skin}/>
          <ellipse cx="43" cy="55" rx="9" ry="8" fill={skin} opacity="0.9"/>
          <ellipse cx="57" cy="55" rx="9" ry="8" fill={skin} opacity="0.9"/>
          <path d="M35 59 Q33 71 34 87 L42 87 Q42 71 43 59 Z" fill={skin}/>
          <path d="M65 59 Q67 71 66 87 L58 87 Q58 71 57 59 Z" fill={skin}/>
          <ellipse cx="38" cy="88" rx="6" ry="3" fill={skin}/>
          <ellipse cx="62" cy="88" rx="6" ry="3" fill={skin}/>
          {gender==="female"&&<>
            <ellipse cx="43" cy="57" rx="10" ry="9" fill={skin} opacity="0.8"/>
            <ellipse cx="57" cy="57" rx="10" ry="9" fill={skin} opacity="0.8"/>
          </>}
        </g>
      )}
      {zones.map((z,i)=>(
        <g key={i} onClick={()=>onZoneClick(z.id)} style={{cursor:"pointer"}}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2"
            fill={activeZone===z.id?G:"transparent"}
            stroke={activeZone===z.id?G:"#C8AA5055"}
            strokeWidth="0.7"
            opacity={activeZone===z.id?0.55:0.5}
          />
          {activeZone===z.id&&(
            <text x={z.x+z.w/2} y={z.y+z.h/2+1.5} textAnchor="middle" fontSize="3" fill="#050505" fontWeight="700" fontFamily="sans-serif">{z.label}</text>
          )}
        </g>
      ))}
    </svg>
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
function ExerciseDB({onBack}){
  const [gender,setGender]=useState("male");
  const [view,setView]=useState("front");
  const [zone,setZone]=useState(null);
  const [selEx,setSelEx]=useState(null);
  const [matFilter,setMatFilter]=useState("all");
  const mats=["all","Barra","Mancuernas","Máquina","Cable","Peso corporal"];
  const filtered=EXERCISES.filter(e=>(!zone||e.muscle===zone)&&(matFilter==="all"||e.mat===matFilter));
  return(
    <div style={{minHeight:"100vh",background:BG,color:"#fff",fontFamily:"Poppins,sans-serif",paddingBottom:80}}>
      <div style={{background:"#0a0a0a",borderBottom:"1px solid #111",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <div onClick={onBack} style={{fontSize:18,cursor:"pointer",color:"#555"}}>←</div>
        <div>
          <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase"}}>Base de datos</div>
          <div style={{fontSize:16,fontWeight:700}}>Ejercicios</div>
        </div>
      </div>
      <div style={{padding:"16px 20px 0"}}>
        <div style={{fontSize:11,color:"#555",marginBottom:14}}>Toca el cuerpo para filtrar por músculo</div>
        {/* gender+view toggle */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
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
        {/* body map */}
        <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:14,padding:"16px 20px",marginBottom:12}}>
          <BodyMap gender={gender} view={view} activeZone={zone} onZoneClick={z=>setZone(zone===z?null:z)}/>
          <div style={{textAlign:"center",marginTop:8,fontSize:11,color:zone?G:"#444",letterSpacing:zone?2:1}}>
            {zone?`${MUSCLE_GROUPS[zone]?.label} · ${EXERCISES.filter(e=>e.muscle===zone).length} ejercicios`:"Toca una zona del cuerpo"}
          </div>
        </div>
        {/* muscle chips */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:10}}>
          <div onClick={()=>setZone(null)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${!zone?G:"#1a1a1a"}`,background:!zone?"rgba(200,170,80,0.1)":"transparent",color:!zone?G:"#555",fontSize:10,cursor:"pointer"}}>Todos</div>
          {Object.entries(MUSCLE_GROUPS).map(([k,m])=>(
            <div key={k} onClick={()=>setZone(zone===k?null:k)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${zone===k?m.color:"#1a1a1a"}`,background:zone===k?`${m.color}22`:"transparent",color:zone===k?m.color:"#555",fontSize:10,cursor:"pointer",whiteSpace:"nowrap"}}>{m.icon} {m.label}</div>
          ))}
        </div>
        {/* material filter */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
          {mats.map(m=>(
            <div key={m} onClick={()=>setMatFilter(m)} style={{flexShrink:0,padding:"4px 10px",borderRadius:100,border:`1px solid ${matFilter===m?G:"#111"}`,background:matFilter===m?"rgba(200,170,80,0.08)":"transparent",color:matFilter===m?G:"#444",fontSize:9,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}}>{m==="all"?"Todos":m}</div>
          ))}
        </div>
        <SLabel text={`${filtered.length} ejercicios${zone?` · ${MUSCLE_GROUPS[zone]?.label}`:""}`}/>
        {filtered.map(ex=>(
          <div key={ex.id} onClick={()=>setSelEx(selEx?.id===ex.id?null:ex)} style={{background:"#0c0c0c",border:`1px solid ${selEx?.id===ex.id?G+"44":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:22,flexShrink:0}}>{ex.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:4}}>{ex.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"#111",color:MUSCLE_GROUPS[ex.muscle]?.color||G}}>{MUSCLE_GROUPS[ex.muscle]?.label}</span>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"#111",color:"#666"}}>{ex.mat}</span>
                  <span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"#111",color:levelColor[ex.level]||"#888"}}>{ex.level}</span>
                  <span style={{fontSize:9,color:"#444"}}>{ex.sets}</span>
                </div>
              </div>
              <div style={{fontSize:14,color:"#333"}}>{selEx?.id===ex.id?"−":"+"}</div>
            </div>
            {selEx?.id===ex.id&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Por qué funciona?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{ex.science}</div></div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Cómo ejecutarlo</div><div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{ex.cues}</div></div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Contexto científico</div><div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{ex.why}</div></div>
                <div style={{display:"flex",gap:8}}>
                  {[["Series/Reps",ex.sets],["Descanso",ex.rest]].map(([l,v])=>(
                    <div key={l} style={{background:"#111",borderRadius:8,padding:"8px 12px",flex:1}}>
                      <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#bbb"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase"}}>Base de datos</div>
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
              <div onClick={()=>setActiveSection(null)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${!activeSection?G:"#111"}`,background:!activeSection?"rgba(200,170,80,0.1)":"transparent",color:!activeSection?G:"#444",fontSize:10,cursor:"pointer"}}>Todos</div>
              {Object.entries(sectionLabel).map(([k,l])=>(
                <div key={k} onClick={()=>setActiveSection(activeSection===k?null:k)} style={{flexShrink:0,padding:"5px 12px",borderRadius:100,border:`1px solid ${activeSection===k?sectionColor[k]:"#111"}`,background:activeSection===k?`${sectionColor[k]}22`:"transparent",color:activeSection===k?sectionColor[k]:"#444",fontSize:10,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</div>
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
                    {expMacro!==k&&<div style={{fontSize:10,color:"#444"}}>Toca para saber más</div>}
                  </div>
                  <div style={{fontSize:14,color:"#333"}}>{expMacro===k?"−":"+"}</div>
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
                      <span style={{fontSize:9,color:"#333"}}>por 100g</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:"#333"}}>{selFood?.name===f.name?"−":"+"}</div>
                </div>
                {selFood?.name===f.name&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{background:"#111",borderRadius:8,padding:"12px 14px",marginBottom:10}}>
                      <div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:6}}>Ración · {f.ration}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                        {[[f.rdata.kcal,"kcal","Cal",G],[f.rdata.prot,"g","Prot","#fff"],[f.rdata.carbs,"g","Carb","#fff"],[f.rdata.fat,"g","Gras","#fff"]].map(([v,u,l,c])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{fontSize:15,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
                            <div style={{fontSize:8,color:"#444"}}>{u}</div>
                            <div style={{fontSize:7,color:"#333",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{marginBottom:8}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Micronutrientes</div><div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{f.micro}</div></div>
                    {f.gi&&f.gi!=="—"&&<div style={{marginBottom:8}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>Índice glucémico</div><div style={{fontSize:12,color:"#666"}}>{f.gi}</div></div>}
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
              <div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:6}}>Sin marcas comerciales</div>
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
                      <span style={{fontSize:9}}>{s.ev}</span>
                      <span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"#111",color:"#666"}}>{s.cat}</span>
                      <span style={{fontSize:10,color:G}}>{s.dose}</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:"#333"}}>{selSupp?.name===s.name?"−":"+"}</div>
                </div>
                {selSupp?.name===s.name&&(
                  <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1a1a1a"}}>
                    <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Qué es?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{s.what}</div></div>
                    <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>¿Para qué sirve?</div><div style={{fontSize:12,color:"#777",lineHeight:1.7}}>{s.for}</div></div>
                    <div style={{marginBottom:10}}><div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:4}}>La ciencia dice</div><div style={{fontSize:12,color:"#666",lineHeight:1.7}}>{s.science}</div></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      <div style={{background:"#111",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Dosis efectiva</div><div style={{fontSize:12,fontWeight:600,color:G}}>{s.dose}</div></div>
                      <div style={{background:"#111",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Cuándo tomarlo</div><div style={{fontSize:11,color:"#888"}}>{s.timing}</div></div>
                    </div>
                    <div style={{borderLeft:`2px solid ${G}`,background:"#080808",borderRadius:"0 8px 8px 0",padding:"10px 12px"}}><div style={{fontSize:9,letterSpacing:2,color:G,textTransform:"uppercase",marginBottom:4}}>Seguridad</div><div style={{fontSize:11,color:"#666",lineHeight:1.6}}>{s.safe}</div></div>
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
// ── TEST DE PERFIL ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    n:"01", cat:"OBJETIVO",
    q:"¿Qué resultado quieres conseguir?",
    opts:[
      {l:"A",t:"Ganar masa muscular y fuerza real — notarlo en el espejo y en el gimnasio",s:{ALPHA:3,SHAPE:1}},
      {l:"B",t:"Definirme, tonificarme y sentirme bien sin perder feminidad",s:{HERA:3,SHAPE:1}},
      {l:"C",t:"Recuperar el equilibrio, bajar el estrés y sentirme bien por dentro y por fuera",s:{ZEN:3}},
      {l:"D",t:"Perder grasa y ganar músculo al mismo tiempo — recomposición total",s:{SHAPE:3,HERA:1}},
      {l:"E",t:"Crear un hábito sólido desde cero y dejar de empezar y abandonar",s:{CORE:3}},
    ]
  },
  {
    n:"02", cat:"PUNTO DE PARTIDA",
    q:"¿Cómo describirías tu físico ahora mismo?",
    opts:[
      {l:"A",t:"Tengo base muscular pero quiero más volumen y más fuerza",s:{ALPHA:3}},
      {l:"B",t:"Estoy en un peso razonable pero quiero más tono y definición",s:{HERA:3,SHAPE:1}},
      {l:"C",t:"El estrés y el ritmo de vida han pasado factura — me siento fuera de forma",s:{ZEN:3,CORE:1}},
      {l:"D",t:"Tengo más grasa de la que quiero y menos músculo del que debería",s:{SHAPE:3,CORE:1}},
      {l:"E",t:"Nunca he tenido una rutina real — soy principiante o llevo mucho tiempo sin hacer nada",s:{CORE:3}},
    ]
  },
  {
    n:"03", cat:"NUTRICIÓN",
    q:"¿Cómo es tu relación con la alimentación?",
    opts:[
      {l:"A",t:"Como bastante y sin problema — el reto es estructurarlo para crecer",s:{ALPHA:3}},
      {l:"B",t:"Intento comer bien pero me cuesta controlar cantidades y caprichos",s:{HERA:2,SHAPE:2}},
      {l:"C",t:"Como según el estrés — cuando estoy bien como bien, cuando no, mal",s:{ZEN:3}},
      {l:"D",t:"He probado dietas pero siempre acabo abandonando o compensando",s:{SHAPE:2,CORE:2}},
      {l:"E",t:"No tengo ningún control ni estructura — como lo que hay sin pensar",s:{CORE:3}},
    ]
  },
  {
    n:"04", cat:"ESTRÉS",
    q:"¿Cómo describirías tu nivel de estrés y energía diaria?",
    opts:[
      {l:"A",t:"Alto rendimiento — mucha energía, mucha carga, pero lo llevo bien",s:{ALPHA:2,SHAPE:1}},
      {l:"B",t:"Equilibrado — algún día de estrés pero en general bien",s:{HERA:2,CORE:1}},
      {l:"C",t:"Estrés crónico — siempre con la mente acelerada, cansado pero sin poder descansar",s:{ZEN:3}},
      {l:"D",t:"Variable — hay semanas muy duras que me desregulan completamente",s:{ZEN:1,SHAPE:1,CORE:1}},
      {l:"E",t:"Poca energía en general — me cuesta arrancar y mantener el ritmo",s:{CORE:2,ZEN:1}},
    ]
  },
  {
    n:"05", cat:"DISPONIBILIDAD",
    q:"¿Cuántos días reales puedes dedicar al entrenamiento cada semana?",
    opts:[
      {l:"A",t:"5 o más días — el gimnasio es una prioridad en mi vida",s:{ALPHA:3}},
      {l:"B",t:"4 días — tengo vida, pero el entrenamiento tiene su espacio fijo",s:{HERA:2,SHAPE:2}},
      {l:"C",t:"3 días — necesito un sistema eficiente que respete mi tiempo",s:{ZEN:2,CORE:2}},
      {l:"D",t:"2 días o menos — tengo muy poco tiempo y necesito maximizar cada sesión",s:{ZEN:1,CORE:2}},
      {l:"E",t:"No lo sé — depende de la semana, no tengo rutina fija",s:{CORE:3}},
    ]
  },
  {
    n:"06", cat:"EXPERIENCIA",
    q:"¿Cuánta experiencia tienes entrenando con método real?",
    opts:[
      {l:"A",t:"Años de gimnasio — sé lo que hago pero quiero llevarlo al siguiente nivel",s:{ALPHA:3,SHAPE:1}},
      {l:"B",t:"Entreno con regularidad pero sin un plan real estructurado",s:{HERA:2,SHAPE:2}},
      {l:"C",t:"He entrenado en épocas pero siempre lo acabo dejando por estrés o falta de tiempo",s:{ZEN:2,CORE:1}},
      {l:"D",t:"Poca experiencia — he probado cosas sueltas pero nunca con un sistema",s:{CORE:2,SHAPE:1}},
      {l:"E",t:"Nula o casi nula — soy principiante de verdad",s:{CORE:3}},
    ]
  },
  {
    n:"07", cat:"MOTIVACIÓN",
    q:"¿Qué te mueve de verdad cuando piensas en cambiar tu cuerpo?",
    opts:[
      {l:"A",t:"El rendimiento — quiero ser más fuerte, más potente, más capaz",s:{ALPHA:3}},
      {l:"B",t:"La imagen — quiero verme bien, sentirme segura y que se note",s:{HERA:3,SHAPE:1}},
      {l:"C",t:"El bienestar — quiero tener energía, dormir bien y desconectar",s:{ZEN:3}},
      {l:"D",t:"La transformación total — quiero ser una versión completamente distinta de quien soy",s:{SHAPE:3}},
      {l:"E",t:"El hábito — quiero convertirme en alguien que cuida su cuerpo de forma consistente",s:{CORE:3}},
    ]
  },
  {
    n:"08", cat:"OBSTÁCULO",
    q:"¿Qué te ha frenado hasta ahora?",
    opts:[
      {l:"A",t:"No tenía el plan correcto — entrenaba pero sin estructura ni progresión real",s:{ALPHA:2,SHAPE:1}},
      {l:"B",t:"La alimentación — sé moverme pero no sé comer para mi objetivo",s:{HERA:2,SHAPE:2}},
      {l:"C",t:"El estrés y el cansancio — cuando más lo necesito, menos puedo",s:{ZEN:3}},
      {l:"D",t:"La confusión — demasiada información, no sé qué es lo correcto",s:{SHAPE:2,CORE:2}},
      {l:"E",t:"La constancia — empiezo con fuerza y a las 2-3 semanas lo abandono",s:{CORE:2,HERA:1}},
    ]
  },
  {
    n:"09", cat:"RELACIÓN CON EL CUERPO",
    q:"¿Cómo te sientes con tu cuerpo ahora mismo?",
    opts:[
      {l:"A",t:"Bien en general — pero sé que puedo ir a más y quiero ir a más",s:{ALPHA:3}},
      {l:"B",t:"Insatisfecha con algunas zonas — quiero definición sin obsesionarme",s:{HERA:3}},
      {l:"C",t:"Desconectado — el estrés me ha alejado de mi cuerpo y necesito reconectar",s:{ZEN:3}},
      {l:"D",t:"Frustrado — veo grasa donde no quiero y falta músculo donde debería haberlo",s:{SHAPE:3}},
      {l:"E",t:"Sin referencias — nunca he tenido un cuerpo del que sentirme orgulloso/a",s:{CORE:3}},
    ]
  },
  {
    n:"10", cat:"IDENTIDAD DESEADA",
    q:"¿Cómo quieres verte y sentirte dentro de 12 semanas?",
    note:"Esta pregunta tiene el doble de peso — define quién decides ser.",
    opts:[
      {l:"A",t:"Más grande, más fuerte, con una presencia física que no pase desapercibida",s:{ALPHA:6}},
      {l:"B",t:"Definida, estilizada, con confianza real en mi cuerpo y en cómo me veo",s:{HERA:6}},
      {l:"C",t:"Equilibrado, con energía estable, sin ansiedad y con una rutina que me sostenga",s:{ZEN:6}},
      {l:"D",t:"Transformado — diferente a quien soy hoy, con otro cuerpo y otra mentalidad",s:{SHAPE:6}},
      {l:"E",t:"Con un hábito sólido — siendo alguien que entrena y cuida su alimentación de verdad",s:{CORE:6}},
    ]
  },
];

const RESULTS = {
  ALPHA:{
    color:"#C8AA50",sub:"El constructor",
    tagline:"Vives para crecer. La fuerza es tu lenguaje.",
    identity:"Eres alguien que ya sabe lo que quiere. No estás aquí para ponerte en forma — estás aquí para ir al siguiente nivel. El músculo no es estética para ti. Es rendimiento. Es presencia. Es quién eres.",
    insight:"Tu mayor riesgo es entrenar sin progresión real. Volumen sin estructura. Esfuerzo sin estrategia. HEXIS ALPHA convierte cada semana en un paso medible hacia más fuerza y más masa.",
    needs:["Superávit calórico calculado con tu TDEE real","Programa de fuerza con progresión semanal medible","Proteína optimizada para síntesis muscular máxima","Suplementación que potencia el rendimiento sin relleno"],
    days:5,goal:"Superávit +250 kcal · Masa y fuerza",
    phases:["Fundamentos","Desarrollo","Potencia"],
  },
  HERA:{
    color:"#D4C5A9",sub:"La definición",
    tagline:"Forma, tono y presencia. Tu cuerpo refleja tu fuerza interior.",
    identity:"No buscas más volumen. Buscas elegancia. Quieres un cuerpo que refleje quién eres — con forma, con tono, con presencia. No la restricción de siempre. La inteligencia de saber cómo lograrlo.",
    insight:"El error más común: comer poco y hacer demasiado cardio. Resultado: pérdida de músculo y metabolismo lento. HEXIS HERA invierte esa ecuación con déficit inteligente e hipertrofia femenina.",
    needs:["Déficit suave que preserva músculo mientras elimina grasa","Entrenamiento de hipertrofia adaptado a objetivo femenino","Nutrición que no se siente como dieta","Suplementación para recuperación y colágeno articular"],
    days:4,goal:"Déficit suave -200 kcal · Definición y tono",
    phases:["Activación","Definición","Mantenimiento activo"],
  },
  ZEN:{
    color:"#8BA4A0",sub:"El reset",
    tagline:"El estrés no te define. Reconecta cuerpo y mente.",
    identity:"Tu cuerpo sabe que algo no está bien. El estrés crónico eleva el cortisol, retiene grasa, destruye músculo y bloquea el sueño. No es falta de voluntad. Es fisiología. Y tiene solución.",
    insight:"La mayoría de los programas te exigirían más de lo que tienes ahora. HEXIS ZEN hace lo contrario: te devuelve energía antes de exigirte rendimiento. Primero el equilibrio. Después el cuerpo.",
    needs:["Entrenamiento de 3 días que no añade estrés al sistema","Nutrición antiinflamatoria que regula el cortisol","Protocolo de sueño y recuperación activa","Suplementación adaptógena basada en evidencia"],
    days:3,goal:"Mantenimiento · Energía estable · Cortisol bajo",
    phases:["Reset","Equilibrio","Construcción"],
  },
  SHAPE:{
    color:"#A09060",sub:"La transformación",
    tagline:"Recomposición total. Pierdes lo que sobra, construyes lo que falta.",
    identity:"Quieres los dos objetivos a la vez — y eso es posible si se hace con el sistema correcto. La recomposición corporal no es magia. Es precisión. Macros exactos, progresión inteligente y paciencia estratégica.",
    insight:"El error más común: obsesionarse con la báscula. Puedes perder grasa, ganar músculo y ver el peso estancado — y estar progresando perfectamente. HEXIS SHAPE te enseña a leer los números correctos.",
    needs:["Déficit moderado que permite síntesis muscular simultánea","Ciclos de carbohidratos adaptados a días de entreno","Alta proteína para preservar y construir músculo","Métricas correctas: perímetros, fotos, fuerza — no solo peso"],
    days:4,goal:"Recomposición · Déficit moderado · Carb cycling",
    phases:["Recomposición","Definición","Optimización"],
  },
  CORE:{
    color:"#909090",sub:"El inicio",
    tagline:"Empiezas desde cero con claridad. Sin presión, solo progreso.",
    identity:"Empezar es el acto más valiente. No porque sea difícil — sino porque la mayoría nunca lo hace de verdad. La diferencia entre quien llega y quien no llega no es el talento. Es el sistema.",
    insight:"El error que ha saboteado todos tus intentos anteriores no eres tú. Es la ausencia de un sistema diseñado para principiantes reales. Uno que no exija perfección desde el día uno. Uno que sobreviva a los días malos.",
    needs:["Programa de 3 días con progresión gradual sin abrumar","Nutrición simple con hábitos de bajo impacto y alto efecto","Sistema antifallo — el proceso no se rompe si fallas un día","Base sólida para escalar a cualquier otro perfil"],
    days:3,goal:"Base sólida · Hábito primero · Sin presión",
    phases:["Fundamentos","Progresión","Consolidación"],
  },
};

function calcProfile(answers) {
  const scores = {ALPHA:0,HERA:0,ZEN:0,SHAPE:0,CORE:0};
  answers.forEach((letter, qi) => {
    if (!letter) return;
    const opt = QUESTIONS[qi].opts.find(o => o.l === letter);
    if (opt) Object.entries(opt.s).forEach(([p,v]) => { scores[p] += v; });
  });
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][0], scores };
}

function HexisTest() {
  const [step, setStep] = useState("intro"); // intro | test | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [animIn, setAnimIn] = useState(true);

  const q = QUESTIONS[current];
  const progress = ((current) / QUESTIONS.length) * 100;

  function handleSelect(letter) { setSelected(letter); }

  function handleNext() {
    const newAns = [...answers];
    newAns[current] = selected;
    setAnswers(newAns);
    setAnimIn(false);
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnimIn(true);
      } else {
        const r = calcProfile(newAns);
        setResult(r);
        setStep("result");
        setAnimIn(true);
      }
    }, 220);
  }

  function handleBack() {
    if (current === 0) { setStep("intro"); return; }
    setAnimIn(false);
    setTimeout(() => {
      setCurrent(c => c - 1);
      setSelected(answers[current - 1]);
      setAnimIn(true);
    }, 180);
  }

  const root = {
    maxWidth: 480, minHeight: "100vh", margin: "0 auto",
    background: BG, fontFamily: "Poppins, sans-serif", color: "#fff",
    position: "relative", overflow: "hidden",
  };

  // ── INTRO ──────────────────────────────────────────────────
  if (step === "intro") return (
    <div style={root}>
      {/* Background Greek numeral watermark */}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:280,fontFamily:PF,color:G,opacity:0.03,pointerEvents:"none",userSelect:"none",lineHeight:1}}>Χ</div>

      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"48px 32px 40px"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:6,color:G,marginBottom:8}}>HEXIS</div>
          <div style={{width:28,height:1,background:G,marginBottom:48}}/>
        </div>

        <div>
          <div style={{fontSize:9,letterSpacing:4,color:"#444",textTransform:"uppercase",marginBottom:16}}>Test de perfil · 10 preguntas</div>
          <div style={{fontFamily:PF,fontSize:42,fontWeight:700,lineHeight:1.05,marginBottom:8}}>
            Descubre
          </div>
          <div style={{fontFamily:PF,fontSize:42,fontStyle:"italic",color:G,lineHeight:1.05,marginBottom:32}}>
            quién eres.
          </div>
          <div style={{width:40,height:1,background:"#222",marginBottom:28}}/>
          <p style={{fontSize:14,color:"#888",lineHeight:1.8,marginBottom:12}}>
            No hay respuestas correctas ni incorrectas. Solo las tuyas.
          </p>
          <p style={{fontSize:14,color:"#666",lineHeight:1.8,marginBottom:40}}>
            En 3 minutos descubrirás cuál de los 5 arquetipos HEXIS eres — y qué significa eso para tu entrenamiento, tu nutrición y tu mentalidad.
          </p>

          {/* Profile chips preview */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:44}}>
            {Object.entries(RESULTS).map(([k,v])=>(
              <div key={k} style={{padding:"4px 14px",borderRadius:100,border:`1px solid ${v.color}44`,fontSize:10,color:v.color,letterSpacing:2,fontWeight:600}}>{k}</div>
            ))}
          </div>
        </div>

        <button onClick={()=>{setStep("test");setAnimIn(true);}} style={{width:"100%",padding:"18px 0",background:`linear-gradient(135deg,${G},#d4b85a)`,border:"none",borderRadius:3,color:BG,fontFamily:"Poppins,sans-serif",fontSize:13,fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:"pointer"}}>
          Comenzar el test →
        </button>
      </div>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────
  if (step === "result" && result) {
    const p = RESULTS[result.primary];
    const s = RESULTS[result.secondary];
    const col = p.color;
    const maxScore = Math.max(...Object.values(result.scores));

    return (
      <div style={root}>
        <div style={{
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.5s ease",
          minHeight:"100vh",overflowY:"auto",paddingBottom:40
        }}>
          {/* Hero */}
          <div style={{padding:"48px 32px 32px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${col},transparent)`}}/>
            <div style={{position:"absolute",top:"50%",right:-20,transform:"translateY(-50%)",fontFamily:PF,fontSize:160,color:col,opacity:0.04,fontWeight:700,pointerEvents:"none"}}>{result.primary}</div>

            <div style={{fontSize:9,letterSpacing:4,color:col,marginBottom:6}}>TU ARQUETIPO HEXIS</div>
            <div style={{width:24,height:1,background:col,marginBottom:28}}/>
            <div style={{fontFamily:PF,fontSize:52,fontWeight:700,lineHeight:1,marginBottom:8}}>{result.primary}</div>
            <div style={{fontFamily:PF,fontSize:18,fontStyle:"italic",color:col,marginBottom:16}}>{p.sub}</div>
            <div style={{fontSize:13,color:"#888",fontStyle:"italic",lineHeight:1.7}}>"{p.tagline}"</div>
          </div>

          {/* Score bars */}
          <div style={{padding:"0 32px 28px"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:14}}>PUNTUACIÓN POR PERFIL</div>
            {Object.entries(result.scores).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
              <div key={k} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,letterSpacing:2,color:k===result.primary?RESULTS[k].color:"#555",fontWeight:k===result.primary?700:400}}>{k}</span>
                  <span style={{fontSize:10,color:"#444"}}>{v} pts</span>
                </div>
                <div style={{height:3,background:"#111",borderRadius:100,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${maxScore>0?(v/maxScore)*100:0}%`,background:k===result.primary?RESULTS[k].color:"#222",borderRadius:100,transition:"width 1s ease"}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{height:1,background:"#111",margin:"0 32px 28px"}}/>

          {/* Identity */}
          <div style={{padding:"0 32px 28px"}}>
            <div style={{fontSize:9,letterSpacing:3,color:col,marginBottom:14}}>TU IDENTIDAD</div>
            <p style={{fontSize:15,color:"#ccc",lineHeight:1.85}}>{p.identity}</p>
          </div>

          {/* Insight */}
          <div style={{margin:"0 32px 28px",borderLeft:`2px solid ${col}`,paddingLeft:20,paddingTop:4,paddingBottom:4}}>
            <div style={{fontSize:9,letterSpacing:3,color:col,marginBottom:10}}>LO QUE NECESITAS SABER</div>
            <p style={{fontSize:13,color:"#888",lineHeight:1.8}}>{p.insight}</p>
          </div>

          {/* What you need */}
          <div style={{padding:"0 32px 28px"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:14}}>HEXIS CORE {result.primary} INCLUYE</div>
            {p.needs.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:col,marginTop:6,flexShrink:0}}/>
                <div style={{fontSize:13,color:"#999",lineHeight:1.6}}>{n}</div>
              </div>
            ))}
          </div>

          {/* Program overview */}
          <div style={{margin:"0 32px 28px",background:"#0d0d0d",borderRadius:10,padding:20}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:16}}>TU PROGRAMA</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[["Días/semana",p.days+"d/sem"],["Duración","12 semanas"],["Objetivo",p.goal.split("·")[0].trim()],["Fases","3 fases"]].map(([l,v])=>(
                <div key={l}>
                  <div style={{fontSize:8,color:"#444",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#ddd"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:0}}>
              {p.phases.map((ph,i)=>(
                <div key={ph} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:2,background:i===0?col:"#222",marginBottom:6}}/>
                  <div style={{fontSize:9,color:i===0?col:"#444",letterSpacing:1}}>Fase {i+1}</div>
                  <div style={{fontSize:11,color:i===0?"#ddd":"#555",fontWeight:i===0?600:400}}>{ph}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary profile */}
          {s && (
            <div style={{margin:"0 32px 28px",padding:"14px 18px",border:`1px solid ${s.color}33`,borderRadius:10}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:6}}>TAMBIÉN TIENES RASGOS DE</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:3,height:36,background:s.color,borderRadius:100}}/>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:s.color}}>{result.secondary}</div>
                  <div style={{fontSize:11,color:"#666",fontStyle:"italic"}}>{s.sub}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{height:1,background:"#111",margin:"0 32px 28px"}}/>

          {/* CTA */}
          <div style={{padding:"0 32px"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#444",marginBottom:8,textAlign:"center"}}>EL PLAN COMPLETO ESTÁ EN</div>
            <div style={{fontFamily:PF,fontSize:22,textAlign:"center",marginBottom:6}}>HEXIS CORE</div>
            <div style={{fontSize:12,color:"#666",textAlign:"center",marginBottom:24,lineHeight:1.7}}>
              Macros exactos · Plan de 12 semanas · Nutrición completa<br/>Suplementación · App · De por vida
            </div>

            <button style={{width:"100%",padding:"18px 0",background:`linear-gradient(135deg,${col},#d4b85a)`,border:"none",borderRadius:3,color:BG,fontFamily:"Poppins,sans-serif",fontSize:13,fontWeight:700,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",marginBottom:12}}>
              Acceder a HEXIS CORE — 149 €
            </button>

            <button onClick={()=>{setStep("intro");setCurrent(0);setAnswers(Array(10).fill(null));setSelected(null);setResult(null);}} style={{width:"100%",padding:"14px 0",background:"transparent",border:"1px solid #222",borderRadius:3,color:"#555",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>
              Repetir el test
            </button>
          </div>
          <div style={{height:32}}/>
        </div>
      </div>
    );
  }

  // ── TEST ───────────────────────────────────────────────────
  return (
    <div style={root}>
      {/* Progress bar */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,height:2,background:"#111",zIndex:100}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${G},#d4b85a)`,transition:"width 0.4s ease"}}/>
      </div>

      <div style={{
        minHeight:"100vh",display:"flex",flexDirection:"column",padding:"52px 32px 40px",
        opacity: animIn ? 1 : 0,
        transform: animIn ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:40}}>
          <button onClick={handleBack} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>←</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:4,color:G}}>{q.cat}</div>
            <div style={{fontSize:10,color:"#333",marginTop:2}}>{current+1} / {QUESTIONS.length}</div>
          </div>
          <div style={{width:24}}/>
        </div>

        {/* Question number watermark */}
        <div style={{position:"absolute",top:80,right:24,fontFamily:PF,fontSize:80,color:G,opacity:0.05,fontWeight:700,pointerEvents:"none",lineHeight:1}}>{q.n}</div>

        {/* Question */}
        <div style={{flex:1}}>
          <div style={{width:28,height:1,background:G,marginBottom:20}}/>
          <div style={{fontFamily:PF,fontSize:28,fontWeight:700,lineHeight:1.2,marginBottom:36,color:"#fff"}}>{q.q}</div>

          {q.note && (
            <div style={{fontSize:10,color:G,letterSpacing:2,marginBottom:20,paddingLeft:12,borderLeft:`1px solid ${G}44`}}>{q.note}</div>
          )}

          {/* Options */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.opts.map(opt => {
              const sel = selected === opt.l;
              return (
                <div key={opt.l} onClick={()=>handleSelect(opt.l)} style={{
                  display:"flex",gap:14,alignItems:"flex-start",
                  padding:"16px 18px",
                  background: sel ? "rgba(200,170,80,0.08)" : "#0c0c0c",
                  border: `1px solid ${sel ? G : "#1a1a1a"}`,
                  borderRadius:8,cursor:"pointer",
                  transition:"all 0.15s ease",
                }}>
                  <div style={{
                    width:22,height:22,borderRadius:"50%",flexShrink:0,marginTop:1,
                    border:`1.5px solid ${sel ? G : "#2a2a2a"}`,
                    background: sel ? G : "transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.15s",
                  }}>
                    {sel && <div style={{width:8,height:8,borderRadius:"50%",background:BG}}/>}
                  </div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:9,fontWeight:700,color:sel?G:"#444",letterSpacing:1,marginRight:8}}>{opt.l}</span>
                    <span style={{fontSize:13,color:sel?"#ddd":"#888",lineHeight:1.65}}>{opt.t}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <div style={{marginTop:32}}>
          <button onClick={handleNext} disabled={!selected} style={{
            width:"100%",padding:"17px 0",
            background: selected ? `linear-gradient(135deg,${G},#d4b85a)` : "#111",
            border:"none",borderRadius:3,
            color: selected ? BG : "#333",
            fontFamily:"Poppins,sans-serif",fontSize:12,fontWeight:700,
            letterSpacing:3,textTransform:"uppercase",
            cursor: selected ? "pointer" : "not-allowed",
            transition:"all 0.2s",
          }}>
            {current < QUESTIONS.length-1 ? "Siguiente →" : "Ver mi perfil →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [feelings,setFeelings]=useState([]);
  const [obstacles,setObstacles]=useState([]);
  const [dp,setDp]=useState(null);
  const [fd,setFd]=useState({age:"",weight:"",height:"",gender:"",activity:""});
  const tf=id=>setFeelings(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const to=id=>setObstacles(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const next=()=>{if(step===2){setDp(detect(feelings,obstacles));}setStep(s=>s+1);};
  const ok=fd.age&&fd.weight&&fd.height&&fd.gender&&fd.activity;
  const pc=dp?PROFILES[dp].color:G;
  const DFig=dp?FIGS[dp]:FigW;
  const pct=[0,14,30,50,66,82,100][step]||0;
  const scr={minHeight:"100vh",background:BG,fontFamily:"Poppins,sans-serif",color:"#fff"};

  if(step===0) return(
    <div style={{...scr,position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <FigW/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(5,5,5,0) 18%,rgba(5,5,5,0.96) 70%)"}}/>
      <div style={{position:"relative",zIndex:2,padding:"0 28px 56px",textAlign:"center"}}>
        <div style={{fontSize:52,opacity:0.05,fontFamily:"serif",lineHeight:1}}>Χ</div>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:8,color:G,marginBottom:6}}>HEXIS</div>
        <div style={{fontSize:9,letterSpacing:3,color:"#2a2a2a",textTransform:"uppercase",marginBottom:32}}>Fortaleza del cuerpo · Claridad de la mente</div>
        <div style={{fontFamily:PF,fontSize:36,fontWeight:700,lineHeight:1.1,marginBottom:14}}>El cuerpo que eres<br/><em style={{fontStyle:"italic",color:G}}>empieza aquí.</em></div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.75,marginBottom:32}}>No es una dieta. No es un reto.<br/>Es el sistema que trabaja con tu naturaleza.</div>
        <Btn label="Comenzar mi camino" onClick={next}/>
        <div style={{fontSize:10,color:"#222",marginTop:12,letterSpacing:1}}>3 minutos · Gratis · Sin tarjeta</div>
      </div>
    </div>
  );

  if(step===1) return(
    <div style={scr}>
      <PBar pct={pct} fixed/>
      <Hero Fig={FigG} h={195}>
        <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>Paso 1 de 4</div>
        <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>¿Cómo quieres <em style={{color:G,fontStyle:"italic"}}>sentirte?</em></div>
      </Hero>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {FEELINGS.map(f=>(
            <div key={f.id} onClick={()=>tf(f.id)} style={{background:feelings.includes(f.id)?"rgba(200,170,80,0.08)":"#0c0c0c",border:`1px solid ${feelings.includes(f.id)?G:"#1a1a1a"}`,borderRadius:12,padding:"14px 10px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
              <div style={{fontSize:24,marginBottom:6}}>{f.i}</div>
              <div style={{fontSize:12,fontWeight:600,color:feelings.includes(f.id)?G:"#ddd",marginBottom:3}}>{f.l}</div>
              <div style={{fontSize:10,color:"#555"}}>{f.d}</div>
            </div>
          ))}
        </div>
        <Btn label="Continuar" onClick={next} disabled={!feelings.length}/>
      </div>
    </div>
  );

  if(step===2) return(
    <div style={scr}>
      <PBar pct={pct} fixed/>
      <Hero Fig={FigA} h={195}>
        <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>Paso 2 de 4</div>
        <div style={{fontFamily:PF,fontSize:22,fontWeight:700}}>¿Qué te ha <em style={{color:G,fontStyle:"italic"}}>frenado?</em></div>
      </Hero>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {OBSTACLES.map(o=>(
            <div key={o.id} onClick={()=>to(o.id)} style={{background:obstacles.includes(o.id)?"rgba(200,170,80,0.08)":"#0c0c0c",border:`1px solid ${obstacles.includes(o.id)?G:"#1a1a1a"}`,borderRadius:12,padding:"14px 10px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
              <div style={{fontSize:24,marginBottom:8}}>{o.i}</div>
              <div style={{fontSize:12,fontWeight:600,color:obstacles.includes(o.id)?G:"#ddd"}}>{o.l}</div>
            </div>
          ))}
        </div>
        <Btn label="Continuar" onClick={next} disabled={!obstacles.length}/>
      </div>
    </div>
  );

  if(step===3&&dp){
    const p=PROFILES[dp];
    return(
      <div style={scr}>
        <PBar pct={pct} fixed/>
        <Hero Fig={DFig} h={210}>
          <div style={{fontSize:9,letterSpacing:4,color:pc,textTransform:"uppercase",marginBottom:4}}>Tu arquetipo</div>
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
                <div key={t} style={{fontSize:9,padding:"3px 10px",borderRadius:100,border:`1px solid ${pc}`,color:pc,textTransform:"uppercase",opacity:0.7,letterSpacing:1}}>{t}</div>
              ))}
            </div>
          </div>
          <Btn label="Continuar" onClick={next} color={pc}/>
        </div>
      </div>
    );
  }

  if(step===4) return(
    <div style={scr}>
      <PBar pct={pct} fixed/>
      <Hero Fig={FigAn} h={195}>
        <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:4}}>La filosofía HEXIS</div>
        <div style={{fontFamily:PF,fontSize:20,fontWeight:700}}>El sistema que trabaja<br/><em style={{color:G,fontStyle:"italic"}}>con tu naturaleza.</em></div>
      </Hero>
      <div style={{padding:"16px 20px",overflowY:"auto"}}>
        {PRINCIPLES.slice(0,4).map(pr=>(
          <div key={pr.n} style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:10,padding:14,marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:18,flexShrink:0,marginTop:2}}>{pr.icon}</div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:G,letterSpacing:2,marginBottom:4}}>{pr.n}</div>
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

  if(step===5) return(
    <div style={{...scr,padding:"72px 24px 40px",overflowY:"auto"}}>
      <PBar pct={pct} fixed/>
      <div style={{fontSize:9,letterSpacing:4,color:G,textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Paso 3 de 4</div>
      <div style={{fontFamily:PF,fontSize:26,fontWeight:700,textAlign:"center",marginBottom:24}}>Tus datos <em style={{color:G,fontStyle:"italic"}}>personales</em></div>
      <div style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:6}}>Sexo biológico</div>
      <select style={inp} value={fd.gender} onChange={e=>setFd(p=>({...p,gender:e.target.value}))}><option value="">Seleccionar</option><option value="male">Hombre</option><option value="female">Mujer</option></select>
      <div style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:6}}>Edad</div>
      <input style={inp} type="number" placeholder="28" value={fd.age} onChange={e=>setFd(p=>({...p,age:e.target.value}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><div style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:6}}>Peso (kg)</div><input style={inp} type="number" placeholder="75" value={fd.weight} onChange={e=>setFd(p=>({...p,weight:e.target.value}))}/></div>
        <div><div style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:6}}>Altura (cm)</div><input style={inp} type="number" placeholder="178" value={fd.height} onChange={e=>setFd(p=>({...p,height:e.target.value}))}/></div>
      </div>
      <div style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",marginBottom:6}}>Nivel de actividad</div>
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

  if(step===6&&dp){
    const r=calcPlan(fd,dp);
    const pc2=PROFILES[dp].color;
    return(
      <div style={scr}>
        <PBar pct={100} fixed/>
        <Hero Fig={FIGS[dp]} h={210}>
          <div style={{fontSize:9,letterSpacing:4,color:pc2,textTransform:"uppercase",marginBottom:4}}>{dp} · Plan calculado</div>
          <div style={{fontFamily:PF,fontSize:26,fontWeight:700}}>Plan listo.<br/><em style={{color:pc2,fontStyle:"italic"}}>Empieza hoy.</em></div>
        </Hero>
        <div style={{padding:"16px 20px",overflowY:"auto"}}>
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#444",textTransform:"uppercase",marginBottom:6}}>Calorías diarias objetivo</div>
            <div style={{fontSize:36,fontWeight:700,color:pc2,lineHeight:1}}>{r.cal}<span style={{fontSize:14,color:"#444",marginLeft:6}}>kcal/día</span></div>
            <div style={{fontSize:11,color:"#444",marginTop:6}}>{PROFILES[dp].goal} · TDEE base {r.tdee} kcal</div>
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
  const [habits,setHabits]=useState([false,false,false,false]);
  const [exercises,setExercises]=useState(Array(5).fill(false));
  const [water,setWater]=useState(()=>loadWater());
  const [expandMeal,setExpandMeal]=useState(null);
  const [expandSupp,setExpandSupp]=useState(null);
  const [expandTip,setExpandTip]=useState(null);
  const [expandPrinciple,setExpandPrinciple]=useState(null);
  const [weightLog, setWeightLog]=useState(()=>loadWeightLog());
  const [weightInput, setWeightInput]=useState('');
  const [showProgress,setShowProgress]=useState(false);
  const streakDay=12;

  // Load saved habits/exercises when profile is already set
  useState(()=>{
    if(profile && PROFILES[profile]) {
      setHabits(loadHabits(PROFILES[profile].habits.length));
      setExercises(loadExercises(WORKOUTS[profile]?.length||4));
    }
  });

  const handleDone=(prof,ud,pd)=>{
    setProfile(prof);setPlan(pd);
    saveProfile(prof);
    savePlan(pd);
    saveUserData(ud);
    setExercises(loadExercises(WORKOUTS[prof].length));
    setHabits(loadHabits(PROFILES[prof].habits.length));
  };

  if(!profile) return <Onboarding onDone={handleDone}/>;

  // Sub-screens
  if(screen==="exdb") return <ExerciseDB onBack={()=>setScreen(null)}/>;
  if(screen==="nutdb") return <NutritionDB onBack={()=>setScreen(null)}/>;
  if(screen==="test") return <HexisTest/>;

  const p=PROFILES[profile];
  const w=WORKOUTS[profile];
  const meals=MEALS[profile];
  const Fig=FIGS[profile];
  const done=exercises.filter(Boolean).length;
  const pct=done===0?0:Math.round(done/w.length*100);
  const habitsDone=habits.filter(Boolean).length;
  const today=p.weekPlan.find(d=>d.today);
  const quoteIdx=streakDay%DAILY_QUOTES.length;
  const validW=weightLog.map(e=>e.value);
  const wTrend=validW.length>1?(validW[validW.length-1]-validW[0]).toFixed(1):0;
  const weekWeight=weightLog.slice(-7).map(e=>e.value);
  const scr={paddingBottom:90,overflowY:"auto",minHeight:"100vh",background:BG,fontFamily:"Poppins,sans-serif",color:"#fff"};
  const root={maxWidth:430,minHeight:"100vh",background:BG,margin:"0 auto",fontFamily:"Poppins,sans-serif",color:"#fff",position:"relative",overflow:"hidden"};

  return(
    <div style={root}>

    {tab==="inicio"&&(
      <div style={scr}>
        <Hero Fig={Fig} h={240}>
          <div style={{fontSize:9,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>{p.phase}</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:2,marginBottom:3}}>{profile}</div>
          <div style={{fontSize:11,color:"#666"}}>{p.sub} · {p.goal}</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{background:"rgba(200,170,80,0.06)",border:"1px solid rgba(200,170,80,0.15)",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:28}}>🔥</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:900,color:G}}>{streakDay} días</div>
              <div style={{fontSize:11,color:"#666"}}>Racha activa · El sistema sigue contigo</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"#444",letterSpacing:2,textTransform:"uppercase"}}>Récord: {streakBest}d</div>
              <div style={{fontSize:11,color:"#555"}}>{habitsDone}/{habits.length} hábitos</div>
            </div>
          </div>
          <SLabel text="Macros de hoy"/>
          <MacroGrid cal={plan?.cal||p.cal} prot={plan?.prot||p.prot} carbs={plan?.carbs||p.carbs} fat={plan?.fat||p.fat} color={p.color}/>
          {today&&(
            <>
              <SLabel text="Hoy"/>
              <div style={{background:today.type==="rest"?"#080808":"rgba(200,170,80,0.04)",border:`1px solid ${today.type==="rest"?"#111":"rgba(200,170,80,0.15)"}`,borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:26}}>{typeIcon[today.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:2}}>{today.focus}</div>
                  <div style={{fontSize:11,color:"#555"}}>{today.type==="rest"?"Recuperación activa · No es perder el día":`${p.days} días/semana · Ver detalles en Entreno`}</div>
                </div>
              </div>
            </>
          )}
          <SLabel text="Esta semana" right={`${p.weekPlan.filter(d=>d.done&&d.type==="train").length}/${p.weekPlan.filter(d=>d.type==="train").length} entrenos`}/>
          <div style={{display:"flex",gap:5,marginBottom:16}}>
            {p.weekPlan.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",aspectRatio:1,borderRadius:8,background:d.today?"rgba(200,170,80,0.12)":d.done?"rgba(200,170,80,0.06)":"#0c0c0c",border:`1px solid ${d.today?G:d.done?"rgba(200,170,80,0.25)":"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>
                  {d.done?(d.type==="rest"?"🌙":"✓"):(d.today?"→":"·")}
                </div>
                <span style={{fontSize:8,color:d.today?G:d.done?"#555":"#2a2a2a"}}>{d.day}</span>
              </div>
            ))}
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
                <div style={{fontSize:9,fontWeight:700,color:exercises[i]?"#2a2a2a":p.color,minWidth:18}}>{`0${i+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:exercises[i]?"#3a3a3a":"#bbb",textDecoration:exercises[i]?"line-through":"none"}}>{name}</div>
                  <div style={{fontSize:10,color:"#3a3a3a",marginTop:1}}>{muscle} · {sets}×{reps}</div>
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
              <div style={{width:20,height:20,borderRadius:"50%",border:`1px solid ${habits[i]?p.color:"#2a2a2a"}`,background:habits[i]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#050505",flexShrink:0}}>{habits[i]?"✓":""}</div>
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
          <SLabel text="Seguimiento de peso" right={<span onClick={()=>setShowProgress(!showProgress)} style={{color:G,cursor:"pointer",fontSize:10}}>Ver gráfico</span>}/>
          <div style={{background:"#0c0c0c",border:"1px solid #1a1a1a",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Media semanal</div>
                <div style={{fontSize:22,fontWeight:700}}>{(validW.reduce((a,b)=>a+b,0)/validW.length).toFixed(1)}<span style={{fontSize:12,color:"#444"}}> kg</span></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Tendencia</div>
                <div style={{fontSize:18,fontWeight:700,color:parseFloat(wTrend)<0?"#8BA4A0":parseFloat(wTrend)>0?"#C8AA50":"#666"}}>{wTrend>0?"+":""}{wTrend} kg</div>
              </div>
            </div>
            {showProgress&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:56,marginBottom:8}}>
                {(()=>{
                const days=["L","M","X","J","V","S","D"];
                const last7=weightLog.slice(-7);
                return days.map((d,i)=>{
                  const entry=last7[i];
                  const val=entry?entry.value:null;
                  const min=Math.min(...validW)-0.5;
                  const max=Math.max(...validW)+0.5;
                  const bh=val?Math.round(((val-min)/(max-min))*44)+10:4;
                  return(
                    <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      {val&&<div style={{fontSize:7,color:"#555"}}>{val}</div>}
                      <div style={{width:"100%",height:bh,background:val?(i===6?G:"#1a1a1a"):"#0c0c0c",borderRadius:3,marginTop:"auto"}}/>
                      <div style={{fontSize:7,color:"#333"}}>{d}</div>
                    </div>
                  );
                });
              })()}
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
              }} style={{padding:"8px 14px",background:p.color,border:"none",borderRadius:6,color:"#050505",fontFamily:"Poppins,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                Guardar
              </button>
            </div>
            <div style={{fontSize:11,color:"#444",lineHeight:1.6}}>{validW.length===0?"Introduce tu peso cada mañana para ver la tendencia real.":"La tendencia semanal importa, no el número de hoy. El peso fluctúa ±1-2kg por agua y digestión."}</div>
          </div>
          <Quote text={`"${DAILY_QUOTES[quoteIdx]}"`} attr="Filosofía HEXIS"/>
        </div>
      </div>
    )}

    {tab==="entreno"&&(
      <div style={scr}>
        <Hero Fig={FigB} h={200}>
          <div style={{fontSize:9,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>{p.phase}</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:2}}>{profile} · Sesión de hoy</div>
          <div style={{fontSize:11,color:"#555"}}>{w.length} ejercicios · {p.days} días/semana</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <PBar pct={pct} h={3}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4,marginBottom:16}}>
            <div style={{fontSize:11,color:"#444"}}>{done} de {w.length} completados</div>
            <div style={{fontSize:11,color:pct===100?G:"#444",fontWeight:pct===100?700:400}}>{pct}%{pct===100?" ✦":""}</div>
          </div>
          <SLabel text="Ejercicios de hoy"/>
          {w.map(({name,sets,reps,weight,unit,muscle,rpe,lastWeek},i)=>(
            <div key={i} onClick={()=>{
              const newE = exercises.map((v,j)=>j===i?!v:v);
              setExercises(newE);
              saveExercises(newE);
            }} style={{background:"#0c0c0c",border:`1px solid ${exercises[i]?"rgba(200,170,80,0.1)":"#1a1a1a"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",opacity:exercises[i]?0.5:1,transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:11,fontWeight:700,color:exercises[i]?"#2a2a2a":p.color,minWidth:22}}>{`0${i+1}`}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:exercises[i]?"#3a3a3a":"#ddd",textDecoration:exercises[i]?"line-through":"none",marginBottom:4}}>{name}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"#777"}}>{sets}×{reps}</span>
                    <span style={{fontSize:11,color:"#888"}}>{weight>0?`${weight}${unit}`:unit}</span>
                    <span style={{fontSize:11,color:"#555"}}>{muscle}</span>
                    <span style={{fontSize:10,color:"#3a3a3a"}}>RPE {rpe}</span>
                  </div>
                  {lastWeek>0&&!exercises[i]&&(
                    <div style={{fontSize:10,color:G,marginTop:4,opacity:0.7}}>↑ Semana pasada: {lastWeek}{unit} · Sube 2.5kg si completaste todo</div>
                  )}
                </div>
                <div style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${exercises[i]?p.color:"#222"}`,background:exercises[i]?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#050505",flexShrink:0}}>{exercises[i]?"✓":""}</div>
              </div>
            </div>
          ))}
          <div style={{background:"#080808",border:"1px solid #111",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:9,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>⚙️ Sobrecarga progresiva</div>
            <div style={{fontSize:12,color:"#666",lineHeight:1.75}}>Si completaste todos los sets la semana pasada, sube <span style={{color:"#aaa"}}>2.5kg</span> en compuestos y <span style={{color:"#aaa"}}>1kg</span> en aislamiento.</div>
          </div>
          <SLabel text="Plan semanal"/>
          {p.weekPlan.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:d.today?"rgba(200,170,80,0.04)":"#0a0a0a",border:`1px solid ${d.today?G:"#111"}`,borderRadius:10,padding:"11px 14px",marginBottom:6}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:d.done?(d.type==="rest"?"#0a0808":"rgba(200,170,80,0.1)"):"#0c0c0c",border:`1px solid ${d.done?(d.type==="rest"?"#1a1008":G):"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                {d.done?(d.type==="rest"?"🌙":"✓"):(d.today?"→":typeIcon[d.type]||"·")}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:d.today?G:d.done?"#555":"#888"}}>{d.day}</div>
                <div style={{fontSize:11,color:d.today?"#777":"#3a3a3a"}}>{d.focus}</div>
              </div>
              {d.today&&<div style={{fontSize:9,letterSpacing:2,color:G,textTransform:"uppercase",border:`1px solid ${G}`,padding:"2px 8px",borderRadius:100,opacity:0.7}}>HOY</div>}
            </div>
          ))}
          {/* DB ACCESS */}
          <div style={{background:"rgba(200,170,80,0.04)",border:`1px solid rgba(200,170,80,0.15)`,borderRadius:12,padding:"16px",marginTop:8,cursor:"pointer"}} onClick={()=>setScreen("exdb")}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:28}}>💪</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:3}}>Base de datos de ejercicios</div>
                <div style={{fontSize:11,color:"#555"}}>33 ejercicios · Cuerpo interactivo · Ciencia aplicada</div>
              </div>
              <div style={{fontSize:18,color:"#444"}}>→</div>
            </div>
          </div>
          <Quote text='"La tensión mecánica progresiva es el único estímulo real de hipertrofia."' attr="Ciencia HEXIS"/>
        </div>
      </div>
    )}

    {tab==="nutricion"&&(
      <div style={scr}>
        <Hero Fig={FigG} h={190}>
          <div style={{fontSize:9,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>Nutrición · Hoy</div>
          <div style={{fontSize:18,fontWeight:700}}>{meals.reduce((s,m)=>s+m.kcal,0)} kcal · {meals.length} comidas</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <SLabel text="Macros objetivo"/>
          <MacroGrid cal={plan?.cal||p.cal} prot={plan?.prot||p.prot} carbs={plan?.carbs||p.carbs} fat={plan?.fat||p.fat} color={p.color}/>
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
                <div style={{minWidth:44}}><div style={{fontSize:10,color:p.color,fontWeight:600,letterSpacing:1}}>{meal.time}</div></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginBottom:3}}>{meal.name}</div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{meal.items}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#888"}}>{meal.kcal}<span style={{fontSize:9,color:"#444"}}> kcal</span></div>
                  <div style={{fontSize:10,color:"#555"}}>{meal.prot}g prot</div>
                </div>
              </div>
              {expandMeal===i&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a"}}>
                  <div style={{fontSize:9,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>¿Por qué este plato?</div>
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
              <div style={{fontSize:18,color:"#444"}}>→</div>
            </div>
          </div>
          <Quote text='"La nutrición no es una prisión. Es una guía flexible. La tendencia semanal importa más que el dato de hoy."' attr="Principio HEXIS"/>
        </div>
      </div>
    )}

    {tab==="tips"&&(
      <div style={scr}>
        <Hero Fig={FigAn} h={190}>
          <div style={{fontSize:9,letterSpacing:4,color:p.color,textTransform:"uppercase",marginBottom:4}}>Conocimiento · Ciencia · Filosofía</div>
          <div style={{fontSize:18,fontWeight:700}}>HEXIS Tips</div>
        </Hero>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{background:"#080808",border:`1px solid ${G}22`,borderRadius:12,padding:18,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:G,textTransform:"uppercase",marginBottom:8}}>Kalokagathia · καλοκαγαθία</div>
            <div style={{fontFamily:PF,fontSize:14,fontStyle:"italic",color:"#777",lineHeight:1.75,marginBottom:10}}>"La unión perfecta entre cuerpo bello y alma virtuosa. No como opuestos. Como una sola cosa."</div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>Los griegos no separaban el físico del carácter. El esculpido griego nacía de <strong style={{color:"#777"}}>vivir bien, de forma coherente, cada día.</strong></div>
          </div>
          <div style={{borderLeft:`2px solid ${p.color}`,background:"#080808",borderRadius:"0 10px 10px 0",padding:14,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:p.color,textTransform:"uppercase",marginBottom:6}}>{profile} · Tu manifiesto</div>
            <div style={{fontFamily:PF,fontSize:13,fontStyle:"italic",color:"#777",lineHeight:1.7}}>"{p.manifesto}"</div>
          </div>
          <SLabel text="Los 6 principios HEXIS"/>
          {PRINCIPLES.map((pr,i)=>(
            <div key={pr.n} onClick={()=>setExpandPrinciple(expandPrinciple===i?null:i)} style={{background:"#0c0c0c",border:`1px solid ${expandPrinciple===i?"rgba(200,170,80,0.2)":"#111"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:20}}>{pr.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,fontWeight:700,color:G,letterSpacing:2,marginBottom:3}}>{pr.n}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#ddd"}}>{pr.title}</div>
                </div>
                <div style={{fontSize:14,color:"#333"}}>{expandPrinciple===i?"−":"+"}</div>
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
                  <span style={{fontSize:9,letterSpacing:3,color:t.color,textTransform:"uppercase"}}>{t.tag}</span>
                  <div style={{fontSize:13,fontWeight:700,color:"#ddd",marginTop:3}}>{t.title}</div>
                </div>
                <div style={{fontSize:14,color:"#333"}}>{expandTip===i?"−":"+"}</div>
              </div>
              {expandTip===i&&<div style={{fontSize:13,color:"#666",lineHeight:1.75,paddingTop:10,borderTop:"1px solid #1a1a1a"}}>{t.body}</div>}
            </div>
          ))}
          <Quote text='"Lo bueno, si es simple, es doblemente bueno."' attr="Baltasar Gracián"/>
          <div onClick={()=>{if(window.confirm('¿Resetear tu perfil y empezar de nuevo?')){clearAll();setProfile(null);setPlan(null);setWeightLog([]);setStreakData({current:0,best:0});}}} style={{textAlign:"center",padding:"12px",cursor:"pointer",marginTop:8}}>
            <div style={{fontSize:10,color:"#2a2a2a",letterSpacing:2,textTransform:"uppercase"}}>Resetear perfil</div>
          </div>
          <Quote text='"Complejo por dentro. Simple por fuera. Eso es HEXIS."' attr="Manifiesto HEXIS"/>
          <div style={{height:8}}/>
        </div>
      </div>
    )}

    <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(5,5,5,0.97)",borderTop:"1px solid #111",display:"flex",zIndex:200,backdropFilter:"blur(12px)"}}>
      {[["inicio","⊙","Inicio"],["entreno","◈","Entreno"],["nutricion","◉","Nutrición"],["tips","◇","Tips"]].map(([id,icon,label])=>(
        <div key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"11px 0 14px",cursor:"pointer",gap:3}}>
          <span style={{fontSize:18}}>{icon}</span>
          <span style={{fontSize:9,letterSpacing:1,color:tab===id?G:"#333",textTransform:"uppercase"}}>{label}</span>
          <div style={{width:4,height:4,borderRadius:"50%",background:tab===id?G:"transparent"}}/>
        </div>
      ))}
    </nav>
    </div>
  );
}
