import { useMemo } from "react";
import SuperJSON from "superjson";

export function useServerSerializedValue<T>(value: string): T {
  return useMemo<T>(() => SuperJSON.parse(value), [value]);
}
