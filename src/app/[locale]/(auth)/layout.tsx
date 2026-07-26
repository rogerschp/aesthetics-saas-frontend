import { RequireAuth } from "@/features/auth/components/RequireAuth";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
