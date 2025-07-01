
import { useEffect, useState } from 'react';
import AdminLeafletEditor from '@/components/AdminLeafletEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

const AdminMapEditorPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Simple password protection - in production, use proper authentication
  const ADMIN_PASSWORD = 'takoopapook2024';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('Invalid password');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('admin_authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
            <p className="text-gray-600">Enter the admin password to access the map editor</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminLeafletEditor />;
};

export default AdminMapEditorPage;
