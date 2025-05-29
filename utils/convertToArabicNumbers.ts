// utils/convertToArabicNumbers.ts
export function toArabicIndicNumber(value: number | string): string {
    return value.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
  