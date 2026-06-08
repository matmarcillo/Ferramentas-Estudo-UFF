import { useState, useEffect } from 'react';

export interface UserInfo {
  id: number;
  role: string;
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: parseInt(payload.sub),
          role: payload.role
        });
      } catch (err) {
        console.error("Failed to decode token", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return { user, isAdmin, isLoggedIn: !!user };
}
