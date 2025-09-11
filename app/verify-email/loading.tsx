export default function VerifyEmailLoading() {
  return (
    <main
      className="flex h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground"
      role="status"
      aria-label="Loading..."
    >
      <svg
        className="h-8 w-8 animate-spin text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm">Verifying your email…</p>
    </main>
  )
}
