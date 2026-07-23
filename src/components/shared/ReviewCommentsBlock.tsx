"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { formatApiError } from "@/lib/api/errors";
import type { Review, ReviewComment } from "@/lib/api/types";

type CommentTarget =
  | { kind: "tenant"; tenantId: string }
  | { kind: "professional"; userId: string };

export function ReviewCommentsBlock({
  review,
  target,
  invalidateKey,
}: {
  review: Review;
  target: CommentTarget;
  invalidateKey: unknown[];
}) {
  const t = useTranslations("ReviewComments");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAuthor = session?.user?.id === review.reviewerUserId;
  const comments = review.comments ?? [];

  const addMutation = useMutation({
    mutationFn: () => {
      const payload = { body: body.trim() };
      return target.kind === "tenant"
        ? reviewsService.addTenantComment(target.tenantId, review.id, payload)
        : reviewsService.addProfessionalComment(
            target.userId,
            review.id,
            payload,
          );
    },
    onSuccess: () => {
      setBody("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      target.kind === "tenant"
        ? reviewsService.deleteTenantComment(
            target.tenantId,
            review.id,
            commentId,
          )
        : reviewsService.deleteProfessionalComment(
            target.userId,
            review.id,
            commentId,
          ),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (err) => setError(formatApiError(err)),
  });

  return (
    <div className="space-y-2 border-t border-border/30 pt-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <MessageCircle className="h-3 w-3" />
        {t("title")}
        {comments.length > 0 ? ` · ${comments.length}` : ""}
      </p>

      {comments.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      )}

      <ul className="space-y-2">
        {comments.map((c: ReviewComment) => (
          <li
            key={c.id}
            className="rounded-md bg-muted/25 px-2.5 py-2 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {c.authorName}
                </p>
                <p className="mt-0.5 text-muted-foreground">{c.body}</p>
              </div>
              {session?.user?.id === c.authorUserId && (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(c.id)}
                  aria-label={t("delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isAuthor && (
        <div className="space-y-2 pt-1">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("placeholder")}
            maxLength={1000}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            size="sm"
            disabled={addMutation.isPending || !body.trim()}
            onClick={() => addMutation.mutate()}
          >
            {addMutation.isPending && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            {t("submit")}
          </Button>
        </div>
      )}
    </div>
  );
}
