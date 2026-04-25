// Cuotas pluviales — datos estáticos de demo
// En producción se leerían de un contrato CuotasPluviales.sol
const DESARROLLOS = [
  {
    empresa: "Desarrollos Coyula SA",
    detalle: "Torre 18 pisos · Zapopan · 4,200 m²",
    monto: "$48,000",
    estado: "Pagado",
  },
  {
    empresa: "Inmobiliaria Ríos SA",
    detalle: "Fraccionamiento · Tlajomulco · 12 ha",
    monto: "$127,500",
    estado: "Pendiente",
  },
  {
    empresa: "GDL Urban Group",
    detalle: "Plaza comercial · GDL · 8,100 m²",
    monto: "$93,200",
    estado: "Vencido",
  },
];

const BADGE: Record<string, string> = {
  Pagado:   "badge-pagado",
  Pendiente:"badge-pendiente",
  Vencido:  "badge-vencido",
};

export default function CuotasPluviales() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">🏗️</div>
        <div>
          <div className="card-title">Cuotas pluviales</div>
          <div className="card-sub">Constructoras · impacto hídrico automático</div>
        </div>
      </div>

      <p className="cuotas-desc">
        El smart contract calcula automáticamente la capacidad pluvial añadida por cada desarrollo
        y cobra la cuota correspondiente al fideicomiso de mantenimiento.
      </p>

      <div className="cuotas-list">
        {DESARROLLOS.map((d) => (
          <div className="cuota-item" key={d.empresa}>
            <div>
              <div className="dev-name">{d.empresa}</div>
              <div className="dev-detail">{d.detalle}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="amount">{d.monto}</div>
              <span className={BADGE[d.estado]}>{d.estado}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cuotas-total">
        <span>Fondo total acumulado</span>
        <span>$268,700 MXN</span>
      </div>
    </div>
  );
}
