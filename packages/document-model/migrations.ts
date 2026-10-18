/** Schema zero was the pre-interaction document shape. Migration is explicit and only fills known additions. */
export function migrateProject(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const p = value as Record<string, unknown>;
  if (p["schemaVersion"] !== 0) return value;
  const visit = (value: unknown, depth: number): unknown => {
    if (depth > 100)
      throw new Error("Legacy tree exceeds the supported depth.");
    if (!value || typeof value !== "object") return value;
    const n = value as Record<string, unknown>;
    return {
      ...n,
      interactions: n["interactions"] ?? [],
      children: Array.isArray(n["children"])
        ? n["children"].map((c) => visit(c, depth + 1))
        : n["children"],
    };
  };
  return {
    ...p,
    schemaVersion: 1,
    components: p["components"] ?? [],
    assets: p["assets"] ?? [],
    tokens: p["tokens"] ?? {},
    metadata: p["metadata"] ?? { description: "", author: "" },
    pages: Array.isArray(p["pages"])
      ? p["pages"].map((page) => {
          if (!page || typeof page !== "object") return page;
          const pg = page as Record<string, unknown>;
          return { ...pg, root: visit(pg["root"], 0) };
        })
      : p["pages"],
  };
}
