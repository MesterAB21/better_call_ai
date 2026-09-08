"use client";

import AgentActivity from "@/components/AgentActivity";
import BalanceLoader from "@/components/BalanceLoader";
import Markdown from "@/components/Markdown";
import type { AgentActivityItem } from "@/lib/api";

/**
 * Body of the assistant message. While the agent is working it shows the
 * steps as they arrive (the current one blinking, like "Consultation en
 * cours"), then the streamed answer text on completion.
 */
export default function AiBody({
  text,
  activities = [],
  loading = false,
}: {
  text: string;
  activities?: AgentActivityItem[];
  loading?: boolean;
}) {
  const hasSteps = activities.length > 0;
  // Activities are a transient "agent working" state: show them only while
  // the answer is still being generated. Once the text arrives the message
  // is considered complete, so the steps hide and only the final answer,
  // separated below, remains.
  const showSteps = hasSteps && !text;
  return (
    <div className="ai-body t-body">
      {showSteps && <AgentActivity activities={activities} active={loading} />}
      {text && <Markdown>{text}</Markdown>}
      {!hasSteps && loading && (
        <div className="library-loading">
          <BalanceLoader compact />
          <span className="library-msg">Consultation en cours…</span>
        </div>
      )}
    </div>
  );
}