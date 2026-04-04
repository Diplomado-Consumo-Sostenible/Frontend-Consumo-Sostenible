

export default function Dashboard() {
    return (
        <div className="flex-1 bg-white/80 backdrop-blur-xl flex flex-col justify-center items-center px-10 py-10">
            <h1 className="text-stone-800 text-3xl font-semibold" style={{ fontFamily: "'Georgia', serif" }}>
                Bienvenido a tu Dashboard
            </h1>
            <p className="text-stone-400 text-sm mt-2">Aquí podrás gestionar tu cuenta y acceder a tus datos.</p>
        </div>
    );
}