import { test } from "node:test";
import assert from "node:assert/strict";
import { service } from "../server/service.mjs";

import { patterns } from "../server/service.mjs";
test("author reference grids satisfy all row and column clues", () => {
  for (const [puzzle, rows] of Object.entries(patterns)) {
    const cells = rows
        .join("")
        .split("")
        .map((v) => (v === "1" ? 1 : -1)),
      r = service.compute({ puzzle, cells });
    assert.equal(r.solved, true);
    assert.equal(r.consistent, true);
  }
});
test("empty grid is playable, bounded and never falsely solved", () => {
  const r = service.compute(service.meta.default_input);
  assert.equal(r.solved, false);
  assert.equal(r.marked, 0);
  assert.ok(r.consistent);
  assert.ok(r.nodes_examined <= 5000);
});
test("returned forced hint agrees with an independent valid reference", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    if (r.hint) {
      const expected =
        patterns[p.input.puzzle].join("")[r.hint.index] === "1" ? 1 : -1;
      assert.equal(r.hint.value, expected);
    }
  }
});
test("contradictory filled grid reports conflicts instead of a fake hint", () => {
  const r = service.compute({
    ...service.meta.default_input,
    cells: Array(25).fill(1),
  });
  assert.equal(r.consistent, false);
  assert.equal(r.hint, null);
  assert.ok(r.row_status.includes("conflict"));
});
test("partial progress survives a pure recomputation and text export", () => {
  const p = { ...service.meta.default_input, cells: [1, ...Array(24).fill(0)] },
    r = service.compute(p);
  assert.equal(r.marked, 1);
  assert.deepEqual(r, service.compute(p));
  assert.ok(service.export(p).text.includes("#"));
});
test("invalid puzzle length cell and fields rejected", () => {
  for (const x of [
    { puzzle: "unknown" },
    { cells: Array(24).fill(0) },
    { cells: Array(25).fill(2) },
    { extra: 1 },
  ])
    assert.throws(() =>
      service.compute({ ...service.meta.default_input, ...x }),
    );
});
