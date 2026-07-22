"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usersService } from "@/lib/api/services/users.service";
import { formatAddressLine } from "@/lib/utils";

export function ProfileHeader() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: user, isLoading } = useQuery({
    queryKey: ["me", userId],
    queryFn: () => usersService.getMe(),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/40 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/40 p-6">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-foreground">{user.name}</h1>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        {user.address && (
          <p className="truncate text-xs text-muted-foreground">
            {formatAddressLine(user.address)}
          </p>
        )}
      </div>
    </div>
  );
}
