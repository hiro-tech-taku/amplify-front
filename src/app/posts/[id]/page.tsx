'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Post } from '@/types';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';

export default function PostDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.id) {
      const fetchPost = async () => {
        try {
          const data = await api.getPost(Number(params.id));
          setPost(data);
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

  const handleDelete = () => {
    router.push('/timeline');
  };

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            投稿が見つかりません
          </div>
        </main>
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
        <PostCard post={post} onDelete={handleDelete} />
      </main>
    </div>
  );
}
