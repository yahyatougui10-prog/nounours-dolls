import React from 'react'

export interface EmptyBagProps {
  size?: number
  className?: string
}

/** A small illustrated empty bag — used in both the drawer and the cart page. */
export const EmptyBag: React.FC<EmptyBagProps> = ({ size = 132, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    role="img"
    aria-label="An empty boutique bag waiting for a little friend"
    className={className}
  >
    <circle cx="80" cy="84" r="58" fill="#F7F0E7" />
    <circle cx="30" cy="40" r="5" fill="#22C7D6" opacity="0.65" />
    <circle cx="132" cy="34" r="3" fill="#C62828" opacity="0.55" />
    <path d="M54 74l8-18h36l8 18" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
    <path d="M46 72h68l7 56a8 8 0 0 1-8 9H47a8 8 0 0 1-8-9l7-56Z" fill="#FFFDF9" stroke="#795548" strokeWidth="4" />
    <circle cx="66" cy="61" r="13" fill="#795548" />
    <circle cx="94" cy="61" r="13" fill="#795548" />
    <circle cx="66" cy="61" r="5.5" fill="#22C7D6" />
    <circle cx="94" cy="61" r="5.5" fill="#22C7D6" />
    <ellipse cx="80" cy="78" rx="20" ry="17" fill="#795548" />
    <ellipse cx="80" cy="86" rx="10" ry="7" fill="#F3ECE5" />
    <circle cx="73" cy="76" r="2" fill="#3D2F2F" />
    <circle cx="87" cy="76" r="2" fill="#3D2F2F" />
    <path d="M77 82c2-2 4-2 6 0" stroke="#C62828" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M80 86c0 3-3 5-5 3M80 86c0 3 3 5 5 3" stroke="#795548" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
