export function randomIdGenerator(): string {
  const alphabets = (new Array(26).fill("") as string[]).map((_s, idx) => String.fromCharCode(idx + 65));
  const char_space = [...alphabets, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const chars = new Array(4).fill("");
  let picker = 0;
  for (let i = 0; i < chars.length; ++i) {
    picker = Math.floor(Math.random() * 10) % char_space.length;
    chars[i] = char_space[picker];
  }

  return chars.join("").toLowerCase();

}
