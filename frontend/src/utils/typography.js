/**
 * Ajoute les espaces insécables avant la ponctuation haute française.
 * À utiliser pour tout texte venant d'une source externe (BDD, API, client).
 *
 * Usage : <p>{typoFr(monTexte)}</p>
 */
export function typoFr(text) {
  if (!text) return "";
  return text
    .replace(/ ([!?:;»])/g, "\u00A0$1")
    .replace(/«\s/g, "«\u00A0");
}
