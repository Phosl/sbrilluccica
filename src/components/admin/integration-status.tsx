import { CircleAlert, CircleCheck, FlaskConical } from "lucide-react";

import type { AdminIntegration } from "./contracts";

const presentation = {
  ready: {
    Icon: CircleCheck,
    label: "Collegato",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  mock: {
    Icon: FlaskConical,
    label: "Demo",
    pill: "bg-fuchsia-50 text-[#a72d60] ring-[#a72d60]/20",
  },
  attention: {
    Icon: CircleAlert,
    label: "Da configurare",
    pill: "bg-amber-50 text-amber-800 ring-amber-700/20",
  },
};

export function IntegrationStatus({ integration }: { integration: AdminIntegration }) {
  const state = presentation[integration.state];
  const Icon = state.Icon;

  return (
    <li className="flex items-start justify-between gap-4 border-b border-[#eee2e3] py-4 last:border-none last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#30252a]">{integration.name}</p>
        <p className="mt-1 text-xs leading-5 text-[#7d6c72]">{integration.detail}</p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${state.pill}`}
      >
        <Icon aria-hidden="true" className="size-3" />
        {state.label}
      </span>
    </li>
  );
}
