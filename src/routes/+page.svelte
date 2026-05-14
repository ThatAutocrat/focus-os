<script>
  import { signIn, signUp } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let mode = $state('login'); // 'login' | 'signup'
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let submitting = $state(false);

  async function submit() {
    error = '';
    submitting = true;
    const fn = mode === 'login' ? signIn : signUp;
    const { error: err } = await fn(email, password);
    submitting = false;
    if (err) {
      error = err.message;
    } else {
      if (mode === 'signup') {
        error = '✓ Check your email to confirm your account!';
      } else {
        goto('/dashboard');
      }
    }
  }
</script>

<div class="auth-bg">
  <!-- Decorative blobs -->
  <div class="blob blob1"></div>
  <div class="blob blob2"></div>

  <div class="auth-card">
    <!-- Chibi mascot -->
    <div class="chibi-wrap">
      <svg width="80" height="88" viewBox="0 0 80 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="40" cy="70" rx="22" ry="16" fill="#fde8f2"/>
        <ellipse cx="28" cy="83" rx="7" ry="4.5" fill="#f9a8c9"/>
        <ellipse cx="52" cy="83" rx="7" ry="4.5" fill="#f9a8c9"/>
        <ellipse cx="40" cy="35" rx="20" ry="19" fill="#fde8f2"/>
        <polygon points="22,21 17,7 29,19" fill="#fde8f2"/>
        <polygon points="58,21 63,7 51,19" fill="#fde8f2"/>
        <polygon points="23,20 19,11 27,18" fill="#f9a8c9"/>
        <polygon points="57,20 61,11 53,18" fill="#f9a8c9"/>
        <ellipse cx="40" cy="22" rx="20" ry="8" fill="#7c3aed"/>
        <path d="M20 26 Q14 36 17 48" stroke="#7c3aed" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M60 26 Q66 36 63 48" stroke="#7c3aed" stroke-width="7" fill="none" stroke-linecap="round"/>
        <ellipse cx="33" cy="36" rx="3.5" ry="4" fill="#1c1c1e"/>
        <ellipse cx="47" cy="36" rx="3.5" ry="4" fill="#1c1c1e"/>
        <ellipse cx="34.2" cy="34.5" rx="1.2" ry="1.2" fill="white"/>
        <ellipse cx="48.2" cy="34.5" rx="1.2" ry="1.2" fill="white"/>
        <ellipse cx="30" cy="42" rx="5" ry="3" fill="#f9a8c9" opacity="0.65"/>
        <ellipse cx="50" cy="42" rx="5" ry="3" fill="#f9a8c9" opacity="0.65"/>
        <path d="M36 45 Q40 49 44 45" stroke="#c084a4" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <rect x="28" y="55" width="24" height="4" rx="2" fill="#007aff" opacity="0.3"/>
        <rect x="28" y="61" width="16" height="4" rx="2" fill="#007aff" opacity="0.2"/>
      </svg>
    </div>

    <h1 class="auth-title">Focus<span>OS</span></h1>
    <p class="auth-sub">your personal productivity companion</p>

    <div class="tab-row">
      <button class="tab {mode === 'login' ? 'active' : ''}" onclick={() => { mode = 'login'; error = ''; }}>Sign in</button>
      <button class="tab {mode === 'signup' ? 'active' : ''}" onclick={() => { mode = 'signup'; error = ''; }}>Create account</button>
    </div>

    <div class="field-group">
      <input
        class="field"
        type="email"
        placeholder="Email"
        bind:value={email}
        onkeydown={(e) => e.key === 'Enter' && submit()}
      />
      <input
        class="field"
        type="password"
        placeholder="Password"
        bind:value={password}
        onkeydown={(e) => e.key === 'Enter' && submit()}
      />
    </div>

    {#if error}
      <p class="error-msg" class:success={error.startsWith('✓')}>{error}</p>
    {/if}

    <button class="submit-btn" onclick={submit} disabled={submitting}>
      {submitting ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
    </button>
  </div>
</div>

<style>
.auth-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;

  background:
    radial-gradient(circle at top left,
      rgba(0,122,255,0.12),
      transparent 35%),

    radial-gradient(circle at bottom right,
      rgba(124,58,237,0.12),
      transparent 35%),

    #000;
}

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
    pointer-events: none;
  }

  .blob1 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, #b4d4ff, #e8f0fe);
    top: -80px; left: -80px;
  }

  .blob2 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #ffc6d9, #fde8f2);
    bottom: -60px; right: -60px;
  }

  .auth-card {
    background: var(--surface);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 0.5px solid rgba(255,255,255,0.9);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .chibi-wrap {
    margin-bottom: 0.75rem;
    animation: float 3.5s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .auth-title {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--text);
    margin-bottom: 4px;
  }

  .auth-title span { color: var(--blue); }

  .auth-sub {
    font-size: 13px;
    color: var(--text3);
    margin-bottom: 1.5rem;
  }

  .tab-row {
    display: flex;
    background: var(--surface2);
    border-radius: var(--radius-sm);
    padding: 3px;
    gap: 2px;
    width: 100%;
    margin-bottom: 1.25rem;
  }

  .tab {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    padding: 7px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text2);
    transition: all 0.2s;
  }

  .tab.active {
    background: var(--surface-solid);
    color: var(--text);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .field {
    width: 100%;
    padding: 12px 14px;
    background: var(--surface2);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(0,122,255,0.12);
  }

  .field::placeholder { color: var(--text3); }

  .error-msg {
    font-size: 12.5px;
    color: var(--pink);
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .error-msg.success { color: var(--green); }

  .submit-btn {
    width: 100%;
    padding: 13px;
    background: var(--blue);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 500;
    transition: opacity 0.2s, transform 0.1s;
    margin-top: 0.25rem;
  }

  .submit-btn:hover:not(:disabled) { opacity: 0.88; }
  .submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>