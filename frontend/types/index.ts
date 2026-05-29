export type UserRole = "mentor" | "mentee" | "sponsor" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  title: string | null;
  company: string | null;
  bio: string | null;
  skills: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: User;
}

export type BoardType = "appreciation" | "birthday" | "farewell" | "milestone" | "graduation";

export interface BoardPost {
  id: number;
  board_id: number;
  author_name: string;
  author_email: string | null;
  message: string;
  image_url: string | null;
  gif_url: string | null;
  bg_color: string;
  is_anonymous: boolean;
  author_id: number | null;
  created_at: string;
  author: User | null;
  reactions: PostReaction[];
}

export interface PostReaction {
  id: number;
  post_id: number;
  emoji: string;
  author_name: string;
  created_at: string;
}

export interface Board {
  id: number;
  title: string;
  description: string | null;
  board_type: BoardType;
  creator_id: number;
  recipient_id: number | null;
  recipient_name: string | null;
  recipient_email: string | null;
  is_public: boolean;
  share_token: string;
  cover_color: string;
  cover_image_url: string | null;
  view_count: number;
  created_at: string;
  creator: User;
  recipient: User | null;
  posts: BoardPost[];
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type GoalStatus = "not_started" | "in_progress" | "completed";

export interface MentorshipGoal {
  id: number;
  mentorship_id: number;
  title: string;
  description: string | null;
  status: GoalStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export type MentorshipStatus = "pending" | "active" | "completed" | "declined";

export interface Mentorship {
  id: number;
  mentor_id: number;
  mentee_id: number;
  status: MentorshipStatus;
  message: string | null;
  goals: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  mentor: User;
  mentee: User;
}
