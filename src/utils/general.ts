export function findLastIndex<T>(
  array: T[],
  predicate: (elem: T, index: number, array: T[]) => boolean
) {
  const arrayCopy = [...array];
  arrayCopy.reverse();
  return arrayCopy.findIndex(predicate);
}
