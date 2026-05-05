@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  
  --color-primary: #0f172a;       /* deep navy */
  --color-primary-light: #1e293b; /* darker navy for bento feel */
  --color-accent: #f59e0b;        /* gold/amber */
  --color-accent-dark: #d97706;
  --color-success: #10b981;       /* green */
  --color-danger: #ef4444;        /* red */
  --color-warning: #f59e0b;       /* amber */
  --color-surface: #ffffff;
  --color-bg: #f1f5f9;            /* light gray page background */
  --color-muted: #64748b;
  --color-border: #e2e8f0;
}

@layer base {
  body {
    @apply bg-bg text-primary font-sans antialiased;
  }
}

@layer components {
  .card {
    @apply bg-surface rounded-2xl shadow-sm p-6 border-2 border-white transition-all duration-300 hover:shadow-md;
  }
  
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm;
  }
  
  .btn-primary {
    @apply bg-accent text-primary hover:bg-accent-dark shadow-sm;
  }
  
  .btn-secondary {
    @apply bg-white text-primary border-2 border-white hover:bg-slate-50 shadow-sm;
  }
  
  .input {
    @apply w-full px-4 py-2.5 bg-white border-2 border-white rounded-xl outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm text-sm;
  }
  
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full hover:bg-slate-300;
}
