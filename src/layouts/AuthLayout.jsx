
export default function AuthLayout({ hero, form }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-100 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-[-80px] right-[-60px] w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-40px] w-80 h-80 rounded-full bg-teal-100/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-lime-100/40 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl shadow-emerald-200/50 border border-white/80 h-[90vh] max-h-[720px]">
        {hero}
        {form}
      </div>
    </div>
  );
}
