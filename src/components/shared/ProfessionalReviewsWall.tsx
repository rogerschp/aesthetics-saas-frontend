"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { formatApiError } from "@/lib/api/errors";
import type { Review } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface ProfessionalReviewsWallProps {
  /** userId do dono do perfil profissional (rota da API). */
  professionalUserId: string;
  /** Se true, dono do perfil pode responder. */
  canReply?: boolean;
  title?: string;
}

export function ProfessionalReviewsWall({
  professionalUserId,
  canReply = false,
  title,
}: ProfessionalReviewsWallProps) {
  const t = useTranslations("ProfessionalReviews");
  const { status, data: session } = useSession();
  const isLogged = status === "authenticated";
  const isSelf = session?.user?.id === professionalUserId;
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ["professional-reviews", professionalUserId],
    queryFn: () => reviewsService.listProfessional(professionalUserId),
    enabled: !!professionalUserId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      reviewsService.createProfessional(professionalUserId, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      setError(null);
      setDone(true);
      setComment("");
      queryClient.invalidateQueries({
        queryKey: ["professional-reviews", professionalUserId],
      });
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      reviewsService.replyMyProfessional(id, { reply }),
    onSuccess: () => {
      setReplyError(null);
      setReplyingId(null);
      setReplyText("");
      queryClient.invalidateQueries({
        queryKey: ["professional-reviews", professionalUserId],
      });
    },
    onError: (err) => setReplyError(formatApiError(err)),
  });

  const reviews = reviewsQuery.data?.reviews ?? [];
  const average = reviewsQuery.data?.averageRating;
  const total = reviewsQuery.data?.totalReviews ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-primary" />
          {title ?? t("title")}
        </h3>
        {total > 0 && average != null && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-semibold text-foreground">
              {average.toFixed(1)}
            </span>
            <span>· {total}</span>
          </p>
        )}
      </div>

      {reviewsQuery.isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {reviewsQuery.isError && (
        <p className="text-sm text-destructive">
          {formatApiError(reviewsQuery.error)}
        </p>
      )}

      {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length === 0 && (
        <p className="rounded-xl border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      )}

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canReply={canReply}
              isReplying={replyingId === review.id}
              replyText={replyText}
              replyError={replyingId === review.id ? replyError : null}
              replyPending={replyMutation.isPending}
              onStartReply={() => {
                setReplyingId(review.id);
                setReplyText(review.reply ?? "");
                setReplyError(null);
              }}
              onCancelReply={() => {
                setReplyingId(null);
                setReplyText("");
                setReplyError(null);
              }}
              onReplyText={setReplyText}
              onSubmitReply={() => {
                if (!replyText.trim()) return;
                replyMutation.mutate({
                  id: review.id,
                  reply: replyText.trim(),
                });
              }}
            />
          ))}
        </div>
      )}

      {isLogged && !isSelf && (
        <div className="mt-2 rounded-xl border border-border/50 bg-card p-4">
          <p className="mb-3 text-sm font-medium">{t("leaveReview")}</p>
          {done ? (
            <p className="text-sm text-primary">{t("thanks")}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    aria-label={t("starsAria", { n: i + 1 })}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        i < rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
              <div>
                <Label htmlFor="pro-review-comment" className="mb-1.5 block text-sm">
                  {t("commentOptional")}
                </Label>
                <textarea
                  id="pro-review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("submit")}
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLogged && (
        <p className="text-xs text-muted-foreground">
          <Link href="/login" className="text-primary underline">
            {t("loginLink")}
          </Link>{" "}
          {t("loginHint")}
        </p>
      )}

      {isSelf && !canReply && (
        <p className="text-xs text-muted-foreground">{t("cannotSelf")}</p>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  canReply,
  isReplying,
  replyText,
  replyError,
  replyPending,
  onStartReply,
  onCancelReply,
  onReplyText,
  onSubmitReply,
}: {
  review: Review;
  canReply: boolean;
  isReplying: boolean;
  replyText: string;
  replyError: string | null;
  replyPending: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReplyText: (v: string) => void;
  onSubmitReply: () => void;
}) {
  const t = useTranslations("ProfessionalReviews");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-secondary text-xs">
              {review.reviewerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {review.reviewerName}
            </p>
            <div className="mt-0.5 flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < review.rating
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm italic leading-relaxed text-muted-foreground">
          &quot;{review.comment}&quot;
        </p>
      )}
      {review.reply && !isReplying && (
        <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("replyLabel")}
          </p>
          <p className="text-sm text-foreground">{review.reply}</p>
        </div>
      )}
      {canReply && !isReplying && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={onStartReply}
        >
          {review.reply ? t("editReply") : t("reply")}
        </Button>
      )}
      {canReply && isReplying && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => onReplyText(e.target.value)}
            placeholder={t("replyPlaceholder")}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {replyError && (
            <p className="text-sm text-destructive">{replyError}</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={replyPending || !replyText.trim()}
              onClick={onSubmitReply}
            >
              {replyPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {t("saveReply")}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelReply}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
