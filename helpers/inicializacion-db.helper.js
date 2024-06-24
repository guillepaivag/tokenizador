const fs = require("fs");
const path = require("path");
const { obtenerDatosPorArchivo, guardarDatosPorArchivo } = require("./operacion-por-archivo.helper");

const inicializarDB = () => {
  // Inicializacion de [token.json]
  let dirPath = path.join(__dirname, '..', "db", "token.json");
  let filePath = obtenerDatosPorArchivo(dirPath);
  if (!fs.existsSync(dirPath) || !filePath.length) {
    const value = {
      ARTICULO: {
        'el': true,
        'la': true,
        'los': true,
        'las': true,
        'un': true,
        'una': true,
        'unos': true,
        'unas': true
      },
      SUSTANTIVO: {},
      VERBO: {},
      ADJETIVO: {},
      ADVERBIO: {},
      OTROS: {},
      ERROR_LX: {},
    };

    guardarDatosPorArchivo(dirPath, JSON.stringify(value));
  }

  // Inicializacion de [ultimo-nro-de-output.txt]
  dirPath = path.join(__dirname, '..', "db", "ultimo-nro-de-output.txt");
  filePath = obtenerDatosPorArchivo(dirPath);
  if (!fs.existsSync(dirPath) || !filePath.length) {
    const value = "0";
    guardarDatosPorArchivo(dirPath, value);

    // TODO: Eliminar todos los archivos si existen
  }
};

module.exports = { inicializarDB };
