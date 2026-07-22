import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
