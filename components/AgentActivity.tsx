"use client";

import { Check, CircleAlert } from "lucide-react";
import BalanceLoader from "@/components/BalanceLoader";
import type { AgentActivityItem } from "@/lib/api";

/**
 * Compact, sober representation of the agent's structured activities
 * (never the chain-of-thought). The steps stay visible in real time while
 * the run is in progress — the current step blinks like the "Consultation
 * en cours" loader — and remain visible with checkmarks once it completes.
 */
export default function AgentActivity({
  activities,
  active = false,
}: {
  activities: AgentActivityItem[];
  active?: boolean;
}) {
  if (activities.length === 0) return null;

  return (
    <div className={`agent-activities${active ? " agent-activities--active" : ""}`} aria-live="polite">
      <ActivityList activities={activities} />
    </div>
  );
}

function ActivityIcon({ status }: { status: AgentActivityItem["status"] }) {
  if (status === "completed") {
    return <Check size={13} strokeWidth={2.5} className="agent-row-check" />;
  }
  if (status === "error") {
    return <CircleAlert size={14} className="agent-row-error" />;
  }
  return <BalanceLoader compact />;
}

function ActivityList({ activities }: { activities: AgentActivityItem[] }) {
  return (
    <div className="agent-list">
      {activities.map((a) => (
        <div
          key={a.id}
          className={`agent-row agent-row--${a.status}${a.status === "running" ? " agent-row--blink" : ""}`}
        >
          <span className="agent-row-icon">
            <ActivityIcon status={a.status} />
          </span>
          <span className="agent-row-title">{a.title}</span>
          {a.message && <span className="agent-row-msg">{a.message}</span>}
        </div>
      ))}
    </div>
  );
}