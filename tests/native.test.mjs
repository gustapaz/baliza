import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../server/api.mjs";
import { service } from "../server/service.mjs";
const api = createApi({});
const request = (path, body) =>
  api(
    new Request("https://demo.local" + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
import { JSONRPCClient } from "json-rpc-2.0";
const client = new JSONRPCClient(async (message) => {
  const r = await request("/api/rpc", message);
  client.receive(await r.json());
});
test("JSON-RPC client actually invokes server-side nonogram logic", async () => {
  assert.deepEqual(
    await client.request("nonogram.check", service.meta.default_input),
    service.compute(service.meta.default_input),
  );
});
test("invalid RPC params return a bounded standard error", async () => {
  await assert.rejects(
    () => client.request("nonogram.check", { puzzle: "unknown", cells: [] }),
    (e) => e.code === -32602,
  );
});
test(
  "oversized native requests terminate with 413, including cloned bodies",
  { timeout: 2000 },
  async () => {
    const r = await api(
      new Request("https://demo.local/api/rpc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(17000),
      }),
    );
    assert.equal(r.status, 413);
  },
);
