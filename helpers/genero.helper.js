// Los lexemas que forman parte de excepciones, son los que se cambian de forma directa
const excepcionesFemenino = {
  actor: 'actriz',
  emperador: 'emperatriz',
  rey: 'reina',
  héroe: 'heroína',
  poeta: 'poetisa',
  presidente: 'presidenta',
  juez: 'jueza',
  cliente: 'clienta',
};

const excepcionesMasculino = {
  actriz: 'actor',
  emperatriz: 'emperador',
  reina: 'rey',
  heroína: 'héroe',
  poetisa: 'poeta',
  presidenta: 'presidente',
  jueza: 'juez',
};

// Los lexemas invariables, son masculinos y femeninos al mismo tiempo
const invariables = [
  "joven",
  "atleta",
  "estudiante",
  "artista",
  "cantante",
  "deportista",
  "modelo",
  "piloto",
  "taxista",
  "periodista",
];

const esMasculino = (palabra = '') => {
  // Verificar si la palabra está en las excepciones femeninas
  if (excepcionesFemenino[palabra]) return false;

  // Verificar si la palabra es invariable
  if (invariables.includes(palabra)) return true;

  // Definir las reglas de género masculino
  const reglasMasculinas = [
    /o$/, // Palabras que terminan en "o"
    /or$/, // Palabras que terminan en "or"
    /ón$/, // Palabras que terminan en "ón"
    /e$/, // Algunas palabras que terminan en "e"
  ];

  // Aplicar las reglas en orden
  for (let regla of reglasMasculinas) {
    if (regla.test(palabra)) {
      return true;
    }
  }

  // Si no se encontró una regla, considerar la palabra no masculina
  return false;
};

const getMasculino = (palabra = '') => {
  // Verificar si la palabra está en las excepciones
  if (excepcionesMasculino[palabra]) return excepcionesMasculino[palabra];

  // Verificar si la palabra es invariable
  if (invariables.includes(palabra)) return palabra;

  // Definir las reglas de conversión
  const reglas = [
    { femenino: /a$/, masculino: "o" },
    { femenino: /ora$/, masculino: "or" },
    { femenino: /ona$/, masculino: "ón" },
  ];

  // Aplicar las reglas en orden
  for (let regla of reglas) {
    if (regla.femenino.test(palabra)) {
      return palabra.replace(regla.femenino, regla.masculino);
    }
  }

  // Si no se encontró una regla, retornar la palabra original
  return palabra;
};

const getFemenino = (palabra = '') => {
  // Verificar si la palabra está en las excepciones
  if (excepcionesFemenino[palabra]) return excepcionesFemenino[palabra];

  // Verificar si la palabra es invariable
  if (invariables.includes(palabra)) return palabra;

  // Definir las reglas de conversión
  const reglas = [
    { masculino: /o$/, femenino: "a" },
    { masculino: /or$/, femenino: "ora" },
    { masculino: /ón$/, femenino: "ona" },
  ];

  // Aplicar las reglas en orden
  for (let regla of reglas) {
    if (regla.masculino.test(palabra)) {
      return palabra.replace(regla.masculino, regla.femenino);
    }
  }

  // Si no se encontró una regla, retornar la palabra original
  return palabra;
};

module.exports = {
  esMasculino,
  getMasculino,
  getFemenino
};
