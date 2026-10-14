import { Encabezado } from "@/components/encabezado";
import { BarraInferior } from "@/components/barra-inferior";
import { Pie } from "@/components/pie";

export default function LayoutSitio({ children }: LayoutProps<"/">) {
  return (
    <div className="pb-barra flex min-h-full flex-1 flex-col">
      <Encabezado />
      <main className="flex-1">{children}</main>
      <Pie />
      <BarraInferior />
    </div>
  );
}
