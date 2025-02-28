export function findLastIndex<T>(
  array: T[],
  predicate: (elem: T, index: number, array: T[]) => boolean
) {
  const arrayCopy = [...array];
  arrayCopy.reverse();
  return arrayCopy.findIndex(predicate);
}

export const shuffleArray = <T>(array: T[], seed?: number) => {
  const random = seed ? mulberry32(seed) : Math.random;
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
};

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
