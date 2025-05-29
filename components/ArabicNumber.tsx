// components/ArabicNumber.tsx
import { toArabicIndicNumber } from '@/utils/convertToArabicNumbers';
export default function ArabicNumber({ value }: { value: number | string }) {
    return <>{toArabicIndicNumber(value)}</>;
  }
  