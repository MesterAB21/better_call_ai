import ResetPasswordPage from "@/components/ResetPasswordPage";
export default function Page({ params }: { params: { token: string } }) {
  return <ResetPasswordPage token={params.token} />;
}