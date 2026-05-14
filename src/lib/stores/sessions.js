import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';

export const sessions = writable([]);
export const journal = writable('');

export async function loadSessions() {
  sessions.set([]);
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .gte('created_at', today)
    .order('created_at', { ascending: false });
  if (data) sessions.set(data);
}

export async function saveSession(mins) {
  const { data } = await supabase
    .from('sessions')
    .insert({ focus_mins: mins, journal: get(journal) })
    .select()
    .single();
  if (data) sessions.update(s => [data, ...s]);
}

export async function loadJournal() {
  journal.set('');
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('sessions')
    .select('journal')
    .gte('created_at', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (data?.journal) journal.set(data.journal);
}
