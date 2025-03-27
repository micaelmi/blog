import z from "zod";

export const listArticlesSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().url(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.object({
    name: z.string(),
    username: z.string(),
    avatarUrl: z.string().url().nullable(),
  }),
  tags: z.array(
    z.object({
      id: z.number(),
      articleId: z.string().uuid(),
      tagId: z.number(),
      tag: z.object({
        id: z.number(),
        name: z.string(),
      }),
    })
  ),
});
