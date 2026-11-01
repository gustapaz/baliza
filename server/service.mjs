import { validateInput } from "./validator.mjs";
export const patterns = {
  sail: ["00100", "00110", "00111", "11111", "01110"],
  leaf: ["00100", "01110", "11111", "01110", "00100"],
  bridge: ["10001", "11011", "11111", "10001", "10001"],
};
export const runs = (row) => {
  const r = [];
  let n = 0;
  for (const v of [...row, 0]) {
    if (v) n++;
    else if (n) {
      r.push(n);
      n = 0;
    }
  }
  return r.length ? r : [0];
};
function clues(id) {
  const grid = patterns[id].map((r) => [...r].map(Number));
  return {
    rows: grid.map(runs),
    columns: Array.from({ length: 5 }, (_, x) => runs(grid.map((r) => r[x]))),
  };
}
export const meta = {
  slug: "baliza",
  title: "BALIZA",
  engine: "json-rpc-valibot-nonogram",
  puzzles: Object.entries(patterns).map(([id]) => ({
    id,
    name: { sail: "Vela", leaf: "Folha", bridge: "Ponte" }[id],
    ...clues(id),
  })),
  default_input: { puzzle: "sail", cells: Array(25).fill(0) },
  presets: ["sail", "leaf", "bridge"].map((id) => ({
    name: { sail: "Vela", leaf: "Folha", bridge: "Ponte" }[id],
    input: { puzzle: id, cells: Array(25).fill(0) },
  })),
  note: "Nonogramas originais de 5×5. Vazio é desconhecido, preenchido vale 1, marca de vazio vale −1. O servidor aceita qualquer grade que satisfaça todas as pistas, não apenas o desenho de referência.",
};
export const validate = validateInput;
const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
function candidates(clue, known) {
  return Array.from({ length: 32 }, (_, bits) =>
    Array.from({ length: 5 }, (_, i) => (bits >> (4 - i)) & 1),
  ).filter(
    (row) =>
      equal(runs(row), clue) &&
      row.every((v, i) => known[i] === 0 || v === (known[i] === 1 ? 1 : 0)),
  );
}
export function compute(raw) {
  const p = validate(raw),
    c = clues(p.puzzle),
    grid = Array.from({ length: 5 }, (_, y) => p.cells.slice(y * 5, y * 5 + 5)),
    rows = grid.map((r, i) => candidates(c.rows[i], r)),
    columns = Array.from({ length: 5 }, (_, x) =>
      candidates(
        c.columns[x],
        grid.map((r) => r[x]),
      ),
    ),
    status = (known, options) =>
      !options.length ? "conflict" : known.includes(0) ? "open" : "complete",
    row_status = grid.map((r, i) => status(r, rows[i])),
    column_status = Array.from({ length: 5 }, (_, x) =>
      status(
        grid.map((r) => r[x]),
        columns[x],
      ),
    );
  let solutions = 0,
    nodes = 0,
    exhausted = false,
    first,
    common;
  const partial = [];
  function visit(y) {
    if (++nodes > 5000) {
      exhausted = true;
      return;
    }
    if (y === 5) {
      solutions++;
      if (!first) {
        first = partial.flat();
        common = [...first];
      } else
        common = common.map((v, i) => (v === partial.flat()[i] ? v : null));
      return;
    }
    for (const row of rows[y]) {
      partial.push(row);
      if (
        columns.every((opts, x) =>
          opts.some((col) => partial.every((r, i) => r[x] === col[i])),
        )
      )
        visit(y + 1);
      partial.pop();
      if (exhausted) return;
    }
  }
  if (!row_status.includes("conflict") && !column_status.includes("conflict"))
    visit(0);
  let hint = null;
  if (!exhausted && solutions) {
    const i = common.findIndex((v, i) => p.cells[i] === 0 && v !== null);
    if (i >= 0) hint = { index: i, value: common[i] === 1 ? 1 : -1 };
  }
  return {
    puzzle: p.puzzle,
    cells: p.cells,
    clues: c,
    row_status,
    column_status,
    solved:
      row_status.every((v) => v === "complete") &&
      column_status.every((v) => v === "complete"),
    filled: p.cells.filter((v) => v === 1).length,
    marked: p.cells.filter((v) => v !== 0).length,
    solutions,
    search_exhausted: exhausted,
    nodes_examined: Math.min(5000, nodes),
    hint,
    consistent: solutions > 0 || exhausted,
  };
}
export function exportResult(input) {
  const r = compute(input);
  return {
    type: "text/plain; charset=utf-8",
    extension: "txt",
    text:
      "BALIZA · NONOGRAMA ORIGINAL\n\n" +
      Array.from({ length: 5 }, (_, y) =>
        r.cells
          .slice(y * 5, y * 5 + 5)
          .map((v) => (v === 1 ? "#" : v === -1 ? "x" : "."))
          .join(" "),
      ).join("\n") +
      "\n\n" +
      (r.solved ? "Resolvido." : "Em andamento.") +
      "\n",
  };
}
export const service = { meta, validate, compute, export: exportResult };
