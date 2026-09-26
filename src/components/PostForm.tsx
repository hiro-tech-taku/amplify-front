'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Post } from '@/types';

interface PostFormProps {
  onPost?: (post: Post) => void;
}

export default function PostForm({ onPost }: PostFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 280;
  const remaining = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const post = await api.createPost(content);
      toast.success('投稿しました');
      setContent('');
      onPost?.(post);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="いまどうしてる？"
        maxLength={maxLength}
        rows={3}
        className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm ${remaining < 20 ? 'text-red-500' : 'text-gray-500'}`}>
          残り {remaining} 文字
        </span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting || remaining < 0}
          className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </form>
  );
}
