import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

export const user = writable(null);
export const loading = writable(true);

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  user.set(session?.user ?? null);
  loading.set(false);

  supabase.auth.onAuthStateChange((_event, session) => {
    user.set(session?.user ?? null);
  });
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
