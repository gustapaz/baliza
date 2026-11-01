export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["puzzle", "cells"],
  properties: {
    puzzle: { type: "string", enum: ["sail", "leaf", "bridge"] },
    cells: {
      type: "array",
      minItems: 25,
      maxItems: 25,
      items: { type: "integer", minimum: -1, maximum: 1 },
    },
  },
};
