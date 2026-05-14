import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

export const tasks = writable([]);

export async function loadTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (!error) tasks.set(data);
}

export async function addTask(text) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ text, done: false })
    .select()
    .single();
  if (!error) tasks.update(t => [...t, data]);
}

export async function toggleTask(id, done) {
  await supabase.from('tasks').update({ done }).eq('id', id);
  tasks.update(t => t.map(x => x.id === id ? { ...x, done } : x));
}

export async function deleteTask(id) {
  await supabase.from('tasks').delete().eq('id', id);
  tasks.update(t => t.filter(x => x.id !== id));
}
