// SPDX-License-Identifier: LicenseRef-FNCL-1.1
// Copyright (c) 2026 Cpt_Kirk

export function protect(text) {
  const values = [];
  const protectedText = text.replace(/\{[a-zA-Z0-9_]+\}|%[-+0-9.]*[a-zA-Z]|https?:\/\/\S+/g, (value) => {
    const index = values.push(value) - 1;
    return `ZXQPH${index}QXZ`;
  });
  return { protectedText, values };
}

export function restore(text, values) {
  const seen = new Set();
  const restored = text.replace(/ZXQPH\s*(\d+)\s*QXZ/gi, (marker, digits) => {
    const index = Number(digits);
    if (index >= values.length || seen.has(index)) {
      throw new Error(`Unexpected or repeated placeholder marker: ${marker}`);
    }
    seen.add(index);
    return values[index];
  });
  // Validate markers before restoration: Chinese text can touch a URL without
  // whitespace, so rescanning restored URLs would include surrounding prose.
  if (seen.size !== values.length) {
    const missing = values.filter((_, index) => !seen.has(index));
    throw new Error(`Missing placeholder markers for ${JSON.stringify(missing)}`);
  }
  return restored;
}
