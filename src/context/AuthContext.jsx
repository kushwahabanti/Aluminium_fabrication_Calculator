'use client';

import { createContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { initStore } from '@/lib/services/dataStore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserAndSettings(session.user);
      } else {
        setLoading(false);
      }
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserAndSettings(session.user);
      } else {
        setUser(null);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAndSettings = async (authUser) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      const { data: userSettings } = await supabase.from('settings').select('*').eq('user_id', authUser.id).single();
      
      setUser({ ...authUser, ...profile, avatarUrl: profile?.avatar_url });
      
      if (userSettings) {
        setSettings(userSettings);
        initStore(userSettings.configuration || {}, handleStoreUpdate);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = async (newConfig) => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('settings')
        .update({ configuration: newConfig })
        .eq('user_id', user.id)
        .select()
        .single();
      setSettings(data);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return false;
    try {
      // Map avatarUrl back to avatar_url for DB
      const dbUpdates = { ...updates };
      if (dbUpdates.avatarUrl !== undefined) {
        dbUpdates.avatar_url = dbUpdates.avatarUrl;
        delete dbUpdates.avatarUrl;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (!error) {
        setUser({ ...user, ...data, avatarUrl: data.avatar_url });
        return true;
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
    return false;
  };

  const uploadAvatar = async (file) => {
    if (!user) return false;
    try {
      // Create avatars bucket if doesn't exist (manual setup needed in prod)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return updateUserProfile({ avatarUrl: publicUrl });
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    }
    return false;
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return true;
  };

  const register = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw new Error(error.message);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, settings, loading, token: 'supabase-handled',
      login, register, logout,
      updateUserProfile, uploadAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};
