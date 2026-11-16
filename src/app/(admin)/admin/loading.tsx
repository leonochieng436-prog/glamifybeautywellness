export default function AdminLoading() {
  return (
    <div aria-label="Loading admin page" className="space-y-5 animate-pulse">
      <div className="h-9 w-56 bg-slate-200" />
      <div className="h-14 w-full bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 border border-line bg-white" />)}
      </div>
      <div className="h-72 border border-line bg-white" />
    </div>
  );
}
