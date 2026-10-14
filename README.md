# LifeDesk 📋

> An engineering-grade habit and hobby tracker styled as a high-velocity ticketing system.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-blue?style=flat-square)](https://life-desk.lovable.app)
[![Tech Stack](https://img.shields.io/badge/Stack-TanStack%20Start%20%7C%20React%20%7C%20Tailwind-informational?style=flat-square)](#-built-with)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey?style=flat-square)](#-license)

---

## 🚀 Live Demo

Experience the live application here: **[life-desk.lovable.app](https://life-desk.lovable.app)**

- Test accounts are available, or create a username-only session in seconds.
- Interactive product tour available on the landing page.

---

## 📸 Overview

![LifeDesk Board](src/assets/shot-board.jpg)
*LifeDesk ticket queue with active category filters, goal meters, and priority escalation.*

---

## 🧩 What It Does

Most habit trackers feel like passive checklists. LifeDesk applies software engineering paradigms to personal development:

- **Categorized Issue Tracking**: Habits and recurring chores filed as tickets (`FIT-0001`, `MNY-0002`, `CLN-0003`).
- **Severity & Escalation Levels**: Tasks prioritized from `P1` (Blocker) to `P5` (Trivial).
- **Automated Reopening Cycles**: Completed habits automatically transition back to "Open" on scheduled cadence (daily, weekly, custom) with cycle counters and metric resets.
- **Quantitative & Qualitative Progress**: Support for numeric goals, multi-step checklists, and 1–5 rating journals.
- **Analytical Insights**: Consistency heatmaps, completion trends, category distribution, and "Needs Attention" aging alerts.

---

## 🛠️ Built With

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR & Server Functions)
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Recharts
- **Backend & Auth**: Lovable Cloud / PostgreSQL with Row Level Security (RLS)
- **Prototyping & Acceleration**: [Lovable](https://lovable.dev)

---

## 💡 Technical Highlights & Architecture

While the application began as a rapid prototype, taking it to production required hands-on architectural decisions:

1. **State & Sync Engine**:
   - Designed a hybrid client-cloud synchronization layer with optimistic updates.
   - Built a local storage migration pipeline allowing offline/anonymous users to seamlessly port ticket history to cloud accounts upon signup.
2. **Database Security & RLS**:
   - Implemented strict PostgreSQL Row Level Security (RLS) ensuring user data isolation across tickets, categories, tags, projects, and recurring cycles.
3. **Resilient Recurrence Logic**:
   - Engineered custom cycle reopening logic to handle timezone-safe interval recalculations and historical logging.
4. **Theme & Token System**:
   - Established a custom OKLCH semantic color palette tailored for high-contrast ticketing systems with full light/dark/system mode persistence.

---

## 🤖 AI-Assisted Development & Engineering Process

This project was built leveraging modern AI-assisted workflows:

- **Prototyping with Lovable**: The initial concept and UI scaffolds were rapidly synthesized using natural-language direction in Lovable.
- **Architectural Review & Refactoring**: Audited the generated code to transition from synchronous client-side stores to asynchronous cloud writes, resolving network persistence bugs and edge-case hydration mismatches.
- **Security & Infrastructure**: Configured database schemas, role grants, auth flows, and edge execution boundaries.
- **Iterative Feature Engineering**: Extended base capabilities with bulk numeric progress adjustments, multi-format ticket types, avatar generators, and interactive analytical dashboards.

*I treat AI tools as force-multipliers for rapid delivery, maintaining full ownership over system design, code quality, and final deployment.*

---

## 🔐 Security & Privacy

- No production credentials, database passwords, or private environment tokens are stored in this repository.
- User authentication relies on secure hashed credential storage with Row Level Security enforcing strict data boundaries.

---

## 🗺️ Roadmap

- [ ] Webhook integrations for external notifications (Slack, Discord).
- [ ] Export tickets and cycle journals to Markdown/CSV.
- [ ] Custom user-defined recurrence formulas.

---

## 📄 License

Copyright © 2026. All rights reserved.  

