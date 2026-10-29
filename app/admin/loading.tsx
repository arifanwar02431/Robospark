// Tampil seketika saat berpindah menu admin, sementara data dimuat dari server.
function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-gray-200/70 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-7" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <div className="flex flex-col gap-3">
        <Bar className="h-8 w-64" />
        <Bar className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Bar className="h-9 w-40" />
        <Bar className="h-9 w-48" />
        <Bar className="h-9 w-36" />
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-gray-200/80">
        <Bar className="h-5 w-48" />
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Bar className="h-4 w-40" />
              <Bar className="h-4 flex-1" />
              <Bar className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
