

import UserManagement from "../../Components/UserManagement";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                        Panel de Administración
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Gestiona usuarios y configura el sistema
                    </p>
                </div>

                <div className="space-y-8">
                    <UserManagement />
                </div>
            </div>
        </div>
    );
}