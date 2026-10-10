import React, {createContext, useContext} from 'react';

export type Word = {w: string; s: number; e: number; emph?: boolean};
export type Cue = {kind: string; text: string; word: number; s: number};
export type LineT = {
  id: string;
  scene: string;
  text: string;
  dir: string;
  pause: string;
  start: number;
  end: number;
  words: Word[];
  cues?: Cue[];
};
export type SceneT = {
  id: string;
  title: string;
  meta: Record<string, string>;
  lines: string[];
  start: number;
  end: number;
};
export type Timeline = {
  title: string;
  lang?: string;
  source: 'estimate' | 'voice';
  duration: number;
  scenes: SceneT[];
  lines: LineT[];
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

/** Bộ tra thời gian, tính theo khung hình (frame) cục bộ của một cảnh. */
export class SceneClock {
  readonly start: number; // frame toàn cục khi cảnh bắt đầu (chưa tính phần chồng lúc chuyển cảnh)
  readonly lead: number; // số frame cảnh được hiện sớm để chuyển cảnh
  readonly total: number; // tổng số frame của cảnh (đã gồm phần chồng khi chuyển cảnh)
  constructor(
    private tl: Timeline,
    readonly scene: SceneT,
    lead: number,
    total: number,
  ) {
    this.start = sec(scene.start);
    this.lead = lead;
    this.total = total;
  }

  private line(id: string): LineT {
    const l = this.tl.lines.find((x) => x.id === id);
    if (!l) {
      throw new Error(`Không có dòng ${id}`);
    }
    return l;
  }

  /** Chuyển giây toàn cục -> frame cục bộ (0 = lúc cảnh bắt đầu thật). */
  local(globalSec: number) {
    return sec(globalSec) - this.start + this.lead;
  }

  /** Frame bắt đầu của một dòng, hoặc của một chữ trong dòng (theo vị trí hoặc theo nội dung). */
  at(id: string, word?: number | string, offsetSec = 0): number {
    const l = this.line(id);
    if (word === undefined) {
      return this.local(l.start + offsetSec);
    }
    const idx =
      typeof word === 'number'
        ? word
        : l.words.findIndex((w) => w.w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').startsWith(word.toLowerCase()));
    const w = l.words[Math.max(0, Math.min(l.words.length - 1, idx))];
    return this.local(w.s + offsetSec);
  }

  end(id: string, offsetSec = 0) {
    return this.local(this.line(id).end + offsetSec);
  }

  /** Độ dài cảnh (frame), chưa tính phần chồng. */
  get duration() {
    return sec(this.scene.end) - this.start;
  }
}

export const ClockContext = createContext<SceneClock | null>(null);

export const useClock = () => {
  const c = useContext(ClockContext);
  if (!c) {
    throw new Error('useClock phải nằm trong một cảnh');
  }
  return c;
};

export const ClockProvider: React.FC<{clock: SceneClock; children: React.ReactNode}> = ({clock, children}) =>
  React.createElement(ClockContext.Provider, {value: clock}, children);

export const activeLine = (tl: Timeline, tSec: number): LineT | undefined =>
  tl.lines.find((l) => tSec >= l.start - 0.05 && tSec <= l.end + 0.25);
