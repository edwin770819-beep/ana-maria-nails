import { Star } from "lucide-react";
import { cx } from "@/components/ui";
import { FormularioAccion } from "../_componentes/formulario-accion";
import { alternarFrecuente } from "./acciones";

/** Insignia "Frecuente" que, al tocarla, marca o desmarca a la clienta manualmente. */
export function BotonFrecuente({
  id,
  manual,
  porVisitas,
}: {
  id: string;
  manual: boolean;
  porVisitas: boolean;
}) {
  const frecuente = manual || porVisitas;
  return (
    <FormularioAccion accion={alternarFrecuente}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="frecuente" value={String(manual)} />
      <button
        type="submit"
        disabled={porVisitas && !manual}
        title={
          porVisitas && !manual
            ? "Es frecuente por su número de visitas"
            : manual
              ? "Quitar marca de frecuente"
              : "Marcar como frecuente (no se le pedirá anticipo)"
        }
        className={cx(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition",
          frecuente
            ? "bg-dorado-200/60 text-dorado-600 ring-dorado-200"
            : "bg-white text-humo ring-linea hover:text-dorado-600 hover:ring-dorado-200",
        )}
      >
        <Star className={cx("size-3.5", frecuente && "fill-current")} />
        {frecuente ? "Frecuente" : "Marcar frecuente"}
      </button>
    </FormularioAccion>
  );
}
