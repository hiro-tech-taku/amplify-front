'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Post, UserProfile } from '@/types';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';

export default function UserProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.username) {
      const fetchData = async () => {
        try {
          const [profileData, postsData] = await Promise.all([
            api.getUserProfile(params.username as string),
            api.getUserPosts(params.username as string),
          ]);
          setProfile(profileData);
          setPosts(postsData || []);
        } catch (error) {
          toast.error('ユーザ情報の取得に失敗しました');
          router.push('/timeline');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router, params.username]);

  const handleFollow = async () => {
    if (!profile) return;

    setIsFollowLoading(true);
    try {
      if (profile.is_following) {
        await api.unfollow(profile.username);
        setProfile({
          ...profile,
          is_following: false,
          followers_count: profile.followers_count - 1,
        });
        toast.success('フォローを解除しました');
      } else {
        await api.follow(profile.username);
        setProfile({
          ...profile,
          is_following: true,
          followers_count: profile.followers_count + 1,
        });
        toast.success('フォローしました');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (authLoading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            ユーザが見つかりません
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-3xl font-bold">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`px-4 py-2 rounded-full font-medium ${
                  profile.is_following
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-50`}
              >
                {isFollowLoading
                  ? '...'
                  : profile.is_following
                  ? 'フォロー中'
                  : 'フォローする'}
              </button>
            )}
          </div>

          <div className="mt-6 flex space-x-6">
            <div>
              <span className="font-bold text-gray-900">{profile.followers_count}</span>
              <span className="text-gray-500 ml-1">フォロワー</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">{profile.following_count}</span>
              <span className="text-gray-500 ml-1">フォロー中</span>
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-bold text-gray-900">投稿</h2>
        <div className="mt-4 space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              まだ投稿がありません
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
