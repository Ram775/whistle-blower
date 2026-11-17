import React from "react";

const Footer = () => {
  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full h-10 bg-[var(--color-primary-dark)] flex items-center justify-between px-4 md:px-8 text-white transition-all duration-300">
      
      {/* Left Section: Copyright information */}
      <div
        className="flex items-center gap-2 opacity-80 whitespace-nowrap"
        style={{ fontSize: "var(--font-size-goi-small)" }}
      >
        <span className="tracking-wide">© {currentYear}</span>
        <a
          href="#"
          className="font-bold text-white hover:text-blue-300 transition-colors no-underline"
        >
          {/* Show MDL on mobile, full name on desktop */}
          <span className="sm:inline"> Mazagon Dock Shipbuilders Ltd.</span>
        </a>
        
        {/* Desktop only - separator and rights reserved text */}
        <span className="hidden md:inline opacity-50">|</span>
        <span className="hidden md:inline tracking-wide">
          All rights reserved.
        </span>
      </div>

      {/* Right Section: Navigation links and version badge */}
      <div className="flex items-center gap-4">
        
        {/* Links hidden on mobile to save space, visible on desktop */}
        <div
          className="hidden md:flex items-center gap-6"
          style={{ fontSize: "var(--font-size-goi-small)" }}
        >
          <a href="#" className="opacity-70 hover:opacity-100 no-underline">Support</a>
          <a href="#" className="opacity-70 hover:opacity-100 no-underline">Privacy</a>
        </div>

        {/* Version badge with live status indicator */}
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </div>
          <span
            className="font-medium text-white/80 uppercase tracking-tighter"
            style={{ fontSize: "9px" }}
          >
            Version 2.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;