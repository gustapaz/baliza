import { routeTable, simpleDispatch } from "./routes.mjs";
import { service } from "./service.mjs";
import { guarded, errorResponse, readJson } from "./transport.mjs";
import { fail } from "./errors.mjs";
import { JSONRPCServer, JSONRPCErrorException } from "json-rpc-2.0";
export function createApi(db, clock) {
  const dispatch = simpleDispatch(routeTable(db, service, clock)),
    server = new JSONRPCServer({
      errorListener: (_message, error) => {
        if (error?.code !== -32602) console.warn("baliza.rpc.internal");
      },
    });
  server.addMethod("nonogram.check", (params) => {
    try {
      return service.compute(params);
    } catch (e) {
      throw new JSONRPCErrorException(
        e.code ? e.message : "Não foi possível conferir o tabuleiro.",
        -32602,
      );
    }
  });
  return guarded(async (req) => {
    if (new URL(req.url).pathname !== "/api/rpc") return dispatch(req);
    if (req.method !== "POST") fail("method_not_allowed", "Use POST.", 405);
    const body = await readJson(req);
    if (Array.isArray(body))
      fail("invalid_rpc", "Uma chamada por requisição.", 400);
    const response = await server.receive(body);
    return response
      ? Response.json(response)
      : new Response(null, { status: 204 });
  });
}
