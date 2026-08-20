import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type AdminNoticeProps = {
  children: ReactNode;
  title: string;
  tone?: "info" | "warning" | "success";
};

const tones = {
  info: {
    icon: Info,
    shell: "border-[#d9cbd0] bg-[#fffaf8] text-[#493a40]",
    iconStyle: "text-[#a72d60]",
  },
  warning: {
    icon: AlertTriangle,
    shell: "border-[#e6c783] bg-[#fff9e8] text-[#5d4921]",
    iconStyle: "text-[#a76c00]",
  },
  success: {
    icon: CheckCircle2,
    shell: "border-[#b9d8c5] bg-[#f1faf4] text-[#244b32]",
    iconStyle: "text-[#2c7a48]",
  },
};

export function AdminNotice({ children, title, tone = "info" }: AdminNoticeProps) {
  const selected = tones[tone];
  const Icon = selected.icon;

  return (
    <div
      className={`flex gap-3 rounded-2xl border px-4 py-3.5 ${selected.shell}`}
      role={tone === "warning" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${selected.iconStyle}`} />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <div className="mt-0.5 text-xs leading-5 opacity-80">{children}</div>
      </div>
    </div>
  );
}
