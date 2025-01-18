import { stringToHslHue, toHslString } from "./color";

export function stringAvatar(name: string) {
  const { text, gradient } = textAvatarWithBg(name);

  return {
    sx: {
      bgimage: gradient,
    },
    children: text,
  };
}

export function textAvatarWithBg(name: string) {
  const words = name.split(" ").slice(0, 2);
  let letters = "";

  for (const word of words) {
    letters += word[0];
  }

  const baseHue = stringToHslHue(name);
  const prevHue = baseHue - 60;
  const nextHue = baseHue + 90;
  const saturation = 100;
  const lightness = 70;

  const firstColor = toHslString(prevHue, saturation, lightness - 10);
  const secondColor = toHslString(baseHue, saturation, lightness);
  const thirdColor = toHslString(nextHue, saturation, lightness + 10);

  return {
    text: letters,
    gradient: `linear-gradient(43deg, ${firstColor} 0%, ${secondColor} 46%, ${thirdColor} 100%)`,
  };
}
