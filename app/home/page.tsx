'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const images = [
  '/welcome1.png',
  '/welcome2.png',
  '/welcome3.png',
]; // Place these in your `public/` folder

export default function WelcomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Slide every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-auto min-h-screen bg-gradient-to-br from-blue-100 to-white text-right rounded-xl">
      
      {/* Text Section */}
      <div className="flex flex-col justify-center items-end w-full md:w-1/2 p-6 md:p-10 space-y-6 text-center md:text-right">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-800">
          مرحبا بكم في نظام الرواتب
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-md mx-auto md:mx-0">
          يمكنك من خلال هذا النظام الاطلاع على راتبك الشهري، الترقيات، والتقارير الخاصة بك بسهولة وسرعة.
        </p>
        <Link
          href="/pricing"
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
        >
          الدخول إلى النظام
        </Link>
      </div>

      {/* Image Slider Section */}
      <div className="relative w-full md:w-1/2 flex rounded-lg justify-center items-center p-6 md:p-10 overflow-hidden h-64 sm:h-80 md:h-auto round-md">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`صورة ${index + 1}`}
            width={600}
            height={400}
            className={`absolute round-xl shadow-xl rounded-lg transition-all duration-1000 ease-in-out transform
              ${index === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`}
            style={{ objectFit: 'cover' }}
            priority={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
}
