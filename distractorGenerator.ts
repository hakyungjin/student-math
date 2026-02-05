/**
 * 정답을 입력받아 4개의 오답 선지를 자동 생성합니다.
 * 생성된 오답은 정답과 유사하지만 다른 값입니다.
 */
export function generateDistractors(correctAnswer: string): string[] {
  const trimmed = correctAnswer.trim();

  // 1) 순수 정수
  if (/^-?\d+$/.test(trimmed)) {
    return intDistractors(parseInt(trimmed, 10));
  }

  // 2) 소수
  if (/^-?\d+\.\d+$/.test(trimmed)) {
    return decimalDistractors(parseFloat(trimmed), trimmed);
  }

  // 3) 분수 (예: 3/4, 3/4π, -1/2)
  const fracMatch = trimmed.match(/^(-?\d+)\/(\d+)(.*)$/);
  if (fracMatch) {
    return fractionDistractors(parseInt(fracMatch[1]), parseInt(fracMatch[2]), fracMatch[3] || '');
  }

  // 4) ㄱ,ㄴ,ㄷ 스타일 조합
  if (/^[ㄱ-ㅎ]/.test(trimmed) && /[,、\s]/.test(trimmed)) {
    return consonantComboDistractors(trimmed);
  }

  // 5) 사분면 조합
  if (trimmed.includes('사분면')) {
    return quadrantDistractors(trimmed);
  }

  // 6) ①②③ 원문자 조합
  if (/[①②③④⑤]/.test(trimmed)) {
    return circledNumDistractors(trimmed);
  }

  // 7) 부등식 (a < N 또는/그리고 a > M 패턴)
  if (/[<>≤≥]/.test(trimmed) || trimmed.includes('또는') || trimmed.includes('그리고')) {
    return inequalityDistractors(trimmed);
  }

  // Fallback: 숫자가 포함된 텍스트 → 숫자 부분을 변형
  if (/\d/.test(trimmed)) {
    return numericTextDistractors(trimmed);
  }

  // 최후: 접미/접두 변형
  return fallbackDistractors(trimmed);
}

/**
 * 정답 + 오답 4개를 합쳐서 셔플된 5개 선지 배열을 반환합니다.
 */
export function makeShuffledOptions(correctAnswer: string, distractors: string[]): string[] {
  const options = [correctAnswer, ...distractors.slice(0, 4)];
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// ── 정수 오답 ──
function intDistractors(n: number): string[] {
  const pool = new Set<number>();
  const abs = Math.abs(n);

  // 가까운 수
  for (const d of [1, -1, 2, -2, 3, -3]) {
    pool.add(n + d);
  }
  // 자릿수 기반 변형
  if (abs >= 10) {
    pool.add(n + 10);
    pool.add(n - 10);
  }
  if (abs >= 100) {
    pool.add(n + 100);
    pool.add(n - 100);
  }
  // 배수/약수
  if (n !== 0) {
    pool.add(n * 2);
    if (n % 2 === 0) pool.add(n / 2);
  }
  // 부호 반전
  pool.add(-n);

  pool.delete(n);
  const arr = Array.from(pool).map(String);
  return pickN(arr, 4, () => String(n + arr.length + 1));
}

// ── 소수 오답 ──
function decimalDistractors(n: number, original: string): string[] {
  const dp = (original.split('.')[1] || '').length;
  const pool = new Set<string>();

  for (const d of [0.1, -0.1, 0.2, -0.2, 0.5, -0.5, 1, -1]) {
    const v = n + d;
    if (Math.abs(v - n) > 0.0001) {
      pool.add(v.toFixed(dp));
    }
  }
  pool.delete(n.toFixed(dp));
  return pickN(Array.from(pool), 4, (i) => (n + i + 1).toFixed(dp));
}

// ── 분수 오답 ──
function fractionDistractors(num: number, den: number, suffix: string): string[] {
  const correct = `${num}/${den}${suffix}`;
  const pool = new Set<string>();

  for (const d of [1, -1, 2, -2]) {
    const nn = num + d;
    if (nn !== 0) pool.add(`${nn}/${den}${suffix}`);
  }
  for (const d of [1, -1, 2]) {
    const nd = den + d;
    if (nd > 0 && nd !== den) pool.add(`${num}/${nd}${suffix}`);
  }
  if (suffix) {
    pool.add(`1/${den}${suffix}`);
    pool.add(suffix.trim());
  }

  pool.delete(correct);
  return pickN(Array.from(pool), 4, (i) => `${num + i + 3}/${den}${suffix}`);
}

// ── ㄱ,ㄴ,ㄷ 조합 오답 ──
function consonantComboDistractors(answer: string): string[] {
  const all = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ'];
  const selected = answer.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean);
  const key = selected.slice().sort().join(',');
  const pool = new Set<string>();

  for (let trial = 0; trial < 40 && pool.size < 6; trial++) {
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const combo = shuffled.slice(0, selected.length).sort();
    const str = combo.join(', ');
    if (combo.sort().join(',') !== key) {
      pool.add(str);
    }
  }

  return pickN(Array.from(pool), 4, () => all.slice(0, selected.length).join(', '));
}

// ── 사분면 오답 ──
function quadrantDistractors(answer: string): string[] {
  const quads = ['제1사분면', '제2사분면', '제3사분면', '제4사분면'];
  const selected = quads.filter(q => answer.includes(q));
  const key = selected.join(',');
  const pool = new Set<string>();

  // 비트마스크로 모든 조합 생성
  for (let mask = 1; mask < 16; mask++) {
    const combo: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (mask & (1 << i)) combo.push(quads[i]);
    }
    const str = combo.join(', ');
    if (combo.join(',') !== key && combo.length >= 1 && combo.length <= selected.length + 1) {
      pool.add(str);
    }
  }

  return pickN(Array.from(pool), 4, () => '제4사분면');
}

// ── ①②③ 원문자 조합 오답 ──
function circledNumDistractors(answer: string): string[] {
  const all = ['①', '②', '③', '④', '⑤'];
  const selected = all.filter(c => answer.includes(c));
  const key = selected.join(',');
  const pool = new Set<string>();

  for (let trial = 0; trial < 40 && pool.size < 6; trial++) {
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const combo = shuffled.slice(0, selected.length).sort();
    const str = combo.join(', ');
    if (combo.join(',') !== key) {
      pool.add(str);
    }
  }

  return pickN(Array.from(pool), 4, () => all[0]);
}

// ── 부등식 오답 ──
function inequalityDistractors(answer: string): string[] {
  const pool = new Set<string>();

  // 숫자 부분 변형
  const numbers = answer.match(/-?\d+(\.\d+)?/g);
  if (numbers) {
    for (const numStr of numbers) {
      const num = parseFloat(numStr);
      for (const d of [1, -1, 2, -2]) {
        pool.add(answer.replace(numStr, String(num + d)));
      }
    }
  }

  // 부등호 방향 변경
  if (answer.includes('<')) pool.add(answer.replace(/</, '>'));
  if (answer.includes('>')) pool.add(answer.replace(/>/, '<'));
  if (answer.includes('또는')) pool.add(answer.replace('또는', '그리고'));
  if (answer.includes('그리고')) pool.add(answer.replace('그리고', '또는'));

  pool.delete(answer);
  return pickN(Array.from(pool), 4, (i) => `${answer} (${i + 1})`);
}

// ── 숫자 포함 텍스트 오답 ──
function numericTextDistractors(answer: string): string[] {
  const pool = new Set<string>();
  const numbers = answer.match(/-?\d+(\.\d+)?/g);

  if (numbers) {
    for (const numStr of numbers) {
      const num = parseFloat(numStr);
      for (const d of [1, -1, 2, -2]) {
        pool.add(answer.replace(numStr, String(num + d)));
      }
    }
  }

  pool.delete(answer);
  return pickN(Array.from(pool), 4, (i) => `${answer}${i + 1}`);
}

// ── 최후 폴백 ──
function fallbackDistractors(answer: string): string[] {
  // 텍스트 앞뒤에 변형 추가
  return [
    answer + ' (오답1)',
    answer + ' (오답2)',
    answer + ' (오답3)',
    answer + ' (오답4)',
  ];
}

// ── 유틸: 배열에서 N개 선택, 부족하면 fallback으로 채움 ──
function pickN(pool: string[], n: number, fallback: (i: number) => string): string[] {
  const result: string[] = [];
  const used = new Set<string>();

  for (const item of pool) {
    if (!used.has(item) && result.length < n) {
      result.push(item);
      used.add(item);
    }
  }

  let i = 0;
  while (result.length < n) {
    const fb = fallback(i++);
    if (!used.has(fb)) {
      result.push(fb);
      used.add(fb);
    }
  }

  return result;
}
