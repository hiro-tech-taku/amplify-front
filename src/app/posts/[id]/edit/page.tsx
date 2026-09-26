'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Header from '@/components/Header';

export default function EditPostPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 280;
  const remaining = maxLength - content.length;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.id) {
      const fetchPost = async () => {
        try {
          const post = await api.getPost(Number(params.id));
          if (post.user_id !== user.id) {
            toast.error('この投稿を編集する権限がありません');
            router.push('/timeline');
            return;
          }
          setContent(post.content);
        } catch (error) {
          toast.error('投稿の取得に失敗しました');
          router.push('/timeline');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [user, authLoading, router, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.updatePost(Number(params.id), content);
      toast.success('投稿を更新しました');
      router.push(`/posts/${params.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-primary-600 hover:text-primary-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">投稿を編集</h1>
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-4">
              <span className={`text-sm ${remaining < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                残り {remaining} 文字
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting || remaining < 0}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '更新中...' : '更新する'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
