export const PROFILES = {
  ALPHA: {
    color:"#C8AA50", sub:"El constructor",
    tagline:"Vives para crecer. La fuerza es tu lenguaje.",
    cal:2650, prot:180, carbs:290, fat:75,
    days:5, goal:"Superávit +250 kcal", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["strong","confident"], obstacle:["noconstancy","motivation"],
    habits:["Duerme mínimo 8h","Proteína en cada comida","Registra cada serie","Creatina 5g diaria"],
    habitIcons:["🌙","🥩","📝","💊"],
    manifesto:"Construyes tu cuerpo con la misma constancia con que los griegos esculpían el mármol. Sin prisa, sin pausa.",
    supps:[["Creatina","5g","Post-entreno con agua"],["Proteína Whey","30g","Inmediatamente post-entreno"],["Vitamina D3","2000 UI","Con desayuno y grasa"],["Omega 3","2g","Con la comida principal"]],
    weekPlan:[
      {day:"L",focus:"Empuje · Pecho y Hombros",type:"train",done:true,split:"empuje"},
      {day:"M",focus:"Tirón · Espalda y Bíceps",type:"train",done:true,split:"tiron"},
      {day:"X",focus:"Descanso activo",type:"rest",done:true},
      {day:"J",focus:"Pierna · Quad y Glúteo",type:"train",done:false,today:true,split:"pierna"},
      {day:"V",focus:"Hombros y Tríceps",type:"train",done:false,split:"hombros_triceps"},
      {day:"S",focus:"Full Body o Cardio",type:"train",done:false,split:"fullbody"},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
  HERA: {
    color:"#D4C5A9", sub:"La definición",
    tagline:"Forma, tono y presencia. Tu cuerpo refleja tu fuerza interior.",
    cal:1820, prot:140, carbs:180, fat:60,
    days:4, goal:"Déficit suave -200 kcal", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["confident","light"], obstacle:["eating","motivation"],
    habits:["Hidratación 2.5L","Cardio suave 20 min","Pesa tus comidas","Sin ultraprocesados"],
    habitIcons:["💧","🏃‍♀️","⚖️","🚫"],
    manifesto:"La definición no es ausencia. Es presencia. Tu cuerpo expresando quién eres con claridad y elegancia.",
    supps:[["Proteína Whey","25g","Post-entreno"],["Magnesio","300mg","Antes de dormir"],["Vitamina D3","2000 UI","Con desayuno"],["Colágeno","10g","Con vitamina C"]],
    weekPlan:[
      {day:"L",focus:"Inferior · Glúteo y Pierna",type:"train",done:true,split:"inferior"},
      {day:"M",focus:"Superior · Pecho y Espalda",type:"train",done:true,split:"superior_pecho_espalda"},
      {day:"X",focus:"Cardio LISS 30 min",type:"cardio",done:false,today:true},
      {day:"J",focus:"Inferior · Isquios y Glúteo",type:"train",done:false,split:"inferior"},
      {day:"V",focus:"Superior · Hombros y Brazos",type:"train",done:false,split:"superior_hombros_brazos"},
      {day:"S",focus:"Descanso activo",type:"rest",done:false},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
  ZEN: {
    color:"#8BA4A0", sub:"El reset",
    tagline:"El estrés no te define. Reconecta cuerpo y mente cada día.",
    cal:2100, prot:150, carbs:240, fat:70,
    days:3, goal:"Mantenimiento · Energía estable", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["balanced","focused"], obstacle:["stress","notime"],
    habits:["Meditación 5 min al despertar","7000 pasos diarios","Sin pantallas 1h antes de dormir","Journaling nocturno"],
    habitIcons:["🧘","👣","📵","📓"],
    manifesto:"El equilibrio no es inactividad. Es la fuerza que surge cuando cuerpo y mente dejan de luchar entre sí.",
    supps:[["Ashwagandha","600mg","Con la cena"],["Magnesio","300mg","Antes de dormir"],["Vitamina B12","1000mcg","Con el desayuno"],["L-Teanina","200mg","En momentos de estrés agudo"]],
    weekPlan:[
      {day:"L",focus:"Full Body suave",type:"train",done:true,split:"fullbody_suave"},
      {day:"M",focus:"Movilidad y stretching",type:"mobility",done:true},
      {day:"X",focus:"Caminar 45 min",type:"cardio",done:false,today:true},
      {day:"J",focus:"Full Body moderado",type:"train",done:false,split:"fullbody_moderado"},
      {day:"V",focus:"Yoga o movilidad",type:"mobility",done:false},
      {day:"S",focus:"Actividad libre",type:"cardio",done:false},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
  SHAPE: {
    color:"#A09060", sub:"La transformación",
    tagline:"Recomposición total. Pierdes lo que sobra, construyes lo que falta.",
    cal:1980, prot:185, carbs:200, fat:65,
    days:4, goal:"Recomposición · Déficit moderado", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["light","energetic"], obstacle:["eating","confused"],
    habits:["Pesa en ayunas cada mañana","Entrena postdesayuno","Mide cintura semanal","Sin alcohol esta semana"],
    habitIcons:["⚖️","💪","📏","🚫"],
    manifesto:"La recomposición no es magia. Es paciencia inteligente. El cuerpo cambia cuando el sistema es constante.",
    supps:[["Creatina","5g","Post-entreno"],["Proteína Whey","30g","Post-entreno"],["Cafeína","200mg","30 min pre-entreno"],["Vitamina D3","2000 UI","Con desayuno"]],
    weekPlan:[
      {day:"L",focus:"Full Body A · Fuerza",type:"train",done:true,split:"a_fuerza"},
      {day:"M",focus:"Cardio HIIT 20 min",type:"cardio",done:true},
      {day:"X",focus:"Full Body B · Volumen",type:"train",done:false,today:true,split:"b_volumen"},
      {day:"J",focus:"Descanso activo",type:"rest",done:false},
      {day:"V",focus:"Full Body C · Potencia",type:"train",done:false,split:"c_potencia"},
      {day:"S",focus:"Cardio moderado 30 min",type:"cardio",done:false},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
  ATENEA: {
    color:"#7C8FA6", sub:"La estructura",
    tagline:"Sin tiempo no es sin sistema. La eficiencia es tu fuerza.",
    cal:2000, prot:150, carbs:210, fat:65,
    days:3, goal:"Mantenimiento eficiente · Fuerza útil", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["focused","energetic"], obstacle:["notime","confused"],
    habits:["Entrena en bloques de 30 min","Prepara comidas en batch el domingo","Revisa tu semana antes de que empiece","Prioriza fuerza compuesta, no relleno"],
    habitIcons:["⏱","🍱","🗓","🏋️"],
    manifesto:"La estructura no te quita libertad. Te la da. Un sistema eficiente rinde más en menos tiempo que el caos con más horas.",
    supps:[["Creatina","5g","Cualquier momento del día"],["Proteína Whey","30g","Post-entreno o como comida rápida"],["Cafeína","150mg","30 min antes de entrenar"],["Vitamina D3","2000 UI","Con el desayuno"]],
    weekPlan:[
      {day:"L",focus:"Full Body A · Compuestos pesados",type:"train",done:true,split:"fullbody_a"},
      {day:"M",focus:"Descanso activo",type:"rest",done:true},
      {day:"X",focus:"Full Body B · Compuestos pesados",type:"train",done:false,today:true,split:"fullbody_b"},
      {day:"J",focus:"Descanso activo",type:"rest",done:false},
      {day:"V",focus:"Full Body C · Compuestos pesados",type:"train",done:false,split:"fullbody_c"},
      {day:"S",focus:"Actividad libre",type:"cardio",done:false},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
  GAIA: {
    color:"#A8B98C", sub:"La reconexión",
    tagline:"Sin prisa, sin comparación. Tu cuerpo, tu ritmo.",
    cal:1950, prot:130, carbs:220, fat:68,
    days:3, goal:"Mantenimiento suave · Recuperación activa", phase:"Fase 1 · Fundamentals", week:12,
    feeling:["balanced","light"], obstacle:["stress","motivation"],
    habits:["Camina 20 min sin pantalla","Estírate antes de dormir","Come sin prisa, sin distracciones","Un día de descanso real a la semana"],
    habitIcons:["🚶","🧘","🍽","🌿"],
    manifesto:"La tierra no compite con nada. Solo sostiene. Tu cuerpo tampoco necesita compararse — necesita que lo escuches.",
    supps:[["Magnesio","300mg","Antes de dormir"],["Omega 3","2g","Con la comida principal"],["Vitamina D3","2000 UI","Con desayuno"],["Probiótico","1 cápsula","En ayunas"]],
    weekPlan:[
      {day:"L",focus:"Full Body suave",type:"train",done:true,split:"fullbody_suave"},
      {day:"M",focus:"Caminar 30 min",type:"cardio",done:true},
      {day:"X",focus:"Yoga o movilidad",type:"mobility",done:false,today:true},
      {day:"J",focus:"Full Body suave",type:"train",done:false,split:"fullbody_suave"},
      {day:"V",focus:"Caminar 30 min",type:"cardio",done:false},
      {day:"S",focus:"Movilidad libre",type:"mobility",done:false},
      {day:"D",focus:"Descanso total",type:"rest",done:false},
    ],
  },
};

export const WORKOUTS = {
  ALPHA: {
    empuje: [
      {name:"Press banca plano",sets:"4",reps:"8",weight:80,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:77.5,rest:"2-3 min",how:"Baja controlado hasta rozar el pecho, codos a ~45°. Empuja explosivo sin despegar los glúteos del banco."},
      {name:"Press inclinado mancuernas",sets:"3",reps:"10",weight:28,unit:"kg",muscle:"Pecho",rpe:"7/10",lastWeek:26,rest:"90 seg",how:"Banco a 30-45°. Baja hasta sentir estiramiento en pecho superior, sin bloquear los codos arriba."},
      {name:"Press militar",sets:"4",reps:"8",weight:50,unit:"kg",muscle:"Hombros",rpe:"8/10",lastWeek:47.5,rest:"2-3 min",how:"De pie o sentado, barra desde clavícula hasta bloqueo de codos. Core apretado, sin arquear la espalda baja."},
      {name:"Elevaciones laterales",sets:"4",reps:"15",weight:12,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:11,rest:"60 seg",how:"Codos ligeramente flexionados, sube hasta la altura del hombro sin impulso. Controla la bajada 2 segundos."},
      {name:"Fondos lastrados",sets:"3",reps:"12",weight:15,unit:"kg+",muscle:"Tríceps",rpe:"8/10",lastWeek:12.5,rest:"90 seg",how:"Inclina el torso ligeramente hacia delante para más pecho, o vertical para más tríceps. Baja hasta 90° en el codo."},
    ],
    tiron: [
      {name:"Dominadas lastradas",sets:"4",reps:"6",weight:10,unit:"kg+",muscle:"Espalda",rpe:"8/10",lastWeek:7.5,rest:"2-3 min",how:"Agarre prono a la anchura de hombros, sube hasta que la barbilla pase la barra, baja con control total."},
      {name:"Remo con barra",sets:"4",reps:"8",weight:70,unit:"kg",muscle:"Espalda",rpe:"8/10",lastWeek:67.5,rest:"2 min",how:"Torso a 45°, tira hacia el abdomen apretando omóplatos, sin usar impulso de cadera."},
      {name:"Jalón al pecho agarre cerrado",sets:"3",reps:"10",weight:60,unit:"kg",muscle:"Espalda",rpe:"7/10",lastWeek:57.5,rest:"90 seg",how:"Codos hacia abajo y atrás, pecho arriba, controla la vuelta."},
      {name:"Curl con barra",sets:"3",reps:"10",weight:30,unit:"kg",muscle:"Bíceps",rpe:"7/10",lastWeek:27.5,rest:"90 seg",how:"Codos pegados al cuerpo, sube sin balancear la espalda, baja completo."},
      {name:"Curl martillo mancuernas",sets:"3",reps:"12",weight:14,unit:"kg",muscle:"Bíceps",rpe:"7/10",lastWeek:12,rest:"60 seg",how:"Agarre neutro, sube controlado sin impulso de hombro."},
    ],
    pierna: [
      {name:"Sentadilla trasera",sets:"4",reps:"8",weight:90,unit:"kg",muscle:"Cuádriceps",rpe:"8/10",lastWeek:85,rest:"2-3 min",how:"Barra sobre trapecio, baja hasta que los muslos pasen de paralelo, rodillas alineadas con los pies."},
      {name:"Prensa de piernas",sets:"4",reps:"12",weight:160,unit:"kg",muscle:"Cuádriceps",rpe:"8/10",lastWeek:150,rest:"90 seg",how:"Pies a la anchura de hombros, baja hasta 90° en la rodilla, no bloquees arriba."},
      {name:"Peso muerto rumano",sets:"3",reps:"10",weight:80,unit:"kg",muscle:"Isquios",rpe:"8/10",lastWeek:75,rest:"2 min",how:"Rodillas casi rectas, cadera hacia atrás, barra pegada a las piernas."},
      {name:"Zancadas con mancuernas",sets:"3",reps:"12",weight:16,unit:"kg",muscle:"Glúteo",rpe:"7/10",lastWeek:14,rest:"90 seg",how:"Paso largo, rodilla trasera casi toca el suelo, empuja con el talón delantero."},
      {name:"Elevación de gemelos de pie",sets:"4",reps:"15",weight:40,unit:"kg",muscle:"Gemelos",rpe:"7/10",lastWeek:35,rest:"60 seg",how:"Sube hasta la punta del pie, pausa arriba 1 segundo, baja completo estirando."},
    ],
    hombros_triceps: [
      {name:"Press militar mancuernas",sets:"4",reps:"8",weight:22,unit:"kg",muscle:"Hombros",rpe:"8/10",lastWeek:20,rest:"2 min",how:"De pie, empuja hasta bloqueo sin arquear la espalda baja."},
      {name:"Elevaciones laterales",sets:"4",reps:"15",weight:12,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:11,rest:"60 seg",how:"Codos ligeramente flexionados, sube hasta la altura del hombro sin impulso."},
      {name:"Elevaciones posteriores",sets:"3",reps:"15",weight:8,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:7,rest:"60 seg",how:"Torso inclinado adelante, sube los brazos abiertos apretando omóplatos."},
      {name:"Fondos en paralelas",sets:"3",reps:"10",weight:0,unit:"pc",muscle:"Tríceps",rpe:"8/10",lastWeek:0,rest:"90 seg",how:"Torso vertical para más tríceps, baja hasta 90° en el codo, empuja completo."},
      {name:"Extensión de tríceps en polea",sets:"3",reps:"12",weight:25,unit:"kg",muscle:"Tríceps",rpe:"7/10",lastWeek:22.5,rest:"60 seg",how:"Codos pegados al cuerpo, extiende completo sin mover el hombro."},
    ],
    fullbody: [
      {name:"Sentadilla goblet",sets:"3",reps:"12",weight:24,unit:"kg",muscle:"Pierna",rpe:"6/10",lastWeek:20,rest:"60-90 seg",how:"Mancuerna pegada al pecho, baja controlado, sube completo."},
      {name:"Press banca mancuernas",sets:"3",reps:"10",weight:26,unit:"kg",muscle:"Pecho",rpe:"7/10",lastWeek:24,rest:"90 seg",how:"Baja controlado a los lados del pecho, empuja sin bloquear de golpe."},
      {name:"Remo con mancuerna",sets:"3",reps:"12",weight:20,unit:"kg",muscle:"Espalda",rpe:"6/10",lastWeek:18,rest:"60-90 seg",how:"Espalda recta apoyada, tira del codo hacia atrás y arriba."},
      {name:"Press militar con barra",sets:"3",reps:"10",weight:35,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:32.5,rest:"90 seg",how:"Core apretado, empuja desde clavícula hasta bloqueo completo."},
      {name:"Plancha con toque de hombro",sets:"3",reps:"20",weight:0,unit:"—",muscle:"Core",rpe:"6/10",lastWeek:0,rest:"45-60 seg",how:"Cadera estable sin balanceo, toca el hombro contrario alternando."},
    ],
  },
  HERA: {
    inferior: [
      {name:"Sentadilla goblet",sets:"4",reps:"12",weight:20,unit:"kg",muscle:"Cuádriceps",rpe:"7/10",lastWeek:18,rest:"90 seg",how:"Mancuerna pegada al pecho, baja hasta que los muslos pasen de paralelo. Rodillas siguiendo la línea de los pies."},
      {name:"Hip thrust",sets:"4",reps:"15",weight:40,unit:"kg",muscle:"Glúteo",rpe:"8/10",lastWeek:37.5,rest:"90 seg",how:"Espalda alta apoyada en banco, empuja con los talones. Aprieta el glúteo fuerte 1 segundo arriba."},
      {name:"Peso muerto rumano",sets:"3",reps:"12",weight:40,unit:"kg",muscle:"Isquios",rpe:"7/10",lastWeek:37.5,rest:"90 seg",how:"Rodillas casi rectas, cadera hacia atrás, barra pegada a las piernas. Sube apretando glúteo, no espalda."},
      {name:"Zancadas caminando",sets:"3",reps:"20",weight:10,unit:"kg",muscle:"Pierna",rpe:"7/10",lastWeek:9,rest:"60-90 seg",how:"Paso largo, rodilla trasera casi toca el suelo, rodilla delantera no sobrepasa la punta del pie."},
    ],
    superior_pecho_espalda: [
      {name:"Press banca mancuernas",sets:"3",reps:"12",weight:16,unit:"kg",muscle:"Pecho",rpe:"7/10",lastWeek:14,rest:"90 seg",how:"Baja controlado a los lados del pecho, empuja sin bloquear de golpe."},
      {name:"Aperturas con mancuernas",sets:"3",reps:"12",weight:8,unit:"kg",muscle:"Pecho",rpe:"6/10",lastWeek:7,rest:"60 seg",how:"Brazos semi-flexionados, baja en arco amplio sintiendo el estiramiento del pecho."},
      {name:"Jalón al pecho",sets:"3",reps:"12",weight:45,unit:"kg",muscle:"Espalda",rpe:"7/10",lastWeek:42.5,rest:"90 seg",how:"Codos hacia abajo y atrás, pecho arriba, controla la vuelta."},
      {name:"Remo en polea baja",sets:"3",reps:"12",weight:35,unit:"kg",muscle:"Espalda",rpe:"7/10",lastWeek:32.5,rest:"60-90 seg",how:"Espalda recta, tira hasta el abdomen apretando los omóplatos."},
    ],
    superior_hombros_brazos: [
      {name:"Press militar mancuernas",sets:"3",reps:"12",weight:12,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:11,rest:"90 seg",how:"Sentada, empuja hasta bloqueo sin arquear la espalda baja."},
      {name:"Elevaciones laterales",sets:"3",reps:"15",weight:6,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:5,rest:"60 seg",how:"Codos ligeramente flexionados, sube hasta la altura del hombro sin impulso."},
      {name:"Curl de bíceps mancuernas",sets:"3",reps:"12",weight:8,unit:"kg",muscle:"Bíceps",rpe:"6/10",lastWeek:7,rest:"60 seg",how:"Codos pegados al cuerpo, sube controlado sin balancear."},
      {name:"Patada de tríceps",sets:"3",reps:"15",weight:6,unit:"kg",muscle:"Tríceps",rpe:"6/10",lastWeek:5,rest:"60 seg",how:"Torso inclinado, extiende el brazo hacia atrás manteniendo el codo fijo."},
    ],
  },
  ZEN: {
    fullbody_suave: [
      {name:"Saludo al sol",sets:"2",reps:"5",weight:0,unit:"pc",muscle:"Movilidad",rpe:"5/10",lastWeek:0,rest:"30-45 seg",how:"Secuencia fluida sin prisa: estiramiento, flexión adelante, plancha, cobra. Respira en cada transición."},
      {name:"Sentadilla con pausa",sets:"3",reps:"10",weight:0,unit:"pc",muscle:"Cuádriceps",rpe:"6/10",lastWeek:0,rest:"60 seg",how:"Baja con control y pausa 2 segundos abajo antes de subir. Prioriza sentir el músculo, no la velocidad."},
      {name:"Remo en polea baja",sets:"3",reps:"12",weight:30,unit:"kg",muscle:"Espalda",rpe:"6/10",lastWeek:28,rest:"60-90 seg",how:"Espalda recta, tira hasta el abdomen apretando los omóplatos. Vuelve controlado, sin dejarte llevar por el peso."},
      {name:"Plancha isométrica",sets:"3",reps:"45s",weight:0,unit:"—",muscle:"Core",rpe:"6/10",lastWeek:0,rest:"45-60 seg",how:"Cuerpo en línea recta de cabeza a talones, sin hundir la cadera. Respira normal, no aguantes el aire."},
    ],
    fullbody_moderado: [
      {name:"Sentadilla con mancuernas",sets:"3",reps:"12",weight:12,unit:"kg",muscle:"Cuádriceps",rpe:"6/10",lastWeek:10,rest:"60-90 seg",how:"Mancuernas a los lados, baja con control, sube completo sin prisa."},
      {name:"Press banca suave",sets:"3",reps:"10",weight:20,unit:"kg",muscle:"Pecho",rpe:"6/10",lastWeek:18,rest:"90 seg",how:"Movimiento controlado, sin buscar el fallo, siente el músculo trabajar."},
      {name:"Remo en máquina",sets:"3",reps:"12",weight:30,unit:"kg",muscle:"Espalda",rpe:"6/10",lastWeek:28,rest:"60-90 seg",how:"Espalda recta, tira hasta el abdomen, vuelta controlada."},
      {name:"Plancha isométrica",sets:"3",reps:"40s",weight:0,unit:"—",muscle:"Core",rpe:"6/10",lastWeek:0,rest:"45-60 seg",how:"Cuerpo en línea recta, respira con calma, sal antes de romper la técnica."},
    ],
  },
  SHAPE: {
    a_fuerza: [
      {name:"Peso muerto rumano",sets:"4",reps:"10",weight:60,unit:"kg",muscle:"Isquios",rpe:"8/10",lastWeek:57.5,rest:"90 seg",how:"Rodillas casi rectas, cadera hacia atrás, barra pegada a las piernas. Sube apretando glúteo, no espalda."},
      {name:"Press banca",sets:"3",reps:"10",weight:65,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:62.5,rest:"90 seg-2 min",how:"Baja controlado hasta rozar el pecho, codos a ~45°. Empuja explosivo sin despegar los glúteos del banco."},
      {name:"Jalón al pecho",sets:"4",reps:"12",weight:55,unit:"kg",muscle:"Espalda",rpe:"7/10",lastWeek:52.5,rest:"60-90 seg",how:"Tira con los codos hacia abajo y atrás, pecho arriba. No uses el impulso del cuerpo."},
      {name:"Sentadilla búlgara",sets:"3",reps:"10",weight:20,unit:"kg",muscle:"Pierna",rpe:"8/10",lastWeek:18,rest:"90 seg",how:"Pie trasero elevado en banco, baja recto hasta 90° en la rodilla delantera. Torso ligeramente inclinado adelante."},
      {name:"Plancha lateral",sets:"3",reps:"30s",weight:0,unit:"—",muscle:"Core",rpe:"6/10",lastWeek:0,rest:"45-60 seg",how:"Cuerpo en línea recta apoyado en antebrazo, cadera arriba sin hundirse. Cambia de lado entre series."},
    ],
    b_volumen: [
      {name:"Sentadilla goblet",sets:"4",reps:"15",weight:40,unit:"kg",muscle:"Cuádriceps",rpe:"7/10",lastWeek:37.5,rest:"60-90 seg",how:"Rango completo, más repeticiones con peso moderado para volumen."},
      {name:"Press inclinado mancuernas",sets:"4",reps:"15",weight:18,unit:"kg",muscle:"Pecho",rpe:"7/10",lastWeek:16,rest:"60-90 seg",how:"Banco a 30-45°, controla la bajada, foco en sentir el músculo."},
      {name:"Jalón al pecho agarre abierto",sets:"4",reps:"15",weight:50,unit:"kg",muscle:"Espalda",rpe:"7/10",lastWeek:47.5,rest:"60-90 seg",how:"Codos hacia abajo, contracción completa arriba del movimiento."},
      {name:"Hip thrust",sets:"4",reps:"15",weight:50,unit:"kg",muscle:"Glúteo",rpe:"7/10",lastWeek:47.5,rest:"90 seg",how:"Empuja con los talones, aprieta el glúteo 1 segundo arriba."},
      {name:"Elevaciones laterales",sets:"3",reps:"15",weight:8,unit:"kg",muscle:"Hombros",rpe:"6/10",lastWeek:7,rest:"60 seg",how:"Sube hasta la altura del hombro sin impulso, controla la bajada."},
    ],
    c_potencia: [
      {name:"Sentadilla con barra",sets:"4",reps:"5",weight:75,unit:"kg",muscle:"Cuádriceps",rpe:"8/10",lastWeek:72.5,rest:"2-3 min",how:"Peso alto, pocas repeticiones, técnica estricta, explota al subir."},
      {name:"Press banca con barra",sets:"4",reps:"5",weight:65,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:62.5,rest:"2-3 min",how:"Empuje explosivo desde el pecho, control total en la bajada."},
      {name:"Peso muerto convencional",sets:"3",reps:"5",weight:85,unit:"kg",muscle:"Espalda baja",rpe:"8/10",lastWeek:80,rest:"2-3 min",how:"Espalda neutra, empuja el suelo con las piernas al subir."},
      {name:"Dominadas lastradas",sets:"3",reps:"6",weight:5,unit:"kg+",muscle:"Espalda",rpe:"8/10",lastWeek:0,rest:"2 min",how:"Sube hasta barbilla sobre la barra, controla toda la bajada."},
    ],
  },
  ATENEA: {
    fullbody_a: [
      {name:"Sentadilla trasera",sets:"4",reps:"6",weight:70,unit:"kg",muscle:"Pierna",rpe:"8/10",lastWeek:67.5,rest:"2-3 min",how:"Barra sobre trapecio, baja hasta que los muslos pasen de paralelo, rodillas alineadas con los pies. Compuesto de máximo rendimiento por minuto invertido."},
      {name:"Press banca",sets:"4",reps:"6",weight:60,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:57.5,rest:"2-3 min",how:"Baja controlado hasta rozar el pecho, codos a ~45°. Empuja explosivo sin despegar los glúteos del banco."},
      {name:"Peso muerto convencional",sets:"3",reps:"5",weight:90,unit:"kg",muscle:"Espalda baja",rpe:"8/10",lastWeek:85,rest:"2-3 min",how:"Espalda neutra, barra pegada a las espinillas, empuja el suelo con las piernas al subir. El ejercicio más eficiente que existe: pierna, espalda y core en un solo movimiento."},
      {name:"Dominadas o remo con barra",sets:"3",reps:"8",weight:0,unit:"pc",muscle:"Espalda",rpe:"7/10",lastWeek:0,rest:"90 seg-2 min",how:"Agarre a la anchura de hombros, sube hasta que la barbilla pase la barra, baja con control completo."},
      {name:"Press militar",sets:"3",reps:"8",weight:35,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:32.5,rest:"90 seg",how:"De pie, barra desde clavícula hasta bloqueo de codos. Core apretado, sin arquear la espalda baja."},
    ],
    fullbody_b: [
      {name:"Sentadilla trasera",sets:"4",reps:"6",weight:72.5,unit:"kg",muscle:"Pierna",rpe:"8/10",lastWeek:70,rest:"2-3 min",how:"Barra sobre trapecio, baja hasta que los muslos pasen de paralelo, rodillas alineadas con los pies."},
      {name:"Press banca",sets:"4",reps:"6",weight:62.5,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:60,rest:"2-3 min",how:"Baja controlado hasta rozar el pecho, codos a ~45°. Empuja explosivo sin despegar los glúteos del banco."},
      {name:"Peso muerto convencional",sets:"3",reps:"5",weight:92.5,unit:"kg",muscle:"Espalda baja",rpe:"8/10",lastWeek:90,rest:"2-3 min",how:"Espalda neutra, barra pegada a las espinillas, empuja el suelo con las piernas al subir."},
      {name:"Dominadas o remo con barra",sets:"3",reps:"8",weight:0,unit:"pc",muscle:"Espalda",rpe:"7/10",lastWeek:0,rest:"90 seg-2 min",how:"Agarre a la anchura de hombros, sube hasta que la barbilla pase la barra, baja con control completo."},
      {name:"Press militar",sets:"3",reps:"8",weight:36,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:35,rest:"90 seg",how:"De pie, barra desde clavícula hasta bloqueo de codos. Core apretado, sin arquear la espalda baja."},
    ],
    fullbody_c: [
      {name:"Sentadilla trasera",sets:"4",reps:"6",weight:75,unit:"kg",muscle:"Pierna",rpe:"8/10",lastWeek:72.5,rest:"2-3 min",how:"Barra sobre trapecio, baja hasta que los muslos pasen de paralelo, rodillas alineadas con los pies."},
      {name:"Press banca",sets:"4",reps:"6",weight:65,unit:"kg",muscle:"Pecho",rpe:"8/10",lastWeek:62.5,rest:"2-3 min",how:"Baja controlado hasta rozar el pecho, codos a ~45°. Empuja explosivo sin despegar los glúteos del banco."},
      {name:"Peso muerto convencional",sets:"3",reps:"5",weight:95,unit:"kg",muscle:"Espalda baja",rpe:"8/10",lastWeek:92.5,rest:"2-3 min",how:"Espalda neutra, barra pegada a las espinillas, empuja el suelo con las piernas al subir."},
      {name:"Dominadas o remo con barra",sets:"3",reps:"8",weight:0,unit:"pc",muscle:"Espalda",rpe:"7/10",lastWeek:0,rest:"90 seg-2 min",how:"Agarre a la anchura de hombros, sube hasta que la barbilla pase la barra, baja con control completo."},
      {name:"Press militar",sets:"3",reps:"8",weight:37.5,unit:"kg",muscle:"Hombros",rpe:"7/10",lastWeek:36,rest:"90 seg",how:"De pie, barra desde clavícula hasta bloqueo de codos. Core apretado, sin arquear la espalda baja."},
    ],
  },
  GAIA: {
    fullbody_suave: [
      {name:"Sentadilla con peso corporal",sets:"3",reps:"12",weight:0,unit:"pc",muscle:"Pierna",rpe:"5/10",lastWeek:0,rest:"60 seg",how:"Baja a tu ritmo, sin prisa, hasta donde sea cómodo. Siente el músculo trabajar, no busques profundidad máxima."},
      {name:"Remo suave con banda",sets:"3",reps:"12",weight:0,unit:"pc",muscle:"Espalda",rpe:"5/10",lastWeek:0,rest:"60 seg",how:"Tira la banda hacia el abdomen apretando los omóplatos, vuelve despacio y controlado."},
      {name:"Puente de glúteo",sets:"3",reps:"15",weight:0,unit:"pc",muscle:"Glúteo",rpe:"5/10",lastWeek:0,rest:"45-60 seg",how:"Tumbada, empuja con los talones y aprieta el glúteo arriba 1-2 segundos antes de bajar."},
      {name:"Plancha isométrica",sets:"3",reps:"30s",weight:0,unit:"—",muscle:"Core",rpe:"5/10",lastWeek:0,rest:"45-60 seg",how:"Cuerpo en línea recta, sin hundir la cadera. Respira con calma, sal antes de que la técnica se rompa."},
    ],
  },
};

// Devuelve la lista de ejercicios correcta para el día de hoy de un perfil,
// según el "split" marcado en su weekPlan. Si no hay día de entreno marcado
// como hoy, cae al primer split disponible del perfil.
export function getTodayWorkout(profileId){
  const p = PROFILES[profileId];
  if(!p) return [];
  const today = p.weekPlan.find(d=>d.today);
  const splits = WORKOUTS[profileId] || {};
  if(today && today.split && splits[today.split]) return splits[today.split];
  const first = Object.values(splits)[0];
  return first || [];
}

export const MEALS = {
  ALPHA:[
    {time:"08:00",name:"Desayuno fuerza",items:"6 huevos revueltos · avena 80g · plátano · leche",kcal:680,prot:48,why:"Alta proteína + carbos de absorción lenta para empezar con energía sostenida."},
    {time:"13:30",name:"Almuerzo",items:"Pollo 250g · arroz basmati 150g · verduras salteadas · AOVE",kcal:720,prot:55,why:"Comida principal. Carbos para rellenar glucógeno y proteína para síntesis muscular."},
    {time:"17:00",name:"Pre-entreno",items:"Fruta · batido proteína · creatina 5g",kcal:310,prot:28,why:"Carbos rápidos para el entreno + proteína para evitar catabolismo."},
    {time:"21:00",name:"Cena recuperación",items:"Salmón 250g · patata dulce · ensalada verde",kcal:520,prot:44,why:"Proteína de digestión lenta + omega 3 para recuperación nocturna."},
  ],
  HERA:[
    {time:"08:00",name:"Desayuno ligero",items:"Yogur griego 200g · frutos rojos · granola 30g · café",kcal:340,prot:22,why:"Proteína + fibra + probióticos. Desayuno saciante que controla el apetito."},
    {time:"12:00",name:"Almuerzo",items:"Pechuga 150g · quinoa 80g · verduras al horno",kcal:480,prot:38,why:"Proteína completa + carbos complejos con aminoácidos esenciales de la quinoa."},
    {time:"16:00",name:"Merienda",items:"Batido proteína · manzana",kcal:280,prot:25,why:"Proteína para evitar catabolismo + fructosa para hígado y energía."},
    {time:"20:30",name:"Cena",items:"Merluza 150g · brócoli · arroz integral 60g",kcal:420,prot:35,why:"Cena ligera. Pescado blanco + vegetal crucífero de bajo índice glucémico."},
  ],
  ZEN:[
    {time:"08:30",name:"Desayuno tranquilo",items:"Tostadas integrales · aguacate · 2 huevos · té verde",kcal:480,prot:28,why:"Grasas saludables + proteína + L-teanina del té para calma y enfoque."},
    {time:"13:00",name:"Almuerzo",items:"Pavo 200g · lentejas 100g · ensalada mediterránea",kcal:580,prot:45,why:"Triptófano del pavo precursor de serotonina. Lentejas con hierro y fibra."},
    {time:"16:30",name:"Snack",items:"Frutos secos 30g · fruta de temporada",kcal:320,prot:10,why:"Magnesio de los frutos secos para sistema nervioso. Azúcares naturales para la tarde."},
    {time:"20:00",name:"Cena ligera",items:"Crema verduras · pechuga 150g · pan integral",kcal:420,prot:35,why:"Cena ligera y cálida que facilita el sueño. Sin sobrecargar la digestión nocturna."},
  ],
  SHAPE:[
    {time:"07:30",name:"Desayuno proteico",items:"4 huevos · espinacas salteadas · café sin azúcar",kcal:380,prot:34,why:"Alta proteína en el desayuno aumenta saciedad y termogénesis."},
    {time:"12:30",name:"Almuerzo",items:"Pollo 200g · boniato 100g · verduras",kcal:520,prot:46,why:"Máxima proteína con boniato de bajo IG para recomposición."},
    {time:"16:00",name:"Pre-entreno",items:"Batido proteína · creatina 5g",kcal:280,prot:30,why:"Nutrientes específicos. Creatina para potencia y proteína para síntesis."},
    {time:"20:30",name:"Cena",items:"Atún 200g · ensalada grande · aguacate ½",kcal:420,prot:38,why:"Omega 3 antiinflamatorio + grasa del aguacate para vitaminas liposolubles."},
  ],
  ATENEA:[
    {time:"07:30",name:"Desayuno rápido",items:"Batido proteína · avena 50g · plátano · café",kcal:460,prot:35,why:"5 minutos, alto rendimiento. Proteína y carbos listos sin fricción antes del día."},
    {time:"13:00",name:"Almuerzo (batch cook)",items:"Pollo 200g · arroz 120g · verduras al vapor",kcal:580,prot:48,why:"Preparado el domingo. Cero decisiones entre semana, macros ya resueltos."},
    {time:"16:30",name:"Snack eficiente",items:"Yogur griego · frutos secos 20g",kcal:280,prot:20,why:"Proteína y grasas de calidad sin necesidad de cocinar nada."},
    {time:"20:30",name:"Cena",items:"Salmón 180g · quinoa 80g · ensalada",kcal:500,prot:38,why:"Cena completa, simple de montar, alta en proteína y omega 3."},
  ],
  GAIA:[
    {time:"08:30",name:"Desayuno tranquilo",items:"Tostadas integrales · aguacate · huevo · infusión",kcal:420,prot:20,why:"Sin prisa. Grasas saludables y proteína para empezar el día sin picos de energía."},
    {time:"13:30",name:"Almuerzo",items:"Legumbres 150g · verduras salteadas · AOVE",kcal:520,prot:26,why:"Fibra y proteína vegetal. Digestión suave, energía estable toda la tarde."},
    {time:"17:00",name:"Merienda",items:"Fruta de temporada · frutos secos 20g",kcal:260,prot:8,why:"Snack simple y real. Sin ultraprocesados, sin necesidad de contar nada."},
    {time:"20:00",name:"Cena ligera",items:"Crema de verduras · pescado blanco 150g",kcal:400,prot:32,why:"Cena ligera y cálida que facilita el descanso nocturno."},
  ],
};
