<script>
  import { onMount } from 'svelte';
  import { user, signOut } from '$lib/stores/auth.js';
  import { tasks, loadTasks, addTask, toggleTask, deleteTask } from '$lib/stores/tasks.js';
  import { sessions, journal, loadSessions, saveSession, loadJournal } from '$lib/stores/sessions.js';
  import { goto } from '$app/navigation';

  let modes = [
    { label: 'focus', secs: 25 * 60 },
    { label: 'short break', secs: 5 * 60 },
    { label: 'long break', secs: 15 * 60 },
  ];
  let modeIdx = $state(0);
  let remaining = $state(modes[0].secs);
  let running = $state(false);
  let interval = $state(null);
  let sessionDots = $state([false, false, false, false]);
  let completedToday = $state(0);
  let focusMins = $state(0);
  let newTask = $state('');
  let mood = $state('deep');
  let moods = { deep: '#007aff', flow: '#34c759', wind: '#ff9f0a' };

  let modeTotal = $derived(modes[modeIdx].secs);
  let progress = $derived((remaining / modeTotal) * 100);
  let tasksDone = $derived($tasks.filter(t => t.done).length);

  function fmt(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function setMode(i) {
    modeIdx = i; remaining = modes[i].secs;
    running = false; clearInterval(interval);
  }

  function toggleTimer() {
    if (running) {
      running = false; clearInterval(interval);
    } else {
      running = true;
      interval = setInterval(() => {
        if (remaining > 0) {
          remaining--;
          if (modeIdx === 0) focusMins = Math.floor((modeTotal - remaining) / 60);
        } else {
          clearInterval(interval); running = false;
          if (modeIdx === 0) {
            completedToday++;
            focusMins += 25;
            sessionDots = sessionDots.map((_, i) => i < (completedToday % 4) || (completedToday > 0 && completedToday % 4 === 0));
            saveSession(25);
          }
          remaining = modeTotal;
        }
      }, 1000);
    }
  }

  function reset() {
    running = false; clearInterval(interval); remaining = modeTotal;
  }

  async function handleAddTask() {
    if (!newTask.trim()) return;
    await addTask(newTask.trim());
    newTask = '';
  }

  async function handleLogout() {
    await signOut(); goto('/');
  }

  onMount(async () => {
    await Promise.all([loadTasks(), loadSessions(), loadJournal()]);
    completedToday = $sessions.length;
    focusMins = $sessions.reduce((a, s) => a + (s.focus_mins || 0), 0);
  });
</script>

<div class="dashboard">
  <header class="header">
    <div class="logo">Focus<span>OS</span></div>
    <div class="header-right">
      <div class="mood-pills">
        {#each Object.entries(moods) as [m, color]}
          <button class="mood-pill {mood === m ? 'active' : ''}" style="--mc:{color}" onclick={() => mood = m}>{m}</button>
        {/each}
      </div>
      <button class="logout-btn" onclick={handleLogout}>sign out</button>
    </div>
  </header>

  <main class="grid">

    <!-- TIMER -->
    <section class="card timer-card">
      <div class="card-label">pomodoro</div>
      <div class="mode-pills">
        {#each modes as m, i}
          <button class="mode-pill {modeIdx === i ? 'active' : ''}" style={modeIdx === i ? `--mc:${moods[mood]}` : ''} onclick={() => setMode(i)}>{m.label}</button>
        {/each}
      </div>
      <div class="timer-time">{fmt(remaining)}</div>
      <div class="progress-track">
        <div class="progress-fill" style="width:{progress}%; background:{moods[mood]}"></div>
      </div>
      <div class="timer-actions">
        <button class="btn-primary" style="background:{moods[mood]}" onclick={toggleTimer}>
          {running ? 'pause' : remaining === modeTotal ? 'start' : 'resume'}
        </button>
        <button class="btn-ghost" onclick={reset}>reset</button>
        <div class="dots">
          {#each sessionDots as done}
            <div class="dot {done ? 'done' : ''}" style={done ? `background:${moods[mood]}` : ''}></div>
          {/each}
        </div>
      </div>
      <div class="chibi-anchor" aria-hidden="true">
        <svg class="chibi-float" width="68" height="76" viewBox="0 0 72 80" fill="none">
          <ellipse cx="36" cy="62" rx="18" ry="14" fill="#fde8f2"/>
          <ellipse cx="26" cy="74" rx="6" ry="4" fill="#f9a8c9"/>
          <ellipse cx="46" cy="74" rx="6" ry="4" fill="#f9a8c9"/>
          <rect x="20" y="55" width="32" height="20" rx="3" fill="#5856d6"/>
          <rect x="20" y="55" width="16" height="20" rx="3" fill="#7977e8"/>
          <line x1="36" y1="55" x2="36" y2="75" stroke="#4f46e5" stroke-width="1"/>
          <ellipse cx="20" cy="60" rx="5" ry="3" fill="#fde8f2" transform="rotate(-20 20 60)"/>
          <ellipse cx="52" cy="60" rx="5" ry="3" fill="#fde8f2" transform="rotate(20 52 60)"/>
          <ellipse cx="36" cy="32" rx="16" ry="15" fill="#fde8f2"/>
          <polygon points="20,18 16,6 26,16" fill="#fde8f2"/>
          <polygon points="52,18 56,6 46,16" fill="#fde8f2"/>
          <polygon points="21,17 18,10 25,16" fill="#f9a8c9"/>
          <polygon points="51,17 54,10 47,16" fill="#f9a8c9"/>
          <ellipse cx="30" cy="32" rx="3" ry="3.5" fill="#1c1c1e"/>
          <ellipse cx="42" cy="32" rx="3" ry="3.5" fill="#1c1c1e"/>
          <ellipse cx="31" cy="31" rx="1" ry="1" fill="white"/>
          <ellipse cx="43" cy="31" rx="1" ry="1" fill="white"/>
          <ellipse cx="27" cy="37" rx="4" ry="2.5" fill="#f9a8c9" opacity="0.6"/>
          <ellipse cx="45" cy="37" rx="4" ry="2.5" fill="#f9a8c9" opacity="0.6"/>
          <path d="M33 40 Q36 43 39 40" stroke="#c084a4" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <ellipse cx="36" cy="20" rx="16" ry="7" fill="#7c3aed"/>
          <path d="M20 22 Q14 30 16 40" stroke="#7c3aed" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M52 22 Q58 30 56 40" stroke="#7c3aed" stroke-width="6" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
    </section>

    <!-- TASKS -->
    <section class="card tasks-card">
      <div class="card-label">today's tasks</div>
      <div class="task-input-row">
        <input class="task-input" type="text" placeholder="add a task…" bind:value={newTask}
          onkeydown={(e) => e.key === 'Enter' && handleAddTask()} />
        <button class="add-btn" onclick={handleAddTask}>+</button>
      </div>
      <div class="task-list">
        {#each $tasks as task (task.id)}
          <div class="task-item {task.done ? 'done' : ''}">
            <button class="check-btn" onclick={() => toggleTask(task.id, !task.done)}>
              {#if task.done}<span>✓</span>{/if}
            </button>
            <span class="task-text">{task.text}</span>
            <button class="del-btn" onclick={() => deleteTask(task.id)}>×</button>
          </div>
        {/each}
        {#if $tasks.length === 0}
          <p class="empty-msg">no tasks yet — add one above ↑</p>
        {/if}
      </div>
    </section>

    <!-- STATS -->
    <section class="card stats-card">
      <div class="card-label">today's stats</div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-val" style="color:{moods[mood]}">{completedToday}</div>
          <div class="stat-lbl">sessions</div>
        </div>
        <div class="stat">
          <div class="stat-val" style="color:{moods[mood]}">{focusMins}</div>
          <div class="stat-lbl">focus min</div>
        </div>
        <div class="stat">
          <div class="stat-val" style="color:{moods[mood]}">{tasksDone}</div>
          <div class="stat-lbl">tasks done</div>
        </div>
      </div>
    </section>

    <!-- JOURNAL -->
    <section class="card journal-card">
      <div class="card-label">session journal</div>
      <textarea class="journal-area" placeholder="what are you working on? wins, blockers, thoughts…" bind:value={$journal}></textarea>
      <div class="journal-footer">
        <span class="journal-ts">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span>
        <button class="save-btn" style="background:{moods[mood]}" onclick={() => saveSession(0)}>save entry</button>
      </div>
    </section>

  </main>
</div>

<style>
  :global(*) {
    transition:
      background-color .25s ease,
      border-color .25s ease,
      color .25s ease;
  }

  .dashboard {
    min-height: 100vh;
    background: var(--bg);
    padding: 1.25rem;
    position: relative;
    overflow-x: hidden;
  }

  .dashboard::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(circle at top left,
        rgba(0,122,255,0.12),
        transparent 40%),
      radial-gradient(circle at bottom right,
        rgba(88,86,214,0.12),
        transparent 40%);
    pointer-events: none;
    z-index: 0;
  }

  .dashboard > * {
    position: relative;
    z-index: 1;
  }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 1.25rem;

  background:
    linear-gradient(
      180deg,
      rgba(18,18,18,0.88),
      rgba(10,10,10,0.92)
    );

  backdrop-filter: blur(24px);

  border:
    1px solid rgba(255,255,255,0.08);

  border-radius: var(--radius);

  padding: 0.85rem 1.25rem;

  box-shadow:
    0 10px 30px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.03);
}

  .logo {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }

  .logo span {
    color: var(--blue);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mood-pills {
    display: flex;
    gap: 4px;
  }

  .mood-pill {
    font-size: 12px;
    font-weight: 500;
    padding: 5px 11px;
    border-radius: 20px;
    border: 0.5px solid var(--border);
    background: transparent;
    color: var(--text2);
    transition: all 0.2s;
    cursor: pointer;
  }

  .mood-pill:hover {
    transform: translateY(-1px);
    background: rgba(255,255,255,0.06);
  }

  .mood-pill.active {
    background: var(--mc);
    color: #fff;
    border-color: var(--mc);

    box-shadow:
      0 0 18px color-mix(in srgb, var(--mc) 55%, transparent);
  }

  .logout-btn {
    font-size: 12px;
    padding: 5px 11px;
    border-radius: 20px;
    border: 0.5px solid var(--border);
    background: transparent;
    color: var(--text2);
    transition: all 0.2s;
    cursor: pointer;
  }

  .logout-btn:hover {
    background: var(--surface2);
    transform: translateY(-1px);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

.card {
  position: relative;
  overflow: hidden;

  background:
    linear-gradient(
      180deg,
      rgba(15,15,15,0.92),
      rgba(8,8,8,0.96)
    );

  backdrop-filter: blur(24px);

  border:
    1px solid rgba(255,255,255,0.08);

  border-radius: var(--radius-lg);

  padding: 1.25rem 1.5rem;

  box-shadow:
    0 12px 40px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,255,255,0.03);

  transition:
    transform .25s ease,
    box-shadow .25s ease,
    border-color .25s ease;
}

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        135deg,
        rgba(255,255,255,0.12),
        transparent 40%
      );
    pointer-events: none;
  }

  .card:hover {
    transform: translateY(-2px);

    box-shadow:
      0 20px 40px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.7);
  }

  .card-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text3);
    margin-bottom: 1rem;
  }

  .timer-card {
    grid-column: 1 / -1;
  }

  .mode-pills {
    display: flex;
    gap: 6px;
    margin-bottom: 1rem;
  }

  .mode-pill {
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 20px;
    border: 0.5px solid var(--border);
    background: transparent;
    color: var(--text2);
    transition: all 0.18s;
    cursor: pointer;
  }

  .mode-pill:hover {
    transform: translateY(-1px);
    background: rgba(255,255,255,0.06);
  }

  .mode-pill.active {
    background: var(--mc);
    color: #fff;
    border-color: var(--mc);

    box-shadow:
      0 0 18px color-mix(in srgb, var(--mc) 55%, transparent);
  }

  .timer-time {
    font-family: var(--mono);
    font-size: 64px;
    font-weight: 500;
    letter-spacing: -3px;
    line-height: 1;
    color: var(--text);
    margin-bottom: 1rem;

    text-shadow:
      0 0 30px rgba(255,255,255,0.12);
  }

  .progress-track {
    height: 4px;
    background: var(--surface2);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
    transition:
      width 0.9s linear,
      background .25s ease;

    box-shadow:
      0 0 18px currentColor;
  }

  .timer-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .btn-primary {
    font-size: 14px;
    font-weight: 500;
    padding: 9px 22px;
    border-radius: 22px;
    border: none;
    color: #fff;

    transition:
      opacity 0.15s,
      transform 0.1s,
      box-shadow .25s ease;

    cursor: pointer;

    box-shadow:
      0 8px 22px rgba(0,0,0,0.15);
  }

  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .btn-primary:active {
    transform: scale(0.97);
  }

  .btn-ghost {
    font-size: 13px;
    padding: 9px 16px;
    border-radius: 22px;
    border: 0.5px solid var(--border);
    background: transparent;
    color: var(--text2);
    transition: all 0.15s;
    cursor: pointer;
  }

  .btn-ghost:hover {
    background: var(--surface2);
    transform: translateY(-1px);
  }

  .dots {
    display: flex;
    gap: 5px;
    margin-left: auto;
    align-items: center;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: all 0.3s;
  }

  .dot.done {
    box-shadow:
      0 0 12px currentColor;
  }

  .chibi-anchor {
    position: absolute;
    right: 1.25rem;
    bottom: 0;
    pointer-events: none;
  }

  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .chibi-float {
    animation: float 3.5s ease-in-out infinite;
    filter:
      drop-shadow(0 10px 18px rgba(124,58,237,0.22));
  }

  .tasks-card {
    grid-column: 1 / 2;
  }

  .task-input-row {
    display: flex;
    gap: 7px;
    margin-bottom: 0.75rem;
  }

  .task-input {
    flex: 1;
    padding: 9px 12px;
    background: var(--surface2);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: all 0.2s;
  }

  .task-input:focus {
    border-color: var(--blue);
    box-shadow:
      0 0 0 4px rgba(0,122,255,0.12);
  }

  .task-input::placeholder {
    color: var(--text3);
  }

  .add-btn {
    padding: 9px 14px;
    background: var(--blue);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;

    transition:
      transform .15s ease,
      box-shadow .2s ease;
  }

  .add-btn:hover {
    transform: translateY(-1px);

    box-shadow:
      0 10px 20px rgba(0,122,255,0.2);
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .task-list::-webkit-scrollbar {
    width: 6px;
  }

  .task-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--surface2);
    border-radius: var(--radius-sm);

    transition:
      opacity 0.2s,
      transform .15s ease,
      background .2s ease;
  }

  .task-item:hover {
    transform: translateX(2px);
  }

  .task-item.done {
    opacity: 0.4;
  }

  .task-item.done .task-text {
    text-decoration: line-through;
  }

  .check-btn {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    background: transparent;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 10px;
    color: #fff;
    flex-shrink: 0;

    transition: all 0.2s;
    cursor: pointer;
  }

  .check-btn:hover {
    transform: scale(1.08);
  }

  .task-item.done .check-btn {
    background: var(--green);
    border-color: var(--green);

    box-shadow:
      0 0 14px rgba(52,199,89,0.4);
  }

  .task-text {
    flex: 1;
    font-size: 13px;
    color: var(--text);
  }

  .del-btn {
    background: none;
    border: none;
    color: var(--text3);
    font-size: 16px;
    opacity: 0;
    transition: all 0.15s;
    cursor: pointer;
  }

  .task-item:hover .del-btn {
    opacity: 1;
  }

  .del-btn:hover {
    transform: scale(1.1);
    color: #ff453a;
  }

  .empty-msg {
    font-size: 13px;
    color: var(--text3);
    text-align: center;
    padding: 1rem 0;
  }

  .stats-card {
    grid-column: 2 / 3;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .stat {
    background: var(--surface2);
    border-radius: var(--radius-sm);
    padding: 12px 8px;
    text-align: center;

    transition:
      transform .2s ease,
      background .2s ease;
  }

  .stat:hover {
    transform: translateY(-2px);
  }

  .stat-val {
    font-family: var(--mono);
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -1px;
  }

  .stat-lbl {
    font-size: 11px;
    color: var(--text3);
    margin-top: 3px;
  }

  .journal-card {
    grid-column: 1 / -1;
  }

  .journal-area {
    width: 100%;
    height: 90px;
    background: var(--surface2);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    resize: none;
    outline: none;
    transition: all 0.2s;
  }

  .journal-area:focus {
    border-color: var(--blue);

    box-shadow:
      0 0 0 4px rgba(0,122,255,0.12);
  }

  .journal-area::placeholder {
    color: var(--text3);
  }

  .journal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .journal-ts {
    font-size: 11px;
    color: var(--text3);
  }

  .save-btn {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    border: none;
    color: #fff;
    cursor: pointer;

    transition:
      transform .15s ease,
      opacity .15s ease,
      box-shadow .25s ease;
  }

  .save-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);

    box-shadow:
      0 10px 20px rgba(0,0,0,0.16);
  }

  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .timer-card,
    .tasks-card,
    .stats-card,
    .journal-card {
      grid-column: 1/-1;
    }

    .timer-time {
      font-size: 48px;
    }

    .header {
      flex-direction: column;
      gap: 10px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .chibi-anchor {
      opacity: 0.5;
      transform: scale(0.85);
    }
  }
</style>