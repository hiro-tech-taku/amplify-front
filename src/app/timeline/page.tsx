'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Post } from '@/types';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';

export default function TimelinePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.getTimeline(filter);
      setPosts(data || []);
    } catch (error) {
      toast.error('タイムラインの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchPosts();
    }
  }, [user, authLoading, router, fetchPosts]);

  const handleNewPost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (authLoading || !user) {
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
        <PostForm onPost={handleNewPost} />

        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            全投稿
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'following'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            フォローのみ
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {filter === 'following'
                ? 'フォロー中のユーザの投稿はありません'
                : '投稿がありません'}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
