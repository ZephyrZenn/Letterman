import axios from "axios";
import { BASE_URL } from "../constants";
import { BaseSyncRecord, CommonResult, Page, Post } from "../types";
import {
  CreatePostReq,
  QueryPostPageReq,
  UpdatePostReq,
} from "./requests/posts";
import { transformResponse } from "./utils/transform-response";

export const getPostPage = async ({
  page,
  pageSize,
  all,
}: QueryPostPageReq): Promise<Page<Post>> => {
  const data = await axios.get<CommonResult<Page<Post>>>(
    `${BASE_URL}/api/post/list`,
    {
      params: { page, pageSize, all },
    }
  );
  data.data.data.data.forEach((post) => {
    post.createTime = new Date(post.createTime);
  });
  return transformResponse(data);
};

export const createPost = async (post: CreatePostReq) => {
  const data = await axios.post<CommonResult<null>>(`${BASE_URL}/api/post`, {
    ...post,
    metadata: JSON.stringify(post.metadata),
  });
  return transformResponse(data);
};

export const getPost = async (id: string) => {
  const data = await axios.get<CommonResult<Post>>(
    `${BASE_URL}/api/post/${id}`
  );
  data.data.data.createTime = new Date(data.data.data.createTime);
  return transformResponse(data);
};

export const updatePost = async (post: UpdatePostReq) => {
  const data = await axios.put<CommonResult<null>>(`${BASE_URL}/api/post`, {
    ...post,
    metadata: JSON.stringify(post.metadata),
  });
  return transformResponse(data);
};

export const deletePost = async (id: string) => {
  const data = await axios.delete<CommonResult<null>>(
    `${BASE_URL}/api/post/${id}`
  );
  return transformResponse(data);
};

export const getLatestSyncRecords = async (id: string) => {
  const data = await axios.get<CommonResult<BaseSyncRecord[]>>(
    `${BASE_URL}/api/post/sync/${id}/records/latest`
  );
  data.data.data.forEach((record) => {
    record.createTime = new Date(record.createTime);
  });
  return transformResponse(data);
};
