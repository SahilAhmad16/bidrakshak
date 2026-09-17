import zlib from 'zlib';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // 1. Try pdf-parse
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await parser.getText();
    await parser.destroy();

    if (result && typeof result.text === 'string' && result.text.trim().length > 20) {
      return cleanExtractedText(result.text);
    }
  } catch (err) {
    console.warn('[PDF Extractor] pdf-parse runtime notice, utilizing stream extractor:', (err as any)?.message || err);
  }

  // 2. Resilient Stream Parser (handles plain text, parentheses text, and FlateDecode compressed streams)
  try {
    let extracted = '';
    const bufferStr = buffer.toString('binary');
    
    // Look for streams: stream ... endstream
    const streamMatches = bufferStr.matchAll(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
    for (const match of streamMatches) {
      let content = match[1];

      // Try zlib decompression if stream is Flate compressed
      try {
        const decompressed = zlib.inflateSync(Buffer.from(content, 'binary'));
        content = decompressed.toString('latin1');
      } catch {
        // Stream may not be compressed, use raw content
      }

      // Extract PDF text blocks BT ... ET and Tj / TJ operators
      const tjMatches = content.matchAll(/\(([^()]*)\)\s*Tj/g);
      for (const tj of tjMatches) {
        extracted += tj[1] + ' ';
      }

      // Extract array operators: [(text) 10 (text)] TJ
      const arrayMatches = content.matchAll(/\[(.*?)\]\s*TJ/g);
      for (const arr of arrayMatches) {
        const innerTexts = arr[1].matchAll(/\(([^()]*)\)/g);
        for (const it of innerTexts) {
          extracted += it[1] + ' ';
        }
      }
    }

    if (extracted.trim().length > 15) {
      return cleanExtractedText(extracted);
    }
  } catch (fallbackErr) {
    console.error('[PDF Extractor] Stream fallback exception:', fallbackErr);
  }

  return '';
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/-- \d+ of \d+ --/g, '') // remove page markers
    .replace(/\\([()\\])/g, '$1') // unescape \( \) \\
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
