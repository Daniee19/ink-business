# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

All application code lives in the `ink-business/` subdirectory (which has its own detailed CLAUDE.md). The outer repo is a wrapper.

Run all commands from inside `ink-business/`:

```bash
cd ink-business
npm install
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
```

See `ink-business/CLAUDE.md` for full architecture, patterns, and conventions.
