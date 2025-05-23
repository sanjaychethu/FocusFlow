// Simple login/logout UI and user info
import { useAuth } from '@/providers/auth-provider';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export default function AuthButton() {
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>;

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-200"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary">
        Welcome, {user.displayName || user.email}!
      </span>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors duration-200"
      >
        Sign out
      </button>
    </div>
  );
}
