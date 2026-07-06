export interface PostComment 
{
  id: string;
  userId: string;
  userNombreUsuario: string;
  userImagenPerfilUrl: string;
  text: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post 
{
  id: string;
  authorId: string;
  authorNombre: string;
  authorApellido: string;
  authorNombreUsuario: string;
  authorImagenPerfilUrl: string;
  title: string;
  description: string;
  imageUrl: string | null;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  comments: PostComment[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListPostsResponse 
{
  items: Post[];
  total: number;
  offset: number;
  limit: number;
  orderBy: 'fecha' | 'likes';
}

export interface CreatePostRequest 
{
  title: string;
  description: string;
  imagen?: File | null;
}

export interface PostDetailResponse {
  post: Post;
}

export interface ListCommentsResponse {
  items: PostComment[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateCommentRequest {
  text: string;
}

export interface UpdateCommentRequest {
  text: string;
}