import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Vệt bút dạ quang quét dưới chữ (từ trái sang phải), như đánh dấu tài liệu thật. */
export const Hl: React.FC<{at: number; dur?: number; color?: string; children: React.ReactNode}> = ({at, dur = 10, color = 'rgba(255, 226, 0, 0.85)', children}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(100deg, transparent 0.5%, ${color} 2%, ${color} 97%, transparent 99.5%)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${p * 100}% 78%`,
        backgroundPosition: '0 60%',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        padding: '0 4px',
        margin: '0 -4px',
      }}
    >
      {children}
    </span>
  );
};

export type DocSeg = string | {t: string; hl?: number; redact?: boolean};

/** Trang điện tín / văn bản mật đánh máy. Dòng là mảng các đoạn; đoạn có `hl` sẽ được tô dạ quang. */
export const DocPage: React.FC<{
  header?: string;
  meta?: string[];
  lines: DocSeg[][];
  size?: number;
  footer?: string;
}> = ({header = 'SECRET', meta = [], lines, size = 34, footer}) => (
  <div style={{position: 'absolute', inset: 0, padding: `${size * 1.8}px ${size * 2}px`, fontFamily: FONT.typewriter, fontSize: size, color: '#22201c', lineHeight: 1.55}}>
    <div style={{textAlign: 'center', color: '#b4231b', letterSpacing: 8, fontSize: size * 1.1, marginBottom: size * 0.6}}>{header}</div>
    {meta.map((m) => (
      <div key={m} style={{opacity: 0.85}}>
        {m}
      </div>
    ))}
    <div style={{borderTop: '3px dashed rgba(0,0,0,0.35)', margin: `${size * 0.6}px 0 ${size * 0.8}px`}} />
    {lines.map((segs, i) => (
      <div key={i} style={{whiteSpace: 'pre'}}>
        {segs.map((s, j) =>
          typeof s === 'string' ? (
            <span key={j}>{s}</span>
          ) : s.redact ? (
            <span key={j} style={{background: '#111', color: '#111'}}>
              {s.t}
            </span>
          ) : s.hl !== undefined ? (
            <Hl key={j} at={s.hl}>
              {s.t}
            </Hl>
          ) : (
            <span key={j}>{s.t}</span>
          ),
        )}
      </div>
    ))}
    {footer ? <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 1.4, textAlign: 'center', color: '#b4231b', letterSpacing: 8, fontSize: size * 1.1}}>{footer}</div> : null}
  </div>
);

/** Tấm séc "khống": chữ ký tự viết ra ở signAt, ô số tiền hiện ở amountAt. */
export const BlankCheck: React.FC<{w: number; h: number; amount: string; payee: string; date: string; memo: string; signer: string; amountAt: number; signAt: number}> = ({
  w,
  h,
  amount,
  payee,
  date,
  memo,
  signer,
  amountAt,
  signAt,
}) => {
  const frame = useCurrentFrame();
  const sign = interpolate(frame, [signAt, signAt + 18], [0, 1], clamp);
  const amt = interpolate(frame, [amountAt, amountAt + 6], [0, 1], clamp);
  const lines = new Array(26).fill(0).map((_, i) => {
    let d = `M 0 ${h * 0.12 + i * 9}`;
    for (let x = 0; x <= w; x += 20) {
      d += ` L ${x} ${h * 0.12 + i * 9 + 6 * Math.sin(x / 38 + i * 0.7)}`;
    }
    return d;
  });
  const label = {fontFamily: FONT.body, fontWeight: 700, fontSize: 24, color: '#37503f', letterSpacing: 2} as const;
  const field = {fontFamily: FONT.typewriter, fontSize: 44, color: '#1d2a22'} as const;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.25}}>
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#3f7b5a" strokeWidth={1.4} />
        ))}
      </svg>
      <div style={{position: 'absolute', inset: 18, border: '4px double #456e57'}} />
      <div style={{position: 'absolute', left: 52, top: 40, fontFamily: FONT.display, fontSize: 46, color: '#24402f', letterSpacing: 3}}>THE CONGRESS OF THE UNITED STATES</div>
      <div style={{position: 'absolute', right: 60, top: 46, ...label}}>
        DATE <span style={{...field, fontSize: 38, marginLeft: 12}}>{date}</span>
      </div>
      <div style={{position: 'absolute', left: 52, top: 150, ...label}}>PAY TO THE ORDER OF</div>
      <div style={{position: 'absolute', left: 330, top: 128, ...field, borderBottom: '3px solid #456e57', width: w - 760}}>{payee}</div>
      <div
        style={{
          position: 'absolute',
          right: 60,
          top: 118,
          width: 380,
          height: 76,
          border: '4px solid #456e57',
          background: 'rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...field,
          fontSize: 34,
          opacity: amt,
          transform: `scale(${1.3 - 0.3 * amt})`,
        }}
      >
        {amount}
      </div>
      <div style={{position: 'absolute', left: 52, top: 260, ...label}}>MEMO</div>
      <div style={{position: 'absolute', left: 160, top: 238, ...field, borderBottom: '3px solid #456e57', width: 520}}>{memo}</div>
      <div style={{position: 'absolute', right: 60, top: 338, width: 520, borderBottom: '3px solid #456e57'}} />
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 252,
          fontFamily: FONT.script,
          fontWeight: 700,
          fontSize: 92,
          color: '#1f2d6b',
          transform: 'rotate(-6deg)',
          clipPath: `inset(-30% ${(1 - sign) * 100}% -30% -5%)`,
          whiteSpace: 'nowrap',
        }}
      >
        {signer}
      </div>
      <div style={{position: 'absolute', left: 52, bottom: 40, fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: '#37503f', letterSpacing: 6}}>|: 1964 0807 :| 416 0 |</div>
    </div>
  );
};

/** Lịch xé: mỗi frame trong `flips` lật một tờ (tờ cũ bay lên), hiện ngày kế tiếp. */
export const TearCalendar: React.FC<{w: number; h: number; month: string; days: string[]; flips: number[]; year?: string}> = ({w, h, month, days, flips, year = '1964'}) => {
  const frame = useCurrentFrame();
  const passed = flips.filter((f) => frame >= f + 8).length;
  const cur = Math.min(days.length - 1, passed);
  const flipping = flips.findIndex((f) => frame >= f && frame < f + 8);
  const page = (day: string, style?: React.CSSProperties) => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: h * 0.16,
        width: w,
        height: h * 0.84,
        background: '#fbf8f1',
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 4px 0 #ddd6c8, 0 8px 0 #cfc7b6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transformOrigin: '50% 0',
        ...style,
      }}
    >
      <div style={{width: '100%', background: '#b4231b', color: '#fff', textAlign: 'center', fontFamily: FONT.display, fontSize: h * 0.13, padding: '6px 0', letterSpacing: 6}}>{month}</div>
      <div style={{fontFamily: FONT.display, fontSize: h * 0.5, color: C.ink, lineHeight: 1.05, marginTop: h * 0.02}}>{day}</div>
      <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: h * 0.06, color: '#6b645a', letterSpacing: 4}}>{year}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1400}}>
      <div style={{position: 'absolute', left: w * 0.06, top: 0, width: w * 0.88, height: h * 0.19, background: '#2b2b2f', borderRadius: 12, zIndex: 3}} />
      {page(days[Math.min(days.length - 1, cur + (flipping >= 0 ? 1 : 0))])}
      {flipping >= 0
        ? page(days[cur], {
            transform: `rotateX(${interpolate(frame, [flips[flipping], flips[flipping] + 8], [0, 115], clamp)}deg)`,
            opacity: interpolate(frame, [flips[flipping] + 4, flips[flipping] + 8], [1, 0], clamp),
            zIndex: 2,
          })
        : null}
    </div>
  );
};
