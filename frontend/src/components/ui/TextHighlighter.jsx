// TextHighlighter.jsx
import React from "react";

const TextHighlighter = ({ text = "", search = "" }) => {
  if (!search.trim() || !text) return <span>{text}</span>;

  // Special characters ko escape karne ke liye taaki Regex crash na ho
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 'gi' flag use kiya hai: g (global) aur i (case-insensitive)
  const parts = String(text).split(new RegExp(`(${escapedSearch})`, "gi"));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 text-black rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export default TextHighlighter;