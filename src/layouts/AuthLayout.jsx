
export default function AuthLayout({ hero, form }) {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-warm border border-edge md:h-[90vh] md:max-h-[720px]">
        {hero}
        {form}
      </div>
    </div>
  );
}
