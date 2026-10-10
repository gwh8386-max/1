import {continueRender, delayRender, staticFile} from 'remotion';

// Mỗi font được tách thành 3 phần (latin, latin-ext, vietnamese); trình duyệt tự chọn
// phần cần dùng theo unicode-range, nên chữ có dấu luôn hiển thị đúng.
const RANGES = {
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext':
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  vietnamese:
    'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
} as const;

const FAMILIES: {family: string; file: string; weights: number[]}[] = [
  {family: 'Anton', file: 'anton', weights: [400]},
  {family: 'Be Vietnam Pro', file: 'be-vietnam-pro', weights: [400, 600, 700, 800]},
  {family: 'Roboto Mono', file: 'roboto-mono', weights: [500, 700]},
  // Bộ Vox (chỉ có chữ Latin, dùng cho video tiếng Anh)
  {family: 'Special Elite', file: 'special-elite', weights: [400]},
  {family: 'Permanent Marker', file: 'permanent-marker', weights: [400]},
  {family: 'Caveat', file: 'caveat', weights: [600, 700]},
];

export const FONT = {
  display: '"Anton", "Be Vietnam Pro", sans-serif',
  body: '"Be Vietnam Pro", sans-serif',
  mono: '"Roboto Mono", monospace',
  typewriter: '"Special Elite", "Roboto Mono", monospace',
  marker: '"Permanent Marker", "Anton", sans-serif',
  script: '"Caveat", cursive',
};

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') {
    return;
  }
  started = true;
  const handle = delayRender('Tải font tiếng Việt');
  const faces: FontFace[] = [];
  for (const {family, file, weights} of FAMILIES) {
    for (const weight of weights) {
      for (const [subset, range] of Object.entries(RANGES)) {
        const url = staticFile(`fonts/${file}-${subset}-${weight}-normal.woff2`);
        faces.push(new FontFace(family, `url(${url}) format('woff2')`, {weight: String(weight), unicodeRange: range}));
      }
    }
  }
  Promise.all(
    faces.map((f) =>
      f
        .load()
        .then((loaded) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded))
        .catch(() => undefined), // thiếu file latin-ext của một font cũng không sao
    ),
  ).then(() => continueRender(handle));
};
