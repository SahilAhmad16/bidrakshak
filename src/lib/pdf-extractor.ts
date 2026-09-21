import zlib from 'zlib';

/**
 * Clean and normalize extracted text from PDF documents
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/-- \d+ of \d+ --/g, '') // remove page markers
    .replace(/\\([()\\])/g, '$1') // unescape \( \) \\
    .replace(/\\r/g, ' ')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Decode hexadecimal PDF strings (<48656c6c6f> or <00480065006c006c006f>)
 */
function decodePdfHex(hex: string): string {
  const clean = hex.replace(/[\s\r\n]+/g, '');
  if (!clean || clean.length < 2) return '';

  // Check UTF-16BE (starts with 00 or FEFF)
  if (clean.length >= 4 && (clean.startsWith('00') || clean.toUpperCase().startsWith('FEFF'))) {
    let utf16 = '';
    const startIdx = clean.toUpperCase().startsWith('FEFF') ? 4 : 0;
    for (let i = startIdx; i < clean.length; i += 4) {
      if (i + 4 <= clean.length) {
        const code = parseInt(clean.substring(i, i + 4), 16);
        if (code >= 32 && code <= 126) {
          utf16 += String.fromCharCode(code);
        } else if (code === 10 || code === 13) {
          utf16 += '\n';
        } else if (code === 32) {
          utf16 += ' ';
        }
      }
    }
    if (utf16.trim().length > 2) return utf16;
  }

  // Standard ASCII/Latin1 hex
  let ascii = '';
  for (let i = 0; i < clean.length; i += 2) {
    const code = parseInt(clean.substring(i, i + 2), 16);
    if (code >= 32 && code <= 126) {
      ascii += String.fromCharCode(code);
    } else if (code === 10 || code === 13) {
      ascii += '\n';
    } else if (code === 9) {
      ascii += ' ';
    }
  }
  return ascii;
}

/**
 * Extract text tokens from a decompressed or uncompressed PDF stream string
 */
function extractTextFromStreamContent(streamStr: string): string {
  let extracted = '';

  // 1. Array text operator: [ (str) 10 <hex> ] TJ
  const arrayMatches = streamStr.matchAll(/\[([\s\S]*?)\]\s*TJ/g);
  for (const arr of arrayMatches) {
    const inner = arr[1];

    // Hex strings inside TJ
    const hexInside = inner.matchAll(/<([0-9a-fA-F\s\r\n]+)>/g);
    for (const h of hexInside) {
      const decoded = decodePdfHex(h[1]);
      if (decoded) extracted += decoded;
    }

    // Literal strings inside TJ
    const strInside = inner.matchAll(/\(([^()]*?(?:\\.[^()]*?)*)\)/g);
    for (const s of strInside) {
      extracted += s[1] + ' ';
    }

    extracted += ' ';
  }

  // 2. Direct literal string operator: (text) Tj
  const tjMatches = streamStr.matchAll(/\(([^()]*?(?:\\.[^()]*?)*)\)\s*Tj/g);
  for (const tj of tjMatches) {
    extracted += tj[1] + ' ';
  }

  // 3. Direct hex string operator: <hex> Tj
  const hexTjMatches = streamStr.matchAll(/<([0-9a-fA-F\s\r\n]+)>\s*Tj/g);
  for (const ht of hexTjMatches) {
    const decoded = decodePdfHex(ht[1]);
    if (decoded) extracted += decoded + ' ';
  }

  // 4. Single quote operator (move next line and show text): (text) '
  const singleQuoteMatches = streamStr.matchAll(/\(([^()]*?(?:\\.[^()]*?)*)\)\s*'/g);
  for (const sq of singleQuoteMatches) {
    extracted += sq[1] + '\n';
  }

  return extracted;
}

/**
 * Master PDF text extractor supporting:
 * 1. Native pdf-parse (both class-based and functional CJS/ESM interop)
 * 2. In-depth binary stream extraction (FlateDecode compressed + plain text streams)
 * 3. Hexadecimal and literal text decoding inside TJ / Tj operators
 * 4. PDF metadata and ASCII stream recovery fallback
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) return '';

  // Tier 1: Try pdf-parse (handles standard and modern PDF structures)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require('pdf-parse');
    const ParserClass = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse;

    if (typeof ParserClass === 'function') {
      const parser = new ParserClass({ data: buffer, verbosity: 0 });
      const result = await parser.getText();
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      if (result && typeof result.text === 'string' && result.text.trim().length > 20) {
        return cleanExtractedText(result.text);
      }
    }

    const parseFn = typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule.default;
    if (typeof parseFn === 'function') {
      const result = await parseFn(buffer);
      if (result && typeof result.text === 'string' && result.text.trim().length > 20) {
        return cleanExtractedText(result.text);
      }
    }
  } catch (err) {
    console.warn('[PDF Extractor] pdf-parse skipped/errored, falling back to deep stream parser:', (err as any)?.message || err);
  }

  // Tier 2: Deep Binary Stream Scanner (finds all uncompressed and Flate-compressed streams)
  try {
    let accumulatedText = '';
    let offset = 0;

    while (offset < buffer.length) {
      const streamIdx = buffer.indexOf('stream', offset);
      if (streamIdx === -1) break;

      // Move past 'stream' keyword and newline (\r\n or \n)
      let dataStart = streamIdx + 6;
      if (buffer[dataStart] === 0x0d && buffer[dataStart + 1] === 0x0a) {
        dataStart += 2;
      } else if (buffer[dataStart] === 0x0a || buffer[dataStart] === 0x0d) {
        dataStart += 1;
      }

      // Find closing 'endstream'
      const endstreamIdx = buffer.indexOf('endstream', dataStart);
      if (endstreamIdx === -1) break;

      let dataEnd = endstreamIdx;
      if (dataEnd >= 2 && buffer[dataEnd - 2] === 0x0d && buffer[dataEnd - 1] === 0x0a) {
        dataEnd -= 2;
      } else if (dataEnd >= 1 && (buffer[dataEnd - 1] === 0x0a || buffer[dataEnd - 1] === 0x0d)) {
        dataEnd -= 1;
      }

      if (dataEnd > dataStart) {
        const streamChunk = buffer.subarray(dataStart, dataEnd);

        // Try zlib inflate if compressed
        let decompressedStr = '';
        try {
          decompressedStr = zlib.inflateSync(streamChunk).toString('latin1');
        } catch {
          try {
            decompressedStr = zlib.inflateRawSync(streamChunk).toString('latin1');
          } catch {
            // Stream was uncompressed plain text
            decompressedStr = streamChunk.toString('latin1');
          }
        }

        if (decompressedStr) {
          const streamText = extractTextFromStreamContent(decompressedStr);
          if (streamText) {
            accumulatedText += streamText + '\n';
          }
        }
      }

      offset = endstreamIdx + 9;
    }

    if (accumulatedText && accumulatedText.trim().length > 20) {
      return cleanExtractedText(accumulatedText);
    }
  } catch (streamErr) {
    console.warn('[PDF Extractor] Deep stream scan notice:', (streamErr as any)?.message || streamErr);
  }

  // Tier 3: Heuristic Printable Character Scan (for partially corrupt or raw object PDFs)
  try {
    const raw = buffer.toString('latin1');
    const directStrings = raw.matchAll(/\(([^()]{4,})\)/g);
    let rawText = '';
    for (const m of directStrings) {
      if (!m[1].startsWith('/') && !m[1].startsWith('http') && m[1].trim().length > 4) {
        rawText += m[1] + ' ';
      }
    }
    if (rawText.trim().length > 30) {
      return cleanExtractedText(rawText);
    }
  } catch {
    // Ignore fallback failure
  }

  return '';
}
