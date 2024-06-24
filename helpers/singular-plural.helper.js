const esSingular = (word) => {
  if (!word || typeof word !== 'string') {
    throw new Error('Por favor proporciona una palabra válida.');
  }

  // Reglas básicas para detectar palabras en singular en español
  const singularRules = [
    { regex: /([aeiouáéíóú])s$/i, replace: '$1s' }, // ejemplo: "casas", "niños"
    { regex: /([íú])es$/i, replace: '$1es' }, // ejemplo: "rubíes", "tabúes"
    { regex: /([aeiouáéíóú])ses$/i, replace: '$1ses' }, // ejemplo: "meses", "luneses"
    { regex: /ces$/i, replace: 'ces' }, // ejemplo: "luces", "peces"
    { regex: /ciones$/i, replace: 'ciones' }, // ejemplo: "comunicaciones"
    { regex: /es$/i, replace: 'es' } // ejemplo: "piedras", "casas", "lunas", "leches"
  ];

  // Palabras irregulares comunes en español
  const irregularPlurals = {
    lápices: 'lápiz',
    análisis: 'análisis',
    crisis: 'crisis',
    tesis: 'tesis',
    paréntesis: 'paréntesis'
  };

  // Verificar si la palabra es irregular
  if (irregularPlurals[word.toLowerCase()]) {
    return false; // Si la palabra está en la lista de plurales irregulares, es plural
  }

  // Aplicar reglas básicas
  for (let rule of singularRules) {
    if (rule.regex.test(word)) {
      return false; // Si la palabra coincide con alguna regla de plural, no es singular
    }
  }

  // Si ninguna regla coincide, asumimos que la palabra es singular
  return true;
};

const getSingular = (word) => {
  if (!word || typeof word !== 'string') {
    throw new Error('Por favor proporciona una palabra válida.');
  }

  // Reglas básicas para convertir palabras plurales en singulares en español
  const singularRules = [
    { regex: /ciones$/i, replace: 'ción' }, // ejemplo: "comunicaciones" -> "comunicación"
    { regex: /([íú])es$/i, replace: '$1' }, // ejemplo: "rubíes" -> "rubí", "tabúes" -> "tabú"
    { regex: /ses$/i, replace: 's' }, // ejemplo: "meses" -> "mes", "lenteses" -> "lentes"
    { regex: /ces$/i, replace: 'z' }, // ejemplo: "luces" -> "luz", "peces" -> "pez"
    { regex: /([udptfgjlxcvbnm])es$/i, replace: '$1e' }, // ejemplo: "intérpretes" -> "intérprete"
    { regex: /([aeiouáéíóú])ses$/i, replace: '$1s' }, // ejemplo: "meses" -> "mes", "luneses" -> "lunes"
    { regex: /es$/i, replace: '' }, // ejemplo: "celulares" -> "celular", "flores" -> "flor"
    { regex: /([aeiouáéíóú])s$/i, replace: '$1' }, // ejemplo: "casas" -> "casa", "niños" -> "niño"
  ];

  // Palabras irregulares comunes en español
  const irregularPlurals = {
    caos: 'caos',
    análisis: 'análisis',
    crisis: 'crisis',
    tesis: 'tesis',
    paréntesis: 'paréntesis'
  };

  // Verificar si la palabra es irregular
  if (irregularPlurals[word.toLowerCase()]) {
    return irregularPlurals[word.toLowerCase()];
  }

  // Aplicar reglas básicas
  for (let rule of singularRules) {
    if (rule.regex.test(word)) {
      return word.replace(rule.regex, rule.replace);
    }
  }

  // Si ninguna regla coincide, devolver la palabra original
  return word;
};

const getPlural = (word) => {
  if (!word || typeof word !== 'string') {
    throw new Error('Por favor proporciona una palabra válida.');
  }

  // Reglas básicas de pluralización en español
  const pluralRules = [
    { regex: /([aeiouáéíóú])$/i, replace: '$1s' }, // ejemplo: "casa" -> "casas", "niño" -> "niños"
    { regex: /([íú])$/i, replace: '$1es' }, // ejemplo: "rubí" -> "rubíes", "tabú" -> "tabúes"
    { regex: /([aeiouáéíóú])s$/i, replace: '$1ses' }, // ejemplo: "mes" -> "meses", "lunes" -> "luneses"
    { regex: /z$/i, replace: 'ces' }, // ejemplo: "luz" -> "luces", "pez" -> "peces"
    { regex: /ción$/i, replace: 'ciones' }, // ejemplo: "comunicación" -> "comunicaciones"
  ];

  // Palabras irregulares comunes en español
  const irregularPlurals = {
    lápiz: 'lápices',
    análisis: 'análisis',
    crisis: 'crisis',
    tesis: 'tesis',
    paréntesis: 'paréntesis'
  };

  // Verificar si la palabra es irregular
  if (irregularPlurals[word.toLowerCase()]) {
    return irregularPlurals[word.toLowerCase()];
  }

  // Aplicar reglas básicas
  for (let rule of pluralRules) {
    if (rule.regex.test(word)) {
      return word.replace(rule.regex, rule.replace);
    }
  }

  // Si no se aplican reglas, añadir "es" al final
  return word + 'es';
};

module.exports = {
  esSingular,
  getSingular,
  getPlural,
}
