const { esMasculino, getFemenino, getMasculino } = require('./genero.helper');
const { confirmar, seleccionarToken } = require('./inquirer');
const { esSingular, getPlural, getSingular } = require('./singular-plural.helper');

const agregarLexemaATokenJsonPorToken = async (globalData, token, lexema) => {  
  const lexemaSingular = esSingular(lexema) ? lexema : getSingular(lexema); 
  const lexemaCantidad = esSingular(lexema) ? getPlural(lexema) : getSingular(lexema);
  
  const lexemaGenero = esMasculino(lexemaSingular) ? getFemenino(lexemaSingular) : getMasculino(lexemaSingular); 
  const lexemaGeneroCantidad = getPlural(lexemaGenero);

  // Agregar 1 mas a "lexemas procesados manualmente"
  globalData.cantidadLexemasProcesados.manualmente++;
 
  // Agregar el valor seleccionado
  globalData.tokenJson[token][lexema] = true;

  if (globalData.config.noAgregarSingularPlural && globalData.config.noAgregarGenero) return;

  // Agregar su correspondiente plural/singular
  if (!globalData.config.noAgregarSingularPlural) {
    if (globalData.config.automatizarSingularPlural) {
      globalData.tokenJson[token][lexemaCantidad] = true;
    } else {
      const tokenSeleccionado = await seleccionarToken(lexemaCantidad, { agregarOpcionIgnorar: true });
      if (tokenSeleccionado !== 'IGNORAR') {
        const ok = globalData.config.noConfirmarAntesDeClasificar || await confirmar(`¿Quieres agregar ${ `${lexemaCantidad}`.green } en ${ `${tokenSeleccionado}`.green }? ${'\nSino, este lexema no se agregara a la base de datos.'}`);
        if (ok) globalData.tokenJson[tokenSeleccionado][lexemaCantidad] = true;
      }
    }
  }

  // Obtener su correspondiente masculino/femenino
  if (!globalData.config.noAgregarGenero) {
    if (globalData.config.automatizarGenero) {
      globalData.tokenJson[token][lexemaGenero] = true;
    } else {
      const tokenSeleccionado = await seleccionarToken(lexemaGenero, { agregarOpcionIgnorar: true });
      if (tokenSeleccionado !== 'IGNORAR') {
        const ok = globalData.config.noConfirmarAntesDeClasificar || await confirmar(`¿Quieres agregar ${ `${lexemaGenero}`.green } en ${ `${tokenSeleccionado}`.green }? ${'\nSino, este lexema no se agregara a la base de datos.'}`);
        if (ok) globalData.tokenJson[tokenSeleccionado][lexemaGenero] = true;
      }
    }
  }

  if (!globalData.config.noAgregarSingularPlural && !globalData.config.noAgregarGenero) {
    if (globalData.config.automatizarSingularPlural && globalData.config.automatizarGenero) {
      globalData.tokenJson[token][lexemaGeneroCantidad] = true;
    } else {
      const tokenSeleccionado = await seleccionarToken(lexemaGeneroCantidad, { agregarOpcionIgnorar: true });
      if (tokenSeleccionado !== 'IGNORAR') {
        const ok = globalData.config.noConfirmarAntesDeClasificar || await confirmar(`¿Quieres agregar ${ `${lexemaGeneroCantidad}`.green } en ${ `${tokenSeleccionado}`.green }? ${'\nSino, este lexema no se agregara a la base de datos.'}`);
        if (ok) globalData.tokenJson[tokenSeleccionado][lexemaGeneroCantidad] = true;
      }
    }
  }

};

module.exports = {
  agregarLexemaATokenJsonPorToken
};
