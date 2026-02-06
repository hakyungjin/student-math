/**
 * 부등식 등 수학 표현식 정답 비교를 위한 정규화 유틸리티.
 *
 * 처리 대상:
 *  - 공백 차이:  a>3  vs  a > 3
 *  - 기호 차이:  >=  vs  ≥,  <=  vs  ≤
 *  - 복합 부등식:  a<-3 또는 a>2
 *  - 변수·숫자 순서 뒤집기:  3<a  ↔  a>3
 *  - 일반 텍스트 답안도 공백 정규화
 */

// ── 기호 통일 맵 ──
const SYMBOL_MAP: [RegExp, string][] = [
  [/≥/g, '>='],
  [/≤/g, '<='],
  [/≠/g, '!='],
  [/＞/g, '>'],
  [/＜/g, '<'],
  [/＝/g, '='],
];

/** 부등식 패턴인지 검사 */
export function isInequalityExpression(answer: string): boolean {
  return /[<>≤≥]/.test(answer) || /[<>]=/.test(answer);
}

/**
 * 단일 부등식 토큰을 정규화.
 * "a > 3" → "a>3",  "3 < a" → "a>3" (좌변을 변수로 통일)
 */
function normalizeSingleInequality(expr: string): string {
  const trimmed = expr.trim();

  // 패턴: (좌항) (부등호) (우항)
  // 좌항/우항: 변수 또는 숫자/부호숫자
  const match = trimmed.match(
    /^([a-zA-Z가-힣]+)\s*([<>]=?|[≤≥])\s*(-?\d+(?:\.\d+)?(?:\/\d+)?)$/
  );
  if (match) {
    const [, variable, op, num] = match;
    return `${variable}${op}${num}`;
  }

  // 역순: 숫자 (부등호) 변수  →  변수 (반전 부등호) 숫자
  const reverseMatch = trimmed.match(
    /^(-?\d+(?:\.\d+)?(?:\/\d+)?)\s*([<>]=?|[≤≥])\s*([a-zA-Z가-힣]+)$/
  );
  if (reverseMatch) {
    const [, num, op, variable] = reverseMatch;
    const flipped = flipOperator(op);
    return `${variable}${flipped}${num}`;
  }

  // 범위형: 숫자 < 변수 < 숫자  (예: -3 < a < 5)
  const rangeMatch = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s*([<>]=?|[≤≥])\s*([a-zA-Z가-힣]+)\s*([<>]=?|[≤≥])\s*(-?\d+(?:\.\d+)?)$/
  );
  if (rangeMatch) {
    const [, n1, op1, variable, op2, n2] = rangeMatch;
    return `${n1}${op1}${variable}${op2}${n2}`;
  }

  // 매칭 안 되면 공백만 제거해서 반환
  return trimmed.replace(/\s+/g, '');
}

/** 부등호 뒤집기 */
function flipOperator(op: string): string {
  switch (op) {
    case '<': return '>';
    case '>': return '<';
    case '<=': case '≤': return '>=';
    case '>=': case '≥': return '<=';
    default: return op;
  }
}

/**
 * 전체 답안 문자열을 정규화.
 * "또는" / "그리고" 로 연결된 복합 부등식도 처리.
 */
export function normalizeAnswer(answer: string): string {
  let s = answer.trim();

  // 1) 유니코드 수학 기호 → ASCII
  for (const [re, replacement] of SYMBOL_MAP) {
    s = s.replace(re, replacement);
  }

  // 부등식이 아니면 공백만 정리해서 반환
  if (!isInequalityExpression(s)) {
    return s.replace(/\s+/g, ' ').trim();
  }

  // 2) "또는" / "그리고" 기준으로 분리
  const connector = s.includes('또는') ? '또는' : s.includes('그리고') ? '그리고' : null;

  if (connector) {
    const parts = s.split(connector).map(p => normalizeSingleInequality(p));
    // 파트를 정렬하여 순서 무관하게 비교 가능하도록
    parts.sort();
    return parts.join(` ${connector} `);
  }

  return normalizeSingleInequality(s);
}

/**
 * 두 답안이 수학적으로 동치인지 비교.
 * - 부등식: 정규화 후 비교
 * - 일반 텍스트: 공백·대소문자 무시 비교
 */
export function compareAnswers(studentAnswer: string, correctAnswer: string): boolean {
  const sa = (studentAnswer || '').trim();
  const ca = (correctAnswer || '').trim();

  // 빈 답
  if (!sa) return false;

  // 1) 정확히 같으면 바로 정답
  if (sa === ca) return true;

  // 2) 부등식이 포함된 경우 정규화 비교
  if (isInequalityExpression(ca) || isInequalityExpression(sa)) {
    return normalizeAnswer(sa) === normalizeAnswer(ca);
  }

  // 3) 일반 답안: 공백·대소문자 무시
  const normSa = sa.replace(/\s+/g, '').toLowerCase();
  const normCa = ca.replace(/\s+/g, '').toLowerCase();
  return normSa === normCa;
}

/**
 * 부등식을 읽기 좋게 포맷.
 * "a>3" → "a > 3",  "a<-3또는a>2" → "a < -3 또는 a > 2"
 */
export function formatForDisplay(answer: string): string {
  let s = answer.trim();

  // 유니코드 기호 → 수학 기호로 표시
  s = s.replace(/>=/g, '≥');
  s = s.replace(/<=/g, '≤');

  if (!isInequalityExpression(s)) return s;

  // 부등호 앞뒤에 공백 추가 (이미 있으면 중복 방지)
  s = s.replace(/\s*([<>≤≥])\s*/g, ' $1 ');

  // "또는" / "그리고" 앞뒤 공백 정리
  s = s.replace(/\s*(또는|그리고)\s*/g, ' $1 ');

  // 연속 공백 제거
  s = s.replace(/\s+/g, ' ').trim();

  // 음수 부호 앞 공백 보정: "> - 3" → "> -3"
  s = s.replace(/([<>≤≥])\s+(-)\s*(\d)/g, '$1 $2$3');

  return s;
}
