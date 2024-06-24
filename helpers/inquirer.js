const path = require('path');
const inquirer = require('inquirer');
require('colors');

const {
  leerNombreDeArchivosPorDirectorio,
} = require('./operacion-por-archivo.helper');

const seleccionarEntrada = async () => {
  const dirPath = path.join(__dirname, '..', 'inputs');

  let entrada = '';
  let tipoProcesoSeleccionado = 'procesamiento_entrada';
  let continuarProceso = true;

  do {
    let entradas = [];

    // Verifica que existan archivos (entradas) para procesar
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
      { name: `Actualizar configuraciones`.cyan, value: 'actualizar_config' },
      ...entradas.map((v, i, array) => {
        return {
          name: `${`${i+1}.`.green} ${v}`,
          value: v,
        };
      })
    ];

    const preguntas = [
      {
        type: 'list',
        name: 'seleccion',
        message: 'Seleccione una entrada:',
        choices,
      },
    ];

    const { seleccion } = await inquirer.prompt(preguntas);
    
    if (seleccion === 'cancelar') {
      entrada = '';
      continuarProceso = false;
      tipoProcesoSeleccionado = 'cancelacion';
    } else if (seleccion === 'actualizar') {
      entrada = '';
      continuarProceso = true;
      tipoProcesoSeleccionado = 'actualizacion';
    } else if (seleccion === 'actualizar_config') {
      entrada = '';
      continuarProceso = true;
      tipoProcesoSeleccionado = 'actualizacion_config';
    } else {
      entrada = seleccion;
      continuarProceso = false;
      tipoProcesoSeleccionado = 'procesamiento_entrada';
    }
  } while (continuarProceso);

  return {
    entrada,
    continuarProceso,
    tipoProcesoSeleccionado,
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
      type: 'list',
      name: 'token',
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
      type: 'confirm',
      name: 'ok',
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
  ];
  
  const preguntas = [
    {
      type: 'checkbox',
      name: 'configs',
      message: `Configure su proceso \n${`Si marcas algún ${'[No agregar ...]'.green}${' entonces en la siguiente configuración habrán opciones deshabilitadas.'.gray}\n`.gray}`,
      choices: choices.map(v => {
        return {
          ...v,
          checked: globalData.config[v.value],
        }
      }),
    },
  ];

  const { configs } = await inquirer.prompt(preguntas);

  // 
  if (!configs.includes('noAgregarSingularPlural') || !configs.includes('noAgregarGenero')) {
    const choices2 = [
      { name: `Automatizar clasificación de singular/plural ${'BETA'.inverse}`, value: 'automatizarSingularPlural' },
      { name: `Automatizar clasificación de género ${'BETA'.inverse}`, value: 'automatizarGenero' },
    ];

    // if (!configs.includes('noAgregarSingularPlural')) {
    //   choices2.push({ name: `Automatizar clasificación de singular/plural ${'BETA'.inverse}`, value: 'automatizarSingularPlural' });
    // }

    // if (!configs.includes('noAgregarGenero')) {
    //   choices2.push({ name: `Automatizar clasificación de género ${'BETA'.inverse}`, value: 'automatizarGenero' });
    // }
    
    const preguntas2 = [
      {
        type: 'checkbox',
        name: 'configs2',
        message: `Seleccione los procesos que desea automatizar`,
        choices: choices2.map(v => {
          return {
            ...v,
            checked: globalData.config[v.value],
            disabled: () => {
              if (v.value === 'automatizarSingularPlural') {
                return configs.includes('noAgregarSingularPlural');
              }
              if (v.value === 'automatizarGenero') {
                return configs.includes('noAgregarGenero');
              }
            }
          }
        }),
      },
    ];
  
    const { configs2 } = await inquirer.prompt(preguntas2);
    configs2.map(v => configs.push(v));
  }


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
