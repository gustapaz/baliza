import { inputSchema } from "./input-schema.mjs";
import { fail } from "./errors.mjs";
import * as v from "valibot";
function convert(p) {
  if (p.enum) return v.picklist(p.enum);
  if (p.type === "object")
    return v.strictObject(
      Object.fromEntries(
        Object.entries(p.properties).map(([k, s]) => [k, convert(s)]),
      ),
    );
  if (p.type === "boolean") return v.boolean();
  let base =
      p.type === "array"
        ? v.array(convert(p.items))
        : p.type === "string"
          ? v.string()
          : v.number(),
    checks = [];
  if (p.type === "integer") checks.push(v.integer());
  if (p.type === "number" || p.type === "integer") checks.push(v.finite());
  if (p.minimum !== undefined) checks.push(v.minValue(p.minimum));
  if (p.maximum !== undefined) checks.push(v.maxValue(p.maximum));
  if (p.minItems !== undefined || p.minLength !== undefined)
    checks.push(v.minLength(p.minItems ?? p.minLength));
  if (p.maxItems !== undefined || p.maxLength !== undefined)
    checks.push(v.maxLength(p.maxItems ?? p.maxLength));
  if (p.pattern) checks.push(v.regex(new RegExp(p.pattern)));
  if (p.uniqueItems) checks.push(v.check((a) => new Set(a).size === a.length));
  return v.pipe(base, ...checks);
}
const schema = convert(inputSchema);
export function validateInput(input) {
  const r = v.safeParse(schema, input);
  if (!r.success)
    fail("invalid_input", "Confira tipos, limites e células do tabuleiro.");
  return r.output;
}
