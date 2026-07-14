export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
  url?: string;
  createdBy?: number;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  author?: string;
}

export class Post {
  constructor(
    public readonly id: number | null,
    public title: string,
    public content: string,
    public author: string,
    public readonly createdAt: Date | null = null,
    public readonly updatedAt: Date | null = null,
    public readonly createdBy: number | null = null,
    public url: string | null = null
  ) {}
}
