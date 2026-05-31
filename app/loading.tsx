export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0e1628]">
      {/* Outer decorative ring */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Slow rotating ring — gold */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#c9a84c',
            borderRightColor: 'rgba(201,168,76,0.3)',
            animation: 'spin 1.4s linear infinite',
          }}
        />
        {/* Fast counter-rotating ring — navy */}
        <div
          className="absolute inset-3 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: '#1a2744',
            borderLeftColor: 'rgba(26,39,68,0.3)',
            animation: 'spin 0.9s linear infinite reverse',
          }}
        />
        {/* Center diamond */}
        <div
          className="h-3 w-3 rotate-45 bg-[#c9a84c]"
          style={{ animation: 'pulse-gold 1.4s ease-in-out infinite' }}
        />
      </div>

      {/* Brand name */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <p
          className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#c9a84c]"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        >
          SVI Infra Solutions
        </p>
        <p className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-600">
          Loading…
        </p>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/40"
            style={{ animation: `pulse-gold 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
