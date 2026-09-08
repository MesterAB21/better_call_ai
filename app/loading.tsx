import BalanceLoader from "@/components/BalanceLoader";

export default function Loading() {
  return (
    <div className="page-loader">
      <BalanceLoader timeScale={3} />
    </div>
  );
}