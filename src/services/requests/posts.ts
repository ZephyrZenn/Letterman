import { Platform, Post } from "../../types";

export type CreatePostReq = Omit<
  Post,
  "id" | "createTime" | "version" | "preVersion" | "postId"
>;

export type UpdatePostReq = Omit<
  Post,
  "createTime" | "version" | "preVersion" | "postId"
>;

export interface QueryPostPageReq {
  page: number;
  pageSize: number;
  all?: boolean;
}

export interface BaseSyncReq {
  platform: Platform;
}

export interface GithubSyncReq extends BaseSyncReq {
  repository?: string;
  path?: string;
}
