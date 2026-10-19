import { prisma } from "@/lib/db";
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import TrackOrderForm from "@/components/TrackOrderForm";

export const dynamic = "force-dynamic";

const STEPS = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED"];

export default async function SuiviPage({
  searchParams,
}: {
  searchParams: { ref?: string; email?: string };
}) {
  let order = null;
  let notFoundMsg = false;

  if (searchParams.ref && searchParams.email) {
    order = await prisma.order.findFirst({
      where: { reference: searchParams.ref.toUpperCase(), email: searchParams.email },
      include: { items: { include: { product: true } } },
    });
    if (!order) notFoundMsg = true;
  }

  const currentStep = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase">Suivi de commande</h1>
      <p className="mt-2 text-neutral-500">
        Entrez votre référence (ex. FB-XXXX) et l&apos;email utilisé lors de la commande.
      </p>

      <TrackOrderForm />

      {notFoundMsg && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Aucune commande trouvée avec ces informations. Vérifiez la référence et l&apos;email.
        </p>
      )}

      {order && (
        <div className="card mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-xl font-black">{order.reference}</p>
              <p className="text-sm text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {formatPrice(order.total)}
              </p>
            </div>
            <span className={`rounded-full px-4 py-1 text-sm font-bold ${STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          {["PREPARING", "SHIPPED", "DELIVERED"].includes(order.status) && (
            <div className="mt-8 flex items-center">
              {STEPS.slice(1).map((step, idx) => {
                const stepIndex = idx + 1;
                const done = stepIndex <= currentStep;
                return (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-brand-accent text-white" : "bg-neutral-200 text-neutral-400"}`}>
                        {done ? "✓" : stepIndex}
                      </div>
                      <span className="mt-1 hidden text-xs font-semibold sm:block">
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                    {stepIndex < STEPS.length - 1 && (
                      <div className={`mx-1 h-1 flex-1 rounded ${stepIndex < currentStep ? "bg-brand-accent" : "bg-neutral-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {order.shippingRef && (
            <p className="mt-6 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
              📦 Numéro de suivi : <span className="font-bold">{order.shippingRef}</span>
            </p>
          )}

          <ul className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.quantity}× {i.product.name} ({i.size}, {i.color})</span>
                <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
