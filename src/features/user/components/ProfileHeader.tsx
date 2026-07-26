"use client";

import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useMe } from "@/features/user/hooks/useMe";
import { formatAddressLine } from "@/shared/lib/utils";

export function ProfileHeader() {
  const { data: user, isLoading } = useMe();

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
        {user.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
        )}
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
