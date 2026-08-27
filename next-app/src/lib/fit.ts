/**
 * Minimal FIT decoder (2026-08-27) — admin-gated while it is unvalidated.
 *
 * Why FIT alongside GPX, for this catalogue specifically:
 *   - rowing-2k-test-prep's retest reads
 *     `runs[].total_seconds where activity_type == 'row'`, and an erg has
 *     no GPS, so no GPX exists. Concept2/ErgData export FIT.
 *   - engine-builder's cardio is interval work (4x8 threshold, Norwegian
 *     4x4, 6x500m). GPX carries no lap markers, so the app cannot see the
 *     intervals at all; FIT has a lap message per interval.
 *
 * SCOPE AND HONESTY: the container format below — header, definition
 * messages, data messages, endianness, base-type sizes — is decoded
 * properly. The FIELD NUMBER MAPPINGS are from the FIT profile and have
 * NOT yet been checked against a real file from a real device. That is
 * exactly why this ships behind the super-admin gate with a raw dump
 * alongside the parsed values: the first real file either confirms the
 * mapping or shows which numbers are wrong. Do not widen the gate until
 * it has been checked against a device export.
 *
 * Per-record streams (message 20) are skipped deliberately. Sessions and
 * laps carry everything the log wants, and a per-second stream on a
 * three-hour ride is tens of thousands of records for nothing.
 */

const GLOBAL_SESSION = 18;
const GLOBAL_LAP = 19;

/** Base type sizes, indexed by the low nibble of the FIT base type byte. */
const BASE_SIZE: Record<number, number> = {
  0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 7: 1,
  8: 4, 9: 8, 10: 1, 11: 2, 12: 4, 13: 1, 14: 8, 15: 8, 16: 8,
};

type FieldDef = { num: number; size: number; baseType: number };
type MsgDef = { global: number; littleEndian: boolean; fields: FieldDef[]; devSize: number };

export type FitLap = {
  seconds: number | null;
  distance_m: number | null;
  avg_hr: number | null;
  max_hr: number | null;
};

export type ParsedFit = {
  seconds: number | null;
  distance_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_power: number | null;
  sport: number | null;
  laps: FitLap[];
  /** Every field found on the session message, for eyeballing the mapping. */
  rawSessionFields: Record<number, number>;
};

function readUnsigned(view: DataView, off: number, size: number, le: boolean): number | null {
  try {
    if (size === 1) return view.getUint8(off);
    if (size === 2) return view.getUint16(off, le);
    if (size === 4) return view.getUint32(off, le);
  } catch {
    return null;
  }
  return null;
}

/** FIT marks "no value" as all-bits-set for the width. */
function isInvalid(v: number | null, size: number): boolean {
  if (v == null) return true;
  return v === (size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff);
}

export function parseFit(buf: ArrayBuffer): ParsedFit | { error: string } {
  const view = new DataView(buf);
  if (view.byteLength < 14) return { error: "File is too small to be a FIT file." };

  const headerSize = view.getUint8(0);
  const magic = String.fromCharCode(
    view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11),
  );
  if (magic !== ".FIT") return { error: "Not a FIT file — missing the .FIT signature." };
  const dataSize = view.getUint32(4, true);
  const end = Math.min(headerSize + dataSize, view.byteLength);

  const defs = new Map<number, MsgDef>();
  const sessions: Array<Record<number, number>> = [];
  const laps: Array<Record<number, number>> = [];

  let off = headerSize;
  let guard = 0;
  while (off < end && guard++ < 500_000) {
    const header = view.getUint8(off);
    off += 1;

    if (header & 0x80) {
      // Compressed-timestamp data message. Its local type still needs its
      // definition to know the length, so skip via that.
      const local = (header >> 5) & 0x03;
      const def = defs.get(local);
      if (!def) break;
      off += def.fields.reduce((n, f) => n + f.size, 0) + def.devSize;
      continue;
    }

    const local = header & 0x0f;

    if (header & 0x40) {
      // Definition message.
      off += 1; // reserved
      const littleEndian = view.getUint8(off) === 0;
      off += 1;
      const global = view.getUint16(off, littleEndian);
      off += 2;
      const count = view.getUint8(off);
      off += 1;
      const fields: FieldDef[] = [];
      for (let i = 0; i < count; i++) {
        fields.push({
          num: view.getUint8(off),
          size: view.getUint8(off + 1),
          baseType: view.getUint8(off + 2),
        });
        off += 3;
      }
      let devSize = 0;
      if (header & 0x20) {
        const devCount = view.getUint8(off);
        off += 1;
        for (let i = 0; i < devCount; i++) {
          devSize += view.getUint8(off + 1);
          off += 3;
        }
      }
      defs.set(local, { global, littleEndian, fields, devSize });
      continue;
    }

    // Data message.
    const def = defs.get(local);
    if (!def) break;
    const collect = def.global === GLOBAL_SESSION || def.global === GLOBAL_LAP;
    const row: Record<number, number> = {};
    for (const f of def.fields) {
      if (collect) {
        const size = BASE_SIZE[f.baseType & 0x0f] ?? f.size;
        if (size === f.size) {
          const v = readUnsigned(view, off, size, def.littleEndian);
          if (!isInvalid(v, size)) row[f.num] = v as number;
        }
      }
      off += f.size;
    }
    off += def.devSize;
    if (collect) (def.global === GLOBAL_SESSION ? sessions : laps).push(row);
  }

  if (sessions.length === 0 && laps.length === 0) {
    return { error: "No session or lap data found in this file." };
  }

  // Field numbers per the FIT profile — UNVERIFIED against a real device
  // export; see the file header.
  const S = { elapsed: 7, distance: 9, sport: 5, avgHr: 16, maxHr: 17, avgPower: 20 };
  const L = { elapsed: 7, distance: 9, avgHr: 15, maxHr: 16 };

  const s = sessions[0] ?? {};
  const num = (v: number | undefined) => (typeof v === "number" ? v : null);
  const elapsed = num(s[S.elapsed]);
  const distance = num(s[S.distance]);

  return {
    // FIT stores elapsed time scaled by 1000 and distance by 100.
    seconds: elapsed == null ? null : Math.round(elapsed / 1000),
    distance_km: distance == null ? null : Math.round((distance / 100 / 1000) * 100) / 100,
    avg_hr: num(s[S.avgHr]),
    max_hr: num(s[S.maxHr]),
    avg_power: num(s[S.avgPower]),
    sport: num(s[S.sport]),
    laps: laps.map((l) => ({
      seconds: l[L.elapsed] != null ? Math.round(l[L.elapsed] / 1000) : null,
      distance_m: l[L.distance] != null ? Math.round(l[L.distance] / 100) : null,
      avg_hr: num(l[L.avgHr]),
      max_hr: num(l[L.maxHr]),
    })),
    rawSessionFields: s,
  };
}
