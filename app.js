const path = require('path');
const {
  obtenerDatosPorArchivo,
  guardarDatosPorArchivo,
  crearArchivoOutput,
} = require('./helpers/operacion-por-archivo.helper');
const { seleccionarEntrada, seleccionarToken, confirmar, configurarProceso } = require('./helpers/inquirer');
const { agregarLexemaATokenJsonPorToken } = require('./helpers/token-json.helper');
const { inicializarDB } = require('./helpers/inicializacion-db.helper');

// Inicializa la DB de la APP
inicializarDB();

// Numero de output generado, es el numero del output_<<N>>.txt
const globalData = {
  tokenJson: JSON.parse(obtenerDatosPorArchivo(path.join(__dirname, 'db', 'token.json'))),
  nroArchivoDeSalida: 0,
  cantidadLexemasProcesados: {
    manualmente: 0,
    automaticamente: 0,
  },
  config: {
    noConfirmarAntesDeClasificar: true,
    noAgregarSingularPlural: false,
    noAgregarGenero: false,
    automatizarSingularPlural: false,
    automatizarGenero: false,
  },
};

// Contadores para las estadisticas finales del proceso
const initialCounts = {
  ARTICULO: Object.keys(globalData.tokenJson['ARTICULO']).length,
  SUSTANTIVO: Object.keys(globalData.tokenJson['SUSTANTIVO']).length,
  VERBO: Object.keys(globalData.tokenJson['VERBO']).length,
  ADJETIVO: Object.keys(globalData.tokenJson['ADJETIVO']).length,
  ADVERBIO: Object.keys(globalData.tokenJson['ADVERBIO']).length,
  OTROS: Object.keys(globalData.tokenJson['OTROS']).length,
  ERROR_LX: Object.keys(globalData.tokenJson['ERROR_LX']).length,
};

// Funcion que matchea los token con los patrones, si es que ya existen en la lista
const identificarTokenPorPalabra = (palabra = '', opciones = {}) => {
  const { incrementarCLP } = opciones;

  if (globalData.tokenJson['ARTICULO'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'ARTICULO';
  } else if (globalData.tokenJson['SUSTANTIVO'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'SUSTANTIVO';
  } else if (globalData.tokenJson['VERBO'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'VERBO';
  } else if (globalData.tokenJson['ADJETIVO'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'ADJETIVO';
  } else if (globalData.tokenJson['ADVERBIO'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'ADVERBIO';
  } else if (globalData.tokenJson['OTROS'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'OTROS';
  } else if (globalData.tokenJson['ERROR_LX'][palabra]) {
    incrementarCLP ? globalData.cantidadLexemasProcesados.automaticamente++ : '';
    return 'ERROR_LX';
  }
  return 'no_reconocido';
};

/**
 * Funcion que lee el texto, separa las palabras y llama a la funcion "identificarTokenPorPalabra"
 * @param {*} text
 * @returns
 */
const tokenizar = (textoEntrada = '') => {
  // Separado por espacios, comas y puntos
  const palabras = textoEntrada.split(/[\s,\.\?¿:]+/);
  const data = [];
  let position = 1;

  palabras.map((palabra = '') => {
    if (!palabra) return;
    // Identificar el token de cada palabra e incrementar la cantidad de lexemas procesados
    const token = identificarTokenPorPalabra(palabra.toLowerCase(), { incrementarCLP: true });
    data.push({
      TOKEN: token,
      LEXEMA: palabra.toLowerCase(),
      POSICION: `TXT${globalData.nroArchivoDeSalida}-${position++}`,
    });
  });

  return data;
};

// funcion para consultar al usuario por aquellos lexemas que no se pudo clasificar automaticamente
const clasificarTokensDesconocidos = async (data) => { 
  for (const item of data) {
    item.TOKEN = identificarTokenPorPalabra(item.LEXEMA);
    if (item.TOKEN === 'no_reconocido') {
      let seleccionDeTokenFinalizado = false;

      do {
        const tokenSeleccionado = await seleccionarToken(item.LEXEMA, { esEntrada: true });
        const ok = globalData.config.noConfirmarAntesDeClasificar || await confirmar(`¿Está seguro que deseas agregar ${ `${item.LEXEMA}`.green } en ${ `${tokenSeleccionado}`.green }?`);
        if (ok) {
          // Actualizar lexema a "tokenJson"
          await agregarLexemaATokenJsonPorToken(globalData, tokenSeleccionado, item.LEXEMA);

          // Actualizar TOKEN del lexema para el resultado final
          item.TOKEN = tokenSeleccionado;
          
          // Seleccion finalizada por el cliente
          seleccionDeTokenFinalizado = true;
        }
      } while (!seleccionDeTokenFinalizado);
    }
  }

  // Guardamos todos los patrones en los archivos correspondientes
  const dbTokenJson = path.join(__dirname, 'db', 'token.json');
  guardarDatosPorArchivo(dbTokenJson, JSON.stringify(globalData.tokenJson));
}

// funcion que imprime las estadisticas finales del proceso
const imprimirEstadisticasFinales = () => {
  const totalTokens =
    globalData.cantidadLexemasProcesados.automaticamente +
    globalData.cantidadLexemasProcesados.manualmente;
  const autoPercentage = (
    (globalData.cantidadLexemasProcesados.automaticamente / totalTokens) *
    100
  ).toFixed(2);
  const manualPercentage = (
    (globalData.cantidadLexemasProcesados.manualmente / totalTokens) *
    100
  ).toFixed(2);

  console.log(`\n--- Estadísticas del Proceso (lexemas de la entrada) ---`.green);
  console.log(`${'Total de lexemas:'.bold} ${totalTokens}`);
  console.log(
    `${'Procesados automáticamente:'.bold} ${globalData.cantidadLexemasProcesados.automaticamente} (${autoPercentage}%)`
  );
  console.log(
    `${'Procesados manualmente:'.bold} ${globalData.cantidadLexemasProcesados.manualmente} (${manualPercentage}%)\n`
  );

  console.log(`\n--- Estadísticas del Proceso (todos los lexemas, incluye los plural/singular y genero) ---`.green);
  console.log('Cantidad de lexemas por TOKEN:'.bold);
  const consoleTable = [];
  for (let token of Object.keys(initialCounts)) {
    consoleTable.push({
      'Token': token,
      'Antes': initialCounts[token],
      'Después': Object.keys(globalData.tokenJson[token]).length,
      'Nuevos': Object.keys(globalData.tokenJson[token]).length - initialCounts[token]
    });
  }
  console.table(consoleTable);
}

// Funcion que obtiene el siguiente nombre y numero de salida para el archivo output_<<N>>.txt
// contando la cantidad de archivos de salida output_<<N>>.txt del directorio
const obtenerSiguienteNombreDeArchivoDeSalida = () => {
  // Obtener el ultimo nro de los output existentes y sumarle 1
  const dirPath = path.join(__dirname, 'db', 'ultimo-nro-de-output.txt');
  let ultimoNroDeOutput = obtenerDatosPorArchivo(dirPath);
  globalData.nroArchivoDeSalida = ++ultimoNroDeOutput;

  // Actualizamos el valor
  guardarDatosPorArchivo(dirPath, `${globalData.nroArchivoDeSalida}`);
  return `outputs/output_${globalData.nroArchivoDeSalida}.txt`;
};

// funcion principal del proceso
const main = async () => {
  console.clear();
  console.log('========================'.cyan);
  console.log('      ¡Bienvenido!      '.cyan);
  console.log('========================\n'.cyan);

  const ok = await confirmar(`¿Desea continuar?`.green);
  if (!ok) {
    console.log('======================='.cyan);
    console.log('     ¡Hasta luego!     '.cyan);
    console.log('======================='.cyan);
    return;
  }

  let continuarProcesamiento = true;
  do {
    inicializarDB();

    await configurarProceso(globalData);

    // Se obtiene la entrada y la salida
    const entradaSeleccionada = await seleccionarEntrada();
    if (entradaSeleccionada.tipoProcesoSeleccionado === 'cancelacion') {
      console.log('======================='.cyan);
      console.log('     ¡Hasta luego!     '.cyan);
      console.log('======================='.cyan);
      return;
    } else if (['actualizacion', 'actualizacion_config'].includes(entradaSeleccionada.tipoProcesoSeleccionado)) {
      continue;
    }
    const inputPath = path.join(__dirname, 'inputs', entradaSeleccionada.entrada);
    const outputPath = obtenerSiguienteNombreDeArchivoDeSalida();

    // Leer el archivo de entrada
    const textoEntrada = obtenerDatosPorArchivo(inputPath);

    // Obtener los DataToken
    const dataToken = tokenizar(textoEntrada);
    await clasificarTokensDesconocidos(dataToken);
    crearArchivoOutput(outputPath, dataToken);
    imprimirEstadisticasFinales();

    const ok = await confirmar(`¿Quieres procesar otro archivo?`);
    continuarProcesamiento = ok;

    if (ok) {
      globalData.cantidadLexemasProcesados.manualmente = 0;
      globalData.cantidadLexemasProcesados.automaticamente = 0;

      initialCounts['ARTICULO'] = Object.keys(globalData.tokenJson['ARTICULO']).length;
      initialCounts['SUSTANTIVO'] = Object.keys(globalData.tokenJson['SUSTANTIVO']).length;
      initialCounts['VERBO'] = Object.keys(globalData.tokenJson['VERBO']).length;
      initialCounts['ADJETIVO'] = Object.keys(globalData.tokenJson['ADJETIVO']).length;
      initialCounts['ADVERBIO'] = Object.keys(globalData.tokenJson['ADVERBIO']).length;
      initialCounts['OTROS'] = Object.keys(globalData.tokenJson['OTROS']).length;
      initialCounts['ERROR_LX'] = Object.keys(globalData.tokenJson['ERROR_LX']).length;
    } else {
      console.log('======================='.cyan);
      console.log('     ¡Hasta luego!     '.cyan);
      console.log('======================='.cyan);
      return;
    }
  } while (continuarProcesamiento);
}

main();
