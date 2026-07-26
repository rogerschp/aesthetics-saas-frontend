export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface ReplyReviewDto {
  reply: string;
}

export interface CreateReviewCommentDto {
  body: string;
}
