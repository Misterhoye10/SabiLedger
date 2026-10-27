import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface MerchantUser {
  id: string;
  name: string;
  email: string;
  shopName: string;
}

/**
 * Sign in with Google via Supabase OAuth
 */
export async function signInWithGoogle() {
  if (!supabase) {
    console.warn('[Supabase] Not configured in .env. Falling back to local merchant session.');
    const demoUser: MerchantUser = {
      id: 'usr_' + Date.now().toString(36),
      name: 'Amaka Okorie',
      email: 'amaka@balogunstore.ng',
      shopName: "Amaka's Provisions Store"
    };
    localStorage.setItem('sabiledger_user', JSON.stringify(demoUser));
    return { user: demoUser, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  return { data, error };
}

/**
 * Sign up with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string, name: string, shopName: string) {
  if (!supabase) {
    const newUser: MerchantUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name || 'Merchant Partner',
      email,
      shopName: shopName || 'My Store'
    };
    localStorage.setItem('sabiledger_user', JSON.stringify(newUser));
    return { user: newUser, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { full_name: name, shop_name: shopName }
    }
  });

  if (data?.user) {
    const merchantUser: MerchantUser = {
      id: data.user.id,
      name: name || data.user.email?.split('@')[0] || 'Merchant',
      email: data.user.email || email,
      shopName: shopName || 'My Store'
    };
    localStorage.setItem('sabiledger_user', JSON.stringify(merchantUser));
    return { user: merchantUser, error: null };
  }

  return { user: null, error };
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, pass: string) {
  if (!supabase) {
    const user: MerchantUser = {
      id: 'usr_' + Date.now().toString(36),
      name: email.split('@')[0],
      email,
      shopName: `${email.split('@')[0]}'s Store`
    };
    localStorage.setItem('sabiledger_user', JSON.stringify(user));
    return { user, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (data?.user) {
    const merchantUser: MerchantUser = {
      id: data.user.id,
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Merchant',
      email: data.user.email || email,
      shopName: data.user.user_metadata?.shop_name || 'My Store'
    };
    localStorage.setItem('sabiledger_user', JSON.stringify(merchantUser));
    return { user: merchantUser, error: null };
  }

  return { user: null, error };
}

/**
 * Quick 1-click Demo Merchant Login (Ideal for hackathon judges & instant testing)
 */
export function loginAsDemo(): MerchantUser {
  const demoUser: MerchantUser = {
    id: 'usr_demo_amaka',
    name: 'Amaka Okorie',
    email: 'amaka@balogunstore.ng',
    shopName: "Amaka's Provisions Store"
  };
  localStorage.setItem('sabiledger_user', JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Sign out
 */
export async function signOutUser() {
  localStorage.removeItem('sabiledger_user');
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  }
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<MerchantUser | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Merchant',
          email: data.user.email || '',
          shopName: data.user.user_metadata?.shop_name || "Amaka's Provisions Store"
        };
      }
    } catch (_) {}
  }

  // Fallback to local storage for guests / real local merchants
  const saved = localStorage.getItem('sabiledger_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  return null;
}
