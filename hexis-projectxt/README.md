# HEXIS App

**Fortaleza del cuerpo. Claridad de la mente.**

## Estructura del proyecto

```
hexis-project/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   ├── exercises.js    → 33 ejercicios con ciencia aplicada
│   │   ├── foods.js        → Alimentos, macros, suplementos
│   │   └── profiles.js     → 5 perfiles HEXIS, workouts, meals
│   ├── App.js              → App completa
│   └── index.js            → Entry point
└── package.json
```

## Publicar en Vercel (5 minutos)

### Opción A — Arrastra y suelta (más fácil)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratis
2. En el dashboard, haz clic en **"Add New Project"**
3. Selecciona **"Browse"** y arrastra toda la carpeta `hexis-project`
4. Vercel detecta automáticamente que es React
5. Haz clic en **"Deploy"**
6. En 2 minutos tienes tu URL pública

### Opción B — GitHub (recomendado para actualizaciones)

1. Crea un repo en [github.com](https://github.com)
2. Sube los archivos con Git:
   ```bash
   git init
   git add .
   git commit -m "HEXIS v1"
   git push
   ```
3. En Vercel, importa el repo de GitHub
4. Cada vez que hagas push, Vercel actualiza automáticamente

### Opción C — Netlify (alternativa)

1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `hexis-project` al panel
3. Listo

---

## Añadir tus imágenes de estatuas

En `src/App.js`, las funciones `FigW`, `FigG`, `FigA`, `FigAn`, `FigB` son las siluetas SVG.

Para sustituirlas por tus fotos reales:

```jsx
// Cambia esta función
function FigW(){
  return(
    <img
      src="/statues/stat2.jpg"
      alt=""
      style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.4)"}}
    />
  );
}
```

Y pon tus imágenes en `public/statues/`.

---

## Añadir más contenido

- **Ejercicios**: `src/data/exercises.js` → añade objetos al array `EXERCISES`
- **Alimentos**: `src/data/foods.js` → añade objetos a `FOODS.proteina`, etc.
- **Suplementos**: `src/data/foods.js` → añade objetos al array `SUPPLEMENTS`
- **Perfiles**: `src/data/profiles.js` → modifica los 5 perfiles

---

## Próximos pasos para React Native (App Store / Play Store)

1. `npx create-expo-app hexis-native`
2. Los datos de `src/data/` se reutilizan sin cambios
3. La lógica de `App.js` se migra componente a componente
4. Expo permite publicar en ambas stores desde el mismo código

---

**HEXIS © 2025 · Entiende tu cuerpo. Construye tu vida.**
