import Emblem from "./Emblem";

export default function Wordmark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`wordmark ${className}`} aria-label="Better Call AI">
      <Emblem size={size} />
      <span className="wordmark-text">
        <span className="wordmark-better">Better</span>
        <span className="wordmark-call">Call&nbsp;AI</span>
      </span>
    </div>
  );
}
