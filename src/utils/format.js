const numberFormat = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });

// Quantità per un numero diverso di porzioni
export function scaleAmount(amount, fromServings, toServings) {
  if (amount == null || !fromServings) return null;
  return (amount * toServings) / fromServings;
}

const smallFormat = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });

// 372 -> "370", 2.25 -> "2,3", 0.25 -> "0,25"
export function formatAmount(amount) {
  if (amount == null) return '';
  if (amount >= 100) return numberFormat.format(Math.round(amount / 10) * 10);
  if (amount >= 10) return numberFormat.format(Math.round(amount));
  // sotto l'unità (un quarto di cucchiaino) serve un decimale in più
  if (amount < 1) return smallFormat.format(amount);
  return numberFormat.format(amount);
}

// 45 -> "45 min", 75 -> "1 h 15 min", 120 -> "2 h"
export function formatMinutes(minutes) {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
