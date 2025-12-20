import React from "react";

interface SofiaLogoProps {
  className?: string;
}

export const SofiaLogo: React.FC<SofiaLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        className="text-emerald-400"
      />
      <path
        d="M8 12L10.5 14.5L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-400"
      />
    </svg>
  );
};
