import {SceneClock, sec, Timeline} from '../../lib/timeline';
import data from './lines.json';

export const tl = data as Timeline;
export const SLUG = 'simo-hayha';
export const TOTAL = sec(tl.duration);

// Một đồng hồ cho cả video: mọi mốc là frame toàn cục, neo vào chữ trong lời thoại.
export const c = new SceneClock(tl, {id: 'ALL', title: '', meta: {}, lines: tl.lines.map((l) => l.id), start: 0, end: tl.duration}, 0, TOTAL);

/** Frame bắt đầu của một cảnh trong lines.json (C01...). */
export const sceneAt = (id: string) => sec(tl.scenes.find((s) => s.id === id)!.start);

// Ranh giới 6 bảng điều tra (đổi bảng giữa hai cảnh).
export const BOARDS = {
  b1: [0, sceneAt('C04')],
  b2: [sceneAt('C04'), sceneAt('C07')],
  b3: [sceneAt('C07'), sceneAt('C09')],
  b4: [sceneAt('C09'), sceneAt('C13')],
  b5: [sceneAt('C13'), sceneAt('C15')],
  b6: [sceneAt('C15'), TOTAL],
} as const;

/** Frame của chữ nhấn thứ k (`*chữ*` trong lời thoại) trong một dòng. */
export const em = (id: string, k = 0) => {
  const l = tl.lines.find((x) => x.id === id)!;
  const idx = l.words.map((w, i) => (w.emph ? i : -1)).filter((i) => i >= 0)[k] ?? 0;
  return c.at(id, idx);
};
