'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const result = await api.unlike(post.id);
        setLikeCount(result.like_count);
        setIsLiked(false);
      } else {
        const result = await api.like(post.id);
        setLikeCount(result.like_count);
        setIsLiked(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？')) return;

    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      toast.success('投稿を削除しました');
      onDelete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = user?.id === post.user_id;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <Link href={`/users/${post.username}`} className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold">
              {post.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.display_name || post.username}
            </p>
            <p className="text-sm text-gray-500">@{post.username}</p>
          </div>
        </Link>
        <span className="text-sm text-gray-400">
          {formatDate(post.created_at)}
        </span>
      </div>

      <Link href={`/posts/${post.id}`}>
        <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likeCount}</span>
        </button>

        {isOwner && (
          <div className="flex space-x-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="text-gray-500 hover:text-primary-600 text-sm"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-red-500 text-sm disabled:opacity-50"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
