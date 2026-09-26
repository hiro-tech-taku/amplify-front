'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/timeline" className="text-xl font-bold">
          SNS Camp
        </Link>
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              href={`/users/${user.username}`}
              className="hover:text-primary-200"
            >
              @{user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
