import React, { useEffect } from "react";

export default function PageLoader({
  children,
  isLoading = true,
}) {
  useEffect(() => {
    if (!isLoading) return;

    // Lock background scrolling while loader is visible
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLoading]);

  // When loading is finished, show the actual content
  if (!isLoading) {
    return children || null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#F8F9FA] dark:bg-[#111827]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center">

        {/* LUMA Loader */}
        <div className="relative flex h-28 w-28 items-center justify-center">

          {/* Outer Circle */}
          <div className="absolute inset-0 rounded-full border-[3px] border-[#E89A5B]/20" />

          {/* Animated Circle */}
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#E89A5B] border-r-[#E89A5B]" />

          {/* LUMA Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md dark:bg-[#1F2937]">
            <span className="text-xl font-black tracking-[0.25em] text-[#17233C] dark:text-white">
              LUMA
            </span>
          </div>

        </div>

        {/* Loading Dots */}
        <div className="mt-6 flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E89A5B]" />

          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E89A5B] [animation-delay:150ms]" />

          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E89A5B] [animation-delay:300ms]" />
        </div>

      </div>
    </div>
  );
}