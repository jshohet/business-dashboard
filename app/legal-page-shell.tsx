type LegalPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <section className="bg-linear-to-br from-amber-50 via-orange-50 to-rose-100 px-6 py-14 text-slate-900">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-orange-200/70 bg-white/90 p-8 shadow-xl backdrop-blur md:p-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Legal
          </p>
          <h1 className="text-4xl font-black leading-tight text-slate-900">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-700">
            {description}
          </p>
        </header>

        <div className="mt-8 space-y-6 leading-7 text-slate-700">
          {children}
        </div>
      </div>
    </section>
  );
}
