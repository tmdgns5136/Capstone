export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm animate-[float1_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-[10%] -left-16 w-52 h-52 sm:w-72 sm:h-72 rounded-3xl bg-teal-300/15 border border-teal-200/25 backdrop-blur-sm rotate-12 animate-[float2_22s_ease-in-out_infinite]" />
      <div className="absolute top-[35%] left-[8%] w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-cyan-300/15 border border-cyan-200/20 backdrop-blur-sm animate-[float3_15s_ease-in-out_infinite]" />
      <div className="absolute top-[18%] left-[22%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/20 animate-[float1_12s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-[20%] right-[12%] w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-primary/20 animate-[float3_20s_ease-in-out_infinite]" />
      <div className="absolute top-[8%] left-[55%] w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-teal-200/10 border border-teal-200/20 backdrop-blur-sm -rotate-6 animate-[float2_16s_ease-in-out_infinite_reverse]" />
    </div>
  );
}
