import { SupportedLanguage } from '../types';

export interface Token {
  text: string;
  type:
    | 'keyword'
    | 'string'
    | 'number'
    | 'comment'
    | 'tag'
    | 'attribute'
    | 'punctuation'
    | 'operator'
    | 'function'
    | 'variable'
    | 'plain';
}

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
  'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
  'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
  'let', 'static', 'enum', 'await', 'async', 'interface', 'type', 'from',
  'as', 'true', 'false', 'null', 'undefined'
]);

const PYTHON_KEYWORDS = new Set([
  'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise',
  'return', 'True', 'try', 'while', 'with', 'yield', 'print', 'self'
]);

const CSS_PROPERTIES = new Set([
  'margin', 'padding', 'background', 'color', 'font-size', 'font-family',
  'display', 'position', 'width', 'height', 'top', 'left', 'right', 'bottom',
  'flex', 'grid', 'border', 'border-radius', 'box-shadow', 'opacity',
  'transform', 'transition', 'animation', 'z-index', 'overflow'
]);

export function highlightLine(line: string, language: SupportedLanguage): Token[] {
  if (!line) {
    return [{ text: '', type: 'plain' }];
  }

  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1. Comments
    if (language === 'html' && line.slice(i, i + 4) === '<!--') {
      const end = line.indexOf('-->', i + 4);
      const text = end === -1 ? line.slice(i) : line.slice(i, end + 3);
      tokens.push({ text, type: 'comment' });
      i += text.length;
      continue;
    }

    if ((language === 'javascript' || language === 'typescript' || language === 'css') && line.slice(i, i + 2) === '//') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    if (language === 'python' && line[i] === '#') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    if (line.slice(i, i + 2) === '/*') {
      const end = line.indexOf('*/', i + 2);
      const text = end === -1 ? line.slice(i) : line.slice(i, end + 2);
      tokens.push({ text, type: 'comment' });
      i += text.length;
      continue;
    }

    // 2. Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < len && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      if (j < len) j++; // Include closing quote
      tokens.push({ text: line.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    // 3. HTML Tags & Attributes
    if (language === 'html') {
      if (line[i] === '<') {
        let j = i + 1;
        if (line[j] === '/') j++;
        while (j < len && /[a-zA-Z0-9-]/.test(line[j])) j++;
        tokens.push({ text: line.slice(i, j), type: 'tag' });
        i = j;
        continue;
      }
      if (line[i] === '>') {
        tokens.push({ text: '>', type: 'tag' });
        i++;
        continue;
      }
    }

    // 4. Numbers
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < len && /[0-9.xXa-fA-Fpxrem%]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // 5. Words / Identifiers / Keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$-]/.test(line[j])) j++;
      const word = line.slice(i, j);

      let type: Token['type'] = 'plain';
      if (language === 'python') {
        if (PYTHON_KEYWORDS.has(word)) type = 'keyword';
        else if (line[j] === '(') type = 'function';
        else type = 'variable';
      } else if (language === 'css') {
        if (CSS_PROPERTIES.has(word)) type = 'attribute';
        else type = 'plain';
      } else {
        if (JS_KEYWORDS.has(word)) type = 'keyword';
        else if (line[j] === '(') type = 'function';
        else type = 'variable';
      }

      tokens.push({ text: word, type });
      i = j;
      continue;
    }

    // 6. Operators & Punctuation
    if (/[{}()[\].,;:+\-*/%=<>!&|^~?]/.test(line[i])) {
      tokens.push({ text: line[i], type: 'punctuation' });
      i++;
      continue;
    }

    // 7. Whitespace / Other
    let j = i;
    while (j < len && !/[a-zA-Z0-9_$'"`<>{}[\]().,;:+\-*/%=!&|^~?#\\]/.test(line[j])) j++;
    tokens.push({ text: line.slice(i, j), type: 'plain' });
    i = j;
  }

  return tokens;
}

export function getTokenClass(type: Token['type']): string {
  switch (type) {
    case 'keyword':
      return 'text-purple-400 font-medium';
    case 'string':
      return 'text-emerald-300';
    case 'number':
      return 'text-amber-300';
    case 'comment':
      return 'text-slate-500 italic';
    case 'tag':
      return 'text-rose-400 font-medium';
    case 'attribute':
      return 'text-sky-300';
    case 'function':
      return 'text-blue-400';
    case 'punctuation':
      return 'text-slate-400';
    case 'variable':
      return 'text-slate-200';
    default:
      return 'text-slate-300';
  }
}
