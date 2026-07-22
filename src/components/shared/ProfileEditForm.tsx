"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Check, Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersService } from "@/lib/api/services/users.service";
import { formatApiError } from "@/lib/api/errors";
import { maskCep, maskPhoneBR, phoneToApiDigits } from "@/lib/masks";
import type { Address } from "@/lib/api/types";

const emptyAddress: Address = {
  street: "",
  number: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brazil",
  complement: "",
};

export function ProfileEditForm() {
  const t = useTranslations("PerfilEdit");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["me", userId],
    queryFn: () => usersService.getMe(),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? "");
    setTelephone(maskPhoneBR(me.telephone ?? ""));
    setAddress({
      ...emptyAddress,
      ...(me.address ?? {}),
      country: me.address?.country || "Brazil",
      zipCode: me.address?.zipCode ? maskCep(me.address.zipCode) : "",
    });
  }, [me]);

  function patchAddress<K extends keyof Address>(key: K, value: Address[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  const addressFilled =
    address.street.trim() &&
    address.number.trim() &&
    address.city.trim() &&
    address.state.trim().length === 2 &&
    /^\d{5}-\d{3}$/.test(address.zipCode.trim()) &&
    address.country.trim();

  const mutation = useMutation({
    mutationFn: () => {
      const payload: {
        name: string;
        telephone: string;
        password?: string;
        address?: Address;
      } = {
        name: name.trim(),
        telephone: phoneToApiDigits(telephone),
      };
      if (password.trim().length >= 6) payload.password = password.trim();
      if (addressFilled) {
        payload.address = {
          street: address.street.trim(),
          number: address.number.trim(),
          city: address.city.trim(),
          state: address.state.trim().toUpperCase(),
          zipCode: address.zipCode.trim(),
          country: address.country.trim(),
          ...(address.complement?.trim()
            ? { complement: address.complement.trim() }
            : {}),
        };
      }
      return usersService.updateMe(payload);
    },
    onSuccess: () => {
      setError(null);
      setSaved(true);
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["me", userId] });
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1200);
    },
    onError: (err) => setError(formatApiError(err)),
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        {t("editBtn")}
      </Button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card p-5 sm:max-w-xl">
      <h3 className="mb-1 text-lg font-bold">{t("title")}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{t("hint")}</p>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="profile-name" className="mb-1.5 block text-sm">
            {t("name")}
          </Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="profile-phone" className="mb-1.5 block text-sm">
            {t("phone")}
          </Label>
          <Input
            id="profile-phone"
            value={telephone}
            onChange={(e) => setTelephone(maskPhoneBR(e.target.value))}
            placeholder="(11) 99999-9999"
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="profile-password" className="mb-1.5 block text-sm">
            {t("password")}
          </Label>
          <Input
            id="profile-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
          />
        </div>

        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">{t("addressTitle")}</p>
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-sm">{t("street")}</Label>
          <Input
            value={address.street}
            onChange={(e) => patchAddress("street", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("number")}</Label>
          <Input
            value={address.number}
            onChange={(e) => patchAddress("number", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("complement")}</Label>
          <Input
            value={address.complement ?? ""}
            onChange={(e) => patchAddress("complement", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("city")}</Label>
          <Input
            value={address.city}
            onChange={(e) => patchAddress("city", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("state")}</Label>
          <Input
            value={address.state}
            maxLength={2}
            onChange={(e) => patchAddress("state", e.target.value.toUpperCase())}
            placeholder="SP"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("zip")}</Label>
          <Input
            value={address.zipCode}
            onChange={(e) => patchAddress("zipCode", maskCep(e.target.value))}
            placeholder="00000-000"
            inputMode="numeric"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">{t("country")}</Label>
          <Input
            value={address.country}
            onChange={(e) => patchAddress("country", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          disabled={mutation.isPending || name.trim().length < 2}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4" />
          ) : null}
          {saved ? t("saved") : t("save")}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
