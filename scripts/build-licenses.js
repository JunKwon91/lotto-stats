// ============================================================================
// build-licenses.js — 오픈소스 라이선스 데이터 후처리
// ============================================================================
//
// 스캔·라이선스 판별은 license-checker-rseidelsohn(devDependency)가 한다.
// 이 스크립트는 그 결과를 받아 (1) package.json의 직접 의존성만 골라내고,
// (2) LICENSE 파일이 없어 도구가 README를 가리키는 경우만 SPDX 표준 전문으로
// 보정해, src/data/licenses.ts(TS 모듈)로 쓴다. 앱은 이 모듈을 import한다.
// JSON이 아니라 .ts로 내보내 Metro의 JSON import 상호운용 문제를 피한다.
// 의존성이 바뀌면 `npm run licenses`로 재생성한다.
// ============================================================================

const fs = require('fs');
const path = require('path');
const checker = require('license-checker-rseidelsohn');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'licenses.ts');

const pkg = require(path.join(ROOT, 'package.json'));
// 서드파티 고지에서 제외 — 자체 디자인 시스템(1st-party)과 RN 템플릿 샘플(미사용)
const EXCLUDE = new Set([
  '@junkwon91/rn-design-system',
  '@react-native/new-app-screen',
]);
const directDeps = Object.keys(pkg.dependencies || {}).filter(
  d => !EXCLUDE.has(d),
);

// licenseFile이 실제 라이선스 파일인지(README 폴백이 아닌지)
function isRealLicenseFile(file) {
  return !!file && /^licen[sc]e/i.test(path.basename(file));
}

function authorName(author) {
  if (!author) return null;
  if (typeof author === 'string')
    return author.replace(/\s*<[^>]*>.*$/, '').trim();
  return author.name || null;
}

// 첫 "Copyright ..." 라인
function extractCopyright(text) {
  const m = text.match(/^\s*Copyright\b.*$/im);
  return m ? m[0].trim() : null;
}

// LICENSE 파일이 없을 때만 쓰는 SPDX 표준 전문. 종류는 도구가 판별한 실제값.
function spdxText(type, holder) {
  const c = `Copyright (c) ${holder}`;
  if (/ISC/i.test(type)) {
    return `ISC License\n\n${c}\n\nPermission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`;
  }
  return `MIT License\n\n${c}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
}

checker.init({ start: ROOT, production: true }, (err, packages) => {
  if (err) {
    console.error('license-checker 실패:', err);
    process.exit(1);
  }

  // name@version 키를 패키지명 기준으로 정리(첫 항목 채택)
  const byName = {};
  for (const key of Object.keys(packages)) {
    const name = key.slice(0, key.lastIndexOf('@'));
    if (!byName[name])
      byName[name] = {
        version: key.slice(key.lastIndexOf('@') + 1),
        ...packages[key],
      };
  }

  const result = [];
  const warnings = [];

  for (const dep of directDeps) {
    const entry = byName[dep];
    if (!entry) {
      warnings.push(`${dep}: 스캔 결과에 없음 — 건너뜀`);
      continue;
    }
    const licenseType = String(entry.licenses);

    let licenseText;
    let fallback = false;
    if (
      isRealLicenseFile(entry.licenseFile) &&
      fs.existsSync(entry.licenseFile)
    ) {
      licenseText = fs.readFileSync(entry.licenseFile, 'utf8').trim();
    } else {
      const pj = JSON.parse(
        fs.readFileSync(path.join(entry.path, 'package.json'), 'utf8'),
      );
      licenseText = spdxText(licenseType, authorName(pj.author) || dep);
      fallback = true;
      warnings.push(
        `${dep}: 실제 LICENSE 파일 없음 — SPDX ${licenseType} 폴백`,
      );
    }

    result.push({
      name: dep,
      version: entry.version,
      licenseType,
      copyright: extractCopyright(licenseText),
      licenseText,
      fallback,
    });
  }

  result.sort((a, b) => a.name.localeCompare(b.name));

  // JSON import 상호운용 문제를 피하려고 데이터를 .ts 모듈로 생성한다.
  const file =
    '// AUTO-GENERATED by scripts/build-licenses.js (`npm run licenses`). 편집하지 마세요.\n\n' +
    'export interface LicenseEntry {\n' +
    '  name: string;\n' +
    '  version: string;\n' +
    '  licenseType: string;\n' +
    '  copyright: string | null;\n' +
    '  licenseText: string;\n' +
    '  fallback: boolean;\n' +
    '}\n\n' +
    `export const licenses: LicenseEntry[] = ${JSON.stringify(
      result,
      null,
      2,
    )};\n\n` +
    'export function findLicense(name: string): LicenseEntry | undefined {\n' +
    '  return licenses.find(l => l.name === name);\n' +
    '}\n';

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, file, 'utf8');

  console.log(
    `생성: src/data/licenses.ts (${result.length}종 / 직접 의존성 ${directDeps.length})`,
  );
  if (warnings.length) {
    console.log('\n[경고]');
    warnings.forEach(w => console.log(' -', w));
  }
});
