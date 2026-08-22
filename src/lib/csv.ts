/** Pure CSV construction + browser download helpers. */

export function escapeCsvField(value: unknown): string {
  return `"${String(value ?? '')}"`;
}

export function buildCsv(headers: readonly string[], rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvField).join(','))
    .join('\n');
}

export function downloadBlob(content: BlobPart, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCsv(csv: string, filename: string): void {
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

export function todayFileStamp(): string {
  return new Date().toISOString().split('T')[0];
}
