"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Avaliacao } from "@/types";
import { reviewsService } from "@/lib/api/services/reviews.service";
import { formatApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

interface ReviewsWallProps {
  tenantId: string;
  avaliacoes: Avaliacao[];
}

export function ReviewsWall({ tenantId, avaliacoes }: ReviewsWallProps) {
  const { status } = useSession();
  const isLogged = status === "authenticated";
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      reviewsService.createTenant(tenantId, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      setError(null);
      setDone(true);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["tenant-reviews", tenantId] });
      // Recarrega a página server para refletir a lista.
      window.location.reload();
    },
    onError: (err) => setError(formatApiError(err)),
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5 text-primary" />
        Avaliações de clientes
      </h3>

      {avaliacoes.length === 0 ? (
        <p className="rounded-xl border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground">
          Ainda não há avaliações para este estabelecimento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {avaliacoes.map((avaliacao) => (
            <div
              key={avaliacao.id}
              className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avaliacao.usuario.foto} />
                    <AvatarFallback className="bg-secondary text-xs">
                      {avaliacao.usuario.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {avaliacao.usuario.nome}
                    </p>
                    <div className="mt-0.5 flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < avaliacao.nota
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {avaliacao.comentario && (
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  &quot;{avaliacao.comentario}&quot;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {isLogged && (
        <div className="mt-2 rounded-xl border border-border/50 bg-card p-4">
          <p className="mb-3 text-sm font-medium">Deixe sua avaliação</p>
          {done ? (
            <p className="text-sm text-primary">Obrigado pela avaliação!</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    aria-label={`${i + 1} estrelas`}
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
                <Label htmlFor="review-comment" className="mb-1.5 block text-sm">
                  Comentário (opcional)
                </Label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar avaliação
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLogged && (
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="text-primary underline">
            Entre
          </a>{" "}
          para avaliar este estabelecimento.
        </p>
      )}
    </div>
  );
}
