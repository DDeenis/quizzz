function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export function stringAvatar(name: string) {
  const { text, bg } = textAvatarWithBg(name);

  return {
    sx: {
      bgcolor: bg,
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

  return {
    text: letters,
    bg: stringToColor(name),
  };
}
