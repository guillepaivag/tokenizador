const path = require("path");
const inquirer = require("inquirer");
require("colors");

const {
  leerNombreDeArchivosPorDirectorio,
} = require("./operacion-por-archivo.helper");

const seleccionarEntrada = async () => {
  const dirPath = path.join(__dirname, '..', 'inputs');

  let entrada = '';
  let procesoCancelacion = false;
  let continuarProceso = true;

  do {
    let entradas = []
    do {
      entradas = await leerNombreDeArchivosPorDirectorio(dirPath);

      if (!entradas.length)
        await pausa(
          `No tienes entradas, necesitas agregarla para continuar el procesamiento ${ ':('.red }`
        );
    } while (!entradas.length);

    const choices = [
      { name: `Cancelar`.red, value: 'cancelar' },
      { name: `Actualizar entradas`.yellow, value: 'actualizar' },
      ...entradas.map((v, i, array) => {
        return {
          name: `${`${i+1}.`.green} ${v}`,
          value: v,
        };
      })
    ];

    const preguntas = [
      {
        type: "list",
        name: "seleccion",
        message: "Seleccione una entrada:",
        choices,
      },
    ];

    const { seleccion } = await inquirer.prompt(preguntas);
    
    if (seleccion === 'cancelar') {
      entrada = '';
      continuarProceso = false;
      procesoCancelacion = true;
    } else if (seleccion === 'actualizar') {
      entrada = '';
      continuarProceso = true;
      procesoCancelacion = false;
    } else {
      entrada = seleccion;
      continuarProceso = false;
      procesoCancelacion = false;
    }
  } while (continuarProceso);

  return {
    entrada,
    continuarProceso,
    procesoCancelacion
  }
};

const seleccionarToken = async (lexema = '', opciones = {}) => {
  const tipoDeLexema = opciones?.esEntrada ? '[ENTRADA ]'.magenta : '[GENERADO]'.cyan;
  
  const choices = [
    { name: `ARTICULO`, value: 'ARTICULO' },
    { name: `SUSTANTIVO`, value: 'SUSTANTIVO' },
    { name: `VERBO`, value: 'VERBO' },
    { name: `ADJETIVO`, value: 'ADJETIVO' },
    { name: `ADVERBIO`, value: 'ADVERBIO' },
    { name: `OTROS`, value: 'OTROS' },
    { name: `ERROR_LX`, value: 'ERROR_LX' },
  ];

  if (opciones.agregarOpcionIgnorar) {
    choices.push({ name: 'IGNORAR'.red, value: 'IGNORAR' });
  }
  
  const preguntas = [
    {
      type: "list",
      name: "token",
      message: `${tipoDeLexema} ¿Qué tipo de token es ${ `${lexema}`.green }?`,
      choices,
    },
  ];

  const { token } = await inquirer.prompt(preguntas);
  return token;
};

const confirmar = async (message) => {
  const question = [
    {
      type: "confirm",
      name: "ok",
      message,
    },
  ];

  const { ok } = await inquirer.prompt(question);
  return ok;
};

const pausa = async (message) => {
    
  const question = [
      {
          type: 'input',
          name: 'enter',
          message
      }
  ];

  await inquirer.prompt(question);
};

const configurarProceso = async (globalData = {}) => {
  const choices = [
    { name: `No confirmar antes de clasificar un lexema`, value: 'noConfirmarAntesDeClasificar' },
    { name: `No agregar singular/plural `, value: 'noAgregarSingularPlural' },
    { name: `No agregar género`, value: 'noAgregarGenero' },
    { name: `Automatizar clasificación de singular/plural ${'BETA'.inverse}`, value: 'automatizarSingularPlural' },
    { name: `Automatizar clasificación de género ${'BETA'.inverse}`, value: 'automatizarGenero' },
  ];
  
  const preguntas = [
    {
      type: "checkbox",
      name: "configs",
      message: `Configure su proceso`,
      choices: choices.map(v => {
        return {
          ...v,
          checked: globalData.config[v.value],
        }
      }),
    },
  ];

  const { configs } = await inquirer.prompt(preguntas);

  for (const config of Object.keys(globalData.config)) {
    globalData.config[config] = configs.includes(config);
  }
};

module.exports = {
  seleccionarEntrada,
  seleccionarToken,
  confirmar,
  pausa,
  configurarProceso,
};
