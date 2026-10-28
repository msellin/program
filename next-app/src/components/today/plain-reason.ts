/**
 * Engine reasons are assembled for the log ("Signal: life load 5/10. Consider
 * trimming 5%..."). Rewrite the "Signal: ..." lead into a sentence a person
 * would say. Anything not matching passes through unchanged.
 */
export function plainReason(reason: string): string {
  return reason
    .replace(/^Signal: life load (\d+)\/10\./, "Your outside-training load is $1/10.")
    .replace(/^Signal: cardio (\d+) min\./, "You did $1 min of cardio recently.")
    .replace(/^Signal: ([^.]+)\./, (_m, s: string) => `Your notes mention ${s}.`);
}
