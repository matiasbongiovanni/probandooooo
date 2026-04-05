import { ImportDropzone } from "@/components/finance/ImportDropzone"
import { FileText, Info } from "lucide-react"

export default function ImportPage() {
  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Importar desde BNA+</h1>
        <p className="text-sm text-slate-400 mt-1">
          Banco Nación Argentina no tiene API pública. Exportá el historial desde el home banking y subilo acá.
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Info className="h-4 w-4 text-indigo-400" />
          Cómo exportar desde BNA+
        </div>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside ml-1">
          <li>Ingresá a <strong className="text-slate-300">bna45.com.ar</strong> con tu usuario y contraseña</li>
          <li>Andá a <strong className="text-slate-300">Cuentas → Movimientos</strong></li>
          <li>Seleccioná el rango de fechas deseado</li>
          <li>Hacé click en <strong className="text-slate-300">Exportar → CSV</strong></li>
          <li>Subí el archivo descargado acá abajo</li>
        </ol>
      </div>

      {/* Dropzone */}
      <ImportDropzone />

      {/* Format info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
          <FileText className="h-3.5 w-3.5" />
          Formato CSV esperado
        </div>
        <pre className="text-xs text-slate-500 font-mono bg-slate-800 rounded p-3 overflow-x-auto">
{`Fecha;Descripcion;Debito;Credito
01/01/2025;Transferencia recibida;0;150000
02/01/2025;Compra supermercado;5000;0`}
        </pre>
        <p className="text-xs text-slate-500 mt-2">
          También se detecta automáticamente el formato de una sola columna de monto (negativo = egreso).
        </p>
      </div>
    </div>
  )
}
