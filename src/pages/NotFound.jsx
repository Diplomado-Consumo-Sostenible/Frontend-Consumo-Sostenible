import { House } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../Components/button"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center mt-50">
      <h1 className="text-stone-800 text-5xl mb-2">404 - Página no encontrada</h1>
      <p className="text-stone-400">La página que estás buscando no existe o fue movida.</p>

      <div className="mt-6">
        <Button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 cursor-pointer">
          <House size={18} />
          Volver a inicio
        </Button>
      </div>
    </div>
  )
}
