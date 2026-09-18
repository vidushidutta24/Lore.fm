import React from 'react';

export const StorySkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-72 rounded-3xl bg-slate-900/60 border border-white/5 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="w-36 h-6 rounded-full bg-slate-800" />
          <div className="w-48 h-6 rounded-full bg-slate-800" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-2/3 h-10 rounded-xl bg-slate-800" />
          <div className="w-full max-w-lg h-5 rounded-lg bg-slate-800/80" />
        </div>
        <div className="flex gap-2">
          <div className="w-28 h-8 rounded-xl bg-slate-800" />
          <div className="w-28 h-8 rounded-xl bg-slate-800" />
          <div className="w-28 h-8 rounded-xl bg-slate-800" />
        </div>
      </div>

      {/* Chapter Skeletons */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-96 rounded-3xl bg-slate-900/40 border border-white/5 p-8 flex flex-col gap-6"
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800" />
              <div className="w-40 h-4 rounded bg-slate-800" />
            </div>
            <div className="w-24 h-6 rounded-full bg-slate-800" />
          </div>
          <div className="w-1/2 h-8 rounded-lg bg-slate-800" />
          <div className="flex flex-col gap-2.5">
            <div className="w-full h-4 rounded bg-slate-800/70" />
            <div className="w-full h-4 rounded bg-slate-800/70" />
            <div className="w-4/5 h-4 rounded bg-slate-800/70" />
          </div>
          <div className="h-20 rounded-2xl bg-black/30 border border-white/5 mt-auto" />
        </div>
      ))}
    </div>
  );
};
