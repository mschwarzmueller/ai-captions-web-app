import { useNavigate } from 'react-router';

import { signOut } from '~/lib/auth-client';
import { Button } from './ui/button';

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">Welcome!</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
