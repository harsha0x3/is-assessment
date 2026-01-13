export function ISLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M256 48c46.5 34.1 98.9 49.6 160 54.7v173.6c0 46.1-18.3 89.8-51 122.4-32.7 32.6-76.5 53.8-129 63.8-52.5-10-96.3-31.2-129-63.8-32.7-32.6-51-76.3-51-122.4V102.7C157.1 97.6 209.5 82.1 256 48z"
        fill="#0C5E46"
      />
      <rect x="156" y="152" width="200" height="190" rx="16" fill="#0F5B46" />
      <circle
        cx="256"
        cy="290"
        r="40"
        fill="none"
        stroke="#9CB7A7"
        strokeWidth="10"
      />
      <path
        d="M238 290l14 14 26-28"
        fill="none"
        stroke="#9CB7A7"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
