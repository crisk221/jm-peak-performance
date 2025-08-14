export default function MountainBg() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-200"
    >
      <div
        className="absolute inset-0 opacity-60 blur-xl"
        style={{
          backgroundImage:
            "url('/brand/mountain-bg.jpg'), radial-gradient(1000px 400px at 10% 90%, #e5e7eb 40%, transparent), radial-gradient(900px 300px at 90% 80%, #d1d5db 40%, transparent)",
          backgroundSize: "cover, auto, auto",
          backgroundPosition: "center",
        }}
      />
      <svg
        className="absolute bottom-[-20%] left-0 w-[140%] h-[70%] opacity-50"
        viewBox="0 0 1000 300"
      >
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L200,120 L320,170 L480,90 L650,150 L800,110 L1000,200 L1000,300 L0,300 Z"
          fill="url(#g)"
        />
        <path
          d="M0,220 L180,150 L300,190 L470,130 L640,180 L820,140 L1000,220 L1000,300 L0,300 Z"
          fill="#eee"
          opacity=".7"
        />
      </svg>
    </div>
  );
}
