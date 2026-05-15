// calculos.js - Lógica matemática e referências

// Erf function and Z-score logic
function erf(x) {
  let sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);
  let a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  let t = 1.0 / (1.0 + p * x);
  let y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
  return sign * y;
}

function zToPercentileReal(z) {
  let cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));
  let p = Math.round(cdf * 100);
  if (p < 1) p = 1; 
  if (p > 99) p = 99;
  return p;
}

// Barcelona References
function calcUmbilicalBarcelona(igSem, igDias, ip) {
  let GA = Number(igSem) + (Number(igDias) * 0.14);
  let z = (ip - (3.55219 - 0.13558 * GA + 0.00174 * GA * GA)) / 0.299;
  return zToPercentileReal(z);
}

function calcACMBarcelona(igSem, igDias, ip) {
  let GA = Number(igSem) + (Number(igDias) * 0.14);
  let z = (ip - ((-2.7317 + 0.3335 * GA) - 0.0058 * GA * GA)) / ((-0.88005 + 0.08182 * GA) - 0.00133 * GA * GA);
  return zToPercentileReal(z);
}

function calcRCPBarcelona(igSem, igDias, ipAcm, ipUmb) {
  let GA = Number(igSem) + (Number(igDias) * 0.14);
  let rcp = ipAcm / ipUmb;
  let z = (rcp - ((-4.0636 + 0.383 * GA) - 0.0059 * GA * GA)) / ((-0.9664 + 0.09027 * GA) - 0.0014 * GA * GA);
  return zToPercentileReal(z);
}

// ILA Moore Table
const tabelaMoore = {
  16:[73,79,121,185,201],17:[77,83,127,194,211],18:[80,87,133,202,220],
  19:[83,90,137,207,228],20:[86,93,141,212,235],21:[88,95,143,214,240],
  22:[89,97,145,216,243],23:[90,98,146,218,245],24:[90,98,147,219,247],
  25:[89,97,147,221,249],26:[89,97,147,223,252],27:[87,95,146,226,255],
  28:[86,94,146,228,259],29:[84,92,145,231,264],30:[82,90,145,234,269],
  31:[79,88,144,238,274],32:[77,86,144,242,280],33:[74,83,143,245,285],
  34:[72,81,142,248,289],35:[70,79,140,249,291],36:[68,77,138,249,292],
  37:[66,75,135,244,288],38:[65,73,132,239,281],39:[64,72,127,226,268],
  40:[63,71,123,214,253],41:[63,70,116,194,231],42:[62,69,110,175,210]
};

// Percentis Individuais (Baseados em aproximações de regressão - Hadlock/Jeanty)
function calcPercentilParametro(tipo, mm, semanas, dias) {
  if (!mm || mm <= 0 || semanas < 12) return "---";
  
  let ga = Number(semanas) + (Number(dias) / 7);
  let mean = 0;
  let sd = 0;
  let valCm = mm / 10; // Hadlock equations typically use cm
  
  // Equações polinomiais (valores extraídos de Perinatology - Hadlock)
  if (tipo === 'dbp') {
    mean = -3.08 + (0.41 * ga) - (0.000061 * Math.pow(ga, 3)); 
    sd = 0.30;
  } else if (tipo === 'cc') {
    mean = -11.48 + (1.56 * ga) - (0.0002548 * Math.pow(ga, 3)); 
    sd = 1.00;
  } else if (tipo === 'ca') {
    mean = -13.3 + (1.61 * ga) - (0.00998 * Math.pow(ga, 2));
    sd = 1.34;
  } else if (tipo === 'cf') {
    mean = -3.91 + (0.427 * ga) - (0.0034 * Math.pow(ga, 2));
    sd = 0.30;
  } else if (tipo === 'umero') {
    mean = -3.08 + (0.323 * ga);
    sd = 0.08 * mean;
  }
  
  if (mean <= 0) return "---";
  
  let z = (valCm - mean) / sd;
  let p = zToPercentileReal(z);
  return (p < 3) ? "< p3" : (p > 97) ? "> p97" : "p" + p;
}

// Percentis Uterinas e Ducto
function getPercentilUtA(sem, dias, ip) {
  if (!ip || ip <= 0 || sem < 11 || sem > 44) return '';
  let totalDias = (sem * 7) + dias;
  let Utamlog = Math.log(ip);
  let meanLog = (1.39 - (0.012 * totalDias)) + (1.98E-5 * Math.pow(totalDias, 2));
  let sdLog = 0.272 - (0.000259 * totalDias);
  let z = (Utamlog - meanLog) / sdLog;
  let perc = zToPercentileReal(z);
  return (perc < 3) ? "< p3" : (perc > 97) ? "> p97" : "p" + perc;
}

function getPercentilDV(sem, dias, ip) {
  if (!ip || ip <= 0 || sem < 20 || sem > 44) return '';
  let decSem = sem + (dias / 7);
  let meanDV = 0.903 - (0.0116 * decSem);
  let sdDV = 0.1483;
  let z = (ip - meanDV) / sdDV;
  let perc = zToPercentileReal(z);
  return (perc < 3) ? "< p3" : (perc > 97) ? "> p97" : "p" + perc;
}

// Export to window to be accessible
window.calculos = {
  getPercentilUmb: calcUmbilicalBarcelona,
  getPercentilACM: calcACMBarcelona,
  getPercentilRCP: calcRCPBarcelona,
  getPercentilUtA: getPercentilUtA,
  getPercentilDV: getPercentilDV,
  calcPercentilParametro: calcPercentilParametro,
  tabelaMoore: tabelaMoore,
  erf: erf,
  zToPercentileReal: zToPercentileReal
};
