import React from 'react'

export const ProductSkeleton: React.FC = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-4xl border border-marron/10 bg-cream p-3 shadow-soft" aria-hidden="true">
    <div className="skeleton aspect-[4/5] rounded-3xl" />
    <div className="flex flex-1 flex-col px-3 pb-4 pt-6">
      <div className="skeleton mb-2 h-3 w-20 rounded-full" />
      <div className="skeleton h-5 w-3/4 rounded-full" />
      <div className="skeleton mt-2 h-3 w-full rounded-full" />
      <div className="skeleton mt-1.5 h-3 w-2/3 rounded-full" />
      <div className="mt-auto flex items-center justify-between border-t border-marron/10 pt-4">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-9 w-9 rounded-full" />
      </div>
    </div>
  </div>
)
