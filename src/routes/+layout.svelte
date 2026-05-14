<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { initAuth, user, loading } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  onMount(async () => {
    await initAuth();
  });

  $effect(() => {
  if (!$loading) {
    if ($user && $page.url.pathname === '/') goto('/dashboard');
    if (!$user && $page.url.pathname.startsWith('/dashboard')) goto('/');
  }
});
</script>

{#if $loading}
  <div class="splash">
    <div class="splash-logo">Focus<span>OS</span></div>
    <div class="splash-sub">loading…</div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .splash {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .splash-logo {
    font-size: 28px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.5px;
  }
  .splash-logo span { color: var(--blue); }
  .splash-sub { font-size: 14px; color: var(--text3); }
</style>
