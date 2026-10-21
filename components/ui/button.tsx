export function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-[#ffd75f] px-4 py-2 font-bold text-[#0b0d11] transition ${className}`}
    >
      {children}
    </button>
  )
}
