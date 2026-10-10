import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

/**
 * Kiểu chuyển cảnh, gắn vào cảnh ĐẾN (cảnh mới). Cảnh đi tự nhận phần "exit" tương ứng.
 *  cut         cắt thẳng
 *  fade        hoà tan
 *  blur        mờ + bạc màu (thời gian trôi)
 *  whip        lia nhanh có nhoè chuyển động
 *  zoomThrough zoom xuyên vào một điểm của cảnh cũ
 *  zoomOut     cảnh mới bắt đầu từ cận cảnh một điểm rồi kéo ra
 *  iris        mở tròn từ một điểm
 *  flash       lóe sáng trắng
 */
export type TransitionType = 'cut' | 'fade' | 'blur' | 'whip' | 'zoomThrough' | 'zoomOut' | 'iris' | 'flash';
export type Transition = {type: TransitionType; dur?: number; x?: number; y?: number; dir?: 1 | -1};

export const transitionFrames = (t?: Transition) => (!t || t.type === 'cut' ? 0 : t.dur ?? defaultDur[t.type]);

const defaultDur: Record<TransitionType, number> = {
  cut: 0,
  fade: 14,
  blur: 24,
  whip: 12,
  zoomThrough: 18,
  zoomOut: 20,
  iris: 22,
  flash: 14,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SceneShell: React.FC<{
  children: React.ReactNode;
  total: number; // tổng số frame của Sequence (đã gồm phần chồng)
  enter?: Transition;
  exit?: Transition; // = enter của cảnh kế tiếp
}> = ({children, total, enter, exit}) => {
  const frame = useCurrentFrame();
  const ed = transitionFrames(enter);
  const xd = transitionFrames(exit);
  const p = ed ? interpolate(frame, [0, ed], [0, 1], clamp) : 1; // 0 -> 1 khi vào
  const q = xd ? interpolate(frame, [total - xd, total], [0, 1], clamp) : 0; // 0 -> 1 khi ra

  let transform = '';
  let filter = '';
  let opacity = 1;
  let clipPath: string | undefined;
  let origin = '50% 50%';
  let white = 0;

  if (enter && p < 1) {
    const e = Easing.out(Easing.cubic)(p);
    switch (enter.type) {
      case 'fade':
        opacity = p;
        break;
      case 'blur':
        opacity = p;
        filter += ` blur(${(1 - p) * 14}px) saturate(${0.3 + 0.7 * p})`;
        break;
      case 'whip': {
        const dir = enter.dir ?? 1;
        transform += ` translateX(${(1 - e) * 100 * dir}%)`;
        filter += ` blur(${(1 - p) * 26}px)`;
        break;
      }
      case 'zoomThrough':
        opacity = interpolate(p, [0.35, 0.8], [0, 1], clamp);
        transform += ` scale(${1.25 - 0.25 * e})`;
        break;
      case 'zoomOut':
        origin = `${enter.x ?? 50}% ${enter.y ?? 50}%`;
        transform += ` scale(${5 - 4 * Easing.inOut(Easing.cubic)(p)})`;
        opacity = interpolate(p, [0, 0.25], [0, 1], clamp);
        break;
      case 'iris': {
        const r = Easing.inOut(Easing.cubic)(p) * 150;
        clipPath = `circle(${r}% at ${enter.x ?? 50}% ${enter.y ?? 50}%)`;
        break;
      }
      case 'flash':
        white = 1 - p;
        break;
      default:
        break;
    }
  }

  if (exit && q > 0) {
    const e = Easing.in(Easing.cubic)(q);
    switch (exit.type) {
      case 'whip': {
        const dir = exit.dir ?? 1;
        transform += ` translateX(${-e * 100 * dir}%)`;
        filter += ` blur(${q * 26}px)`;
        break;
      }
      case 'zoomThrough':
        origin = `${exit.x ?? 50}% ${exit.y ?? 50}%`;
        transform += ` scale(${1 + 5 * e})`;
        break;
      case 'blur':
        filter += ` blur(${q * 10}px) saturate(${1 - 0.6 * q})`;
        break;
      case 'flash':
        white = Math.max(white, q);
        break;
      default:
        break;
    }
  }

  return (
    <AbsoluteFill style={{opacity, transform: transform || undefined, transformOrigin: origin, filter: filter || undefined, clipPath, overflow: 'hidden'}}>
      {children}
      {white > 0 ? <AbsoluteFill style={{background: '#fffbe8', opacity: white}} /> : null}
    </AbsoluteFill>
  );
};
