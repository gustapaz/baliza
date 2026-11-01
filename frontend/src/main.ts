import ko from "knockout";
import { JSONRPCClient } from "json-rpc-2.0";
import { model } from "./model";
import { motionToggle } from "./client";
const revision = ko.observable(0),
  a = model("baliza", () => revision(revision() + 1)),
  d = a.d;
const rpc = new JSONRPCClient(async (request) => {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error("A verificação não respondeu. Tente novamente.");
  rpc.receive(await response.json());
});
a.api.compute = (input) =>
  Promise.resolve(rpc.timeout(10000).request("nonogram.check", input));
const get = (fn: () => any) =>
  ko.pureComputed(() => {
    revision();
    return fn();
  });
const vm: any = {
  ready: get(() => !!d.catalog),
  busy: get(() => d.busy),
  status: get(() => d.error || d.status),
  puzzles: get(() => d.catalog?.presets || []),
  cells: Array.from({ length: 25 }, (_, index) => ({
    index,
    row: Math.floor(index / 5) + 1,
    column: (index % 5) + 1,
    label: get(
      () =>
        `Linha ${Math.floor(index / 5) + 1}, coluna ${(index % 5) + 1}: ${d.input?.cells[index] === 1 ? "preenchida" : d.input?.cells[index] === -1 ? "marcada vazia" : "desconhecida"}`,
    ),
    className: get(() =>
      d.input?.cells[index] === 1
        ? "cell filled"
        : d.input?.cells[index] === -1
          ? "cell marked"
          : "cell",
    ),
    text: get(() => (d.input?.cells[index] === -1 ? "×" : "")),
    pressed: get(() => d.input?.cells[index] === 1),
  })),
  rows: get(
    () =>
      d.result?.clues.rows.map((r: any, i: number) => ({
        text: r.join(" "),
        state: d.result.row_status[i],
      })) || [],
  ),
  columns: get(
    () =>
      d.result?.clues.columns.map((r: any, i: number) => ({
        text: r.join(" "),
        state: d.result.column_status[i],
      })) || [],
  ),
  result: get(() => d.result),
  message: get(() =>
    !d.result
      ? ""
      : d.result.solved
        ? "Desenho resolvido. Todas as pistas conferem."
        : !d.result.consistent
          ? "Há marcas incompatíveis. Revise linhas e colunas."
          : `${d.result.marked}/25 casas marcadas · ${d.result.solutions} solução(ões) compatível(is).`,
  ),
  hasHint: get(() => !!d.result?.hint && !a.dirty()),
  solved: get(() => !!d.result?.solved),
  title: ko.observable(d.title),
  current: get(() => d.current),
  owns: get(() => d.owns),
  link: get(() => d.link),
  archive: get(() => d.archive),
  shareText: get(() => (d.current?.published ? "Encerrar link" : "Criar link")),
  saveText: get(() =>
    d.current && d.owns ? "Salvar alterações" : "Guardar desenho",
  ),
  choose: (p: any) => a.preset(p),
  cycle: (cell: any) => {
    if (d.busy) return;
    const cells = [...d.input.cells];
    cells[cell.index] =
      cells[cell.index] === 0 ? 1 : cells[cell.index] === 1 ? -1 : 0;
    a.change("cells", cells);
  },
  key: (cell: any, e: KeyboardEvent) => {
    const jump: { [k: string]: number } = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -5,
      ArrowDown: 5,
    };
    if (e.key in jump) {
      const next = Math.max(0, Math.min(24, cell.index + jump[e.key]));
      document
        .querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)
        ?.focus();
      e.preventDefault();
    }
    return true;
  },
  check: () => a.run(),
  hint: () => {
    const hint = d.result?.hint;
    if (!hint || a.dirty()) return;
    const cells = [...d.input.cells];
    cells[hint.index] = hint.value;
    a.change("cells", cells);
    void a.run();
  },
  clear: () => {
    a.change("cells", Array(25).fill(0));
    void a.run();
  },
  save: () => {
    a.title(vm.title());
    void a.save();
  },
  open: (x: any) => a.open(x.id),
  reload: () => a.open(d.current.id),
  share: () => a.share(),
  download: () => a.download(),
  fresh: () => a.fresh(),
  retry: () => a.init(),
};
vm.title.subscribe((v: string) => a.title(v));
revision.subscribe(() => {
  if (vm.title() !== d.title) vm.title(d.title);
});
const host = document.querySelector("#app-root")!;
host.innerHTML = template;
ko.applyBindings(vm, host);
motionToggle(() => {});
void a.init();
import template from "./view.html?raw";
