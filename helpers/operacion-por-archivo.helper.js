const fs = require('fs');
const path = require('path');

const obtenerDatosPorArchivo = (filePath = '') => {
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
  return '';
};

// Guarda los lexemas en el archivo de su PATRON con saltos de linea
const guardarDatosPorArchivo = (filePath, data) => {
  fs.writeFileSync(filePath, data);
};

// Pasa los patrones de los archivos <<PATRON>>.txt a arrays
const obtenerArrayPorArchivo = (filePath = '') => {
  if (fs.existsSync(filePath)) {
    return fs
      .readFileSync(filePath, 'utf-8')
      .split(/\r?\n/);
      // .filter(Boolean);
  }
  return [];
};

// // Ruta del directorio para leer 
// const dirPath = path.join(__dirname, '..', 'nombre-archivos');

const leerNombreDeArchivosPorDirectorio = async (dirPath) => {
  const lista = [];
  
  return new Promise(res => {
    // Función para leer los nombres de archivo en el directorio
    fs.readdir(dirPath, (err, files) => {
      if (err) return console.log('Error al leer el directorio:', err);

      // Filtrar solo los archivos (excluye los directorios)
      const filenames = files.filter(file => {
        return fs.statSync(path.join(dirPath, file)).isFile();
      });

      filenames.map(file => {
        if (file === 'README.md') return;
        lista.push(file);
      });

      res(lista);
    });
  });
};

// Funcion que escribe la posicion de los lexemas en el archivo de salida
const crearArchivoOutput = (outputPath, data) => {
  const output = data
    .map((item) => `${item.TOKEN}, ${item.LEXEMA}, ${item.POSICION}`)
    .join("\n");
  fs.writeFileSync(outputPath, output);
};

module.exports = {
  obtenerDatosPorArchivo,
  guardarDatosPorArchivo,
  obtenerArrayPorArchivo,
  leerNombreDeArchivosPorDirectorio,
  crearArchivoOutput,
};
