import React from 'react';

export default function SurroundingCharacters() {
  return (
    <>
      {/* ================= DESKTOP FULL-BLEED CORNERS (lg+) ================= */}
      <div className="hidden lg:block pointer-events-none select-none">
        {/* 1. TOP-LEFT: Green Character with Cream Sweatshirt - Fixed at left edge */}
        <div className="absolute top-12 lg:top-16 xl:top-20 left-0 z-10 w-[260px] lg:w-[310px] xl:w-[370px]">
          <img
            src="/char-green.png"
            alt="Green Blob with cream sweater on hanger"
            className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
            draggable="false"
          />
        </div>

        {/* 2. BOTTOM-LEFT: Yellow Character with White Sneakers - Fixed at bottom-left */}
        <div className="absolute bottom-0 left-0 z-10 w-[280px] lg:w-[330px] xl:w-[400px]">
          <img
            src="/char-yellow.png"
            alt="Yellow Blob with white sneakers"
            className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
            draggable="false"
          />
        </div>

        {/* 3. TOP-RIGHT: Blue Character with Sunglasses & Cap - Fixed at right edge */}
        <div className="absolute top-12 lg:top-16 xl:top-20 right-0 z-10 w-[260px] lg:w-[310px] xl:w-[370px]">
          <img
            src="/char-blue.png"
            alt="Blue Blob with cool sunglasses and green baseball cap"
            className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
            draggable="false"
          />
        </div>

        {/* 4. BOTTOM-RIGHT: Pink Character with Black Trousers - Fixed at bottom-right */}
        <div className="absolute bottom-0 right-0 z-10 w-[270px] lg:w-[320px] xl:w-[390px]">
          <img
            src="/char-pink.png"
            alt="Pink Blob holding black trousers"
            className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
            draggable="false"
          />
        </div>
      </div>

      {/* ================= MOBILE CORNERS (< lg) - 100% IDENTICAL TO REFERENCE ================= */}
      <div className="lg:hidden pointer-events-none select-none">
        {/* 1. TOP-LEFT: Green Character with Cream Sweatshirt & Action Lines */}
        <div className="absolute top-0 sm:top-4 left-0 z-10 w-[145px] xs:w-[170px] sm:w-[200px]">
          <img
            src="/mobile-char-green.png"
            alt="Green Mascot with sweater"
            className="w-full h-auto object-contain"
            draggable="false"
          />
        </div>

        {/* 2. TOP-RIGHT: Blue Character with Sunglasses, Cap & Action Lines */}
        <div className="absolute top-0 sm:top-4 right-0 z-10 w-[140px] xs:w-[165px] sm:w-[195px]">
          <img
            src="/mobile-char-blue.png"
            alt="Blue Mascot with sunglasses and cap"
            className="w-full h-auto object-contain"
            draggable="false"
          />
        </div>

        {/* 3. BOTTOM-LEFT: Yellow Character with White Sneakers & Action Lines */}
        <div className="absolute bottom-0 left-0 z-10 w-[170px] xs:w-[200px] sm:w-[240px]">
          <img
            src="/mobile-char-yellow.png"
            alt="Yellow Mascot with white sneakers"
            className="w-full h-auto object-contain"
            draggable="false"
          />
        </div>

        {/* 4. BOTTOM-RIGHT: Pink Character with Black Trousers & Action Lines */}
        <div className="absolute bottom-0 right-0 z-10 w-[160px] xs:w-[190px] sm:w-[230px]">
          <img
            src="/mobile-char-pink.png"
            alt="Pink Mascot with trousers"
            className="w-full h-auto object-contain"
            draggable="false"
          />
        </div>
      </div>
    </>
  );
}
