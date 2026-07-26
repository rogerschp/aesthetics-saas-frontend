import { TenantCreatePage } from "@/features/tenant/components/TenantCreatePage";
import { TeamSetupHint } from "@/features/team/components/TeamManager";

export default function Page() {
  return <TenantCreatePage teamSetupHint={<TeamSetupHint />} />;
}
