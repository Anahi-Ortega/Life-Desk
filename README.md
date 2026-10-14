# LifeDesk 📋

> An engineering-grade habit and hobby tracker styled as a high-velocity ticketing system.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-blue?style=flat-square)](https://life-desk.lovable.app)
[![Tech Stack](https://img.shields.io/badge/Stack-TanStack%20Start%20%7C%20React%20%7C%20Tailwind-informational?style=flat-square)](#%EF%B8%8F-built-with)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey?style=flat-square)](#-license)

> [!NOTE]
> **About this repository:** The code published here is an **early version** of LifeDesk, a front-end prototype that stores its data in the browser's local storage. The **live demo linked below is the current product**, and it includes capabilities (such as cloud accounts and sync) that are not part of the code in this repository.

---

## 🚀 Live Demo

Experience the current version of the application here: **[life-desk.lovable.app](https://life-desk.lovable.app)**

- Try the app without a full signup, or create an account to keep your tickets in the cloud.
- An interactive product tour is available on the landing page.

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

**Both versions**

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR & Server Functions)
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Recharts
- **Prototyping & Acceleration**: [Lovable](https://lovable.dev)

**Current product (live demo)**

- **Backend & Auth**: Lovable Cloud / PostgreSQL with Row Level Security (RLS)

**This repository (early version)**

- **Data storage**: Browser local storage only. There is no backend, database, or user accounts in this codebase.

---

## 💡 Technical Highlights & Architecture

*These highlights describe the current hosted product. The code in this repository predates them.*

While the application began as a rapid prototype, taking it to production required hands-on architectural decisions:

1. **State & Sync Engine**:
   - Designed a hybrid client-cloud synchronization layer with optimistic updates.
   - Built a local storage migration pipeline allowing offline/anonymous users to seamlessly port ticket history to cloud accounts upon signup.
2. **Data Isolation & Security**:
   - Enforced per-user data isolation at the database layer using PostgreSQL Row Level Security (RLS).
3. **Resilient Recurrence Logic**:
   - Engineered custom cycle reopening logic to handle timezone-safe interval recalculations and historical logging.
4. **Theme & Token System**:
   - Established a custom OKLCH semantic color palette tailored for high-contrast ticketing systems with full light/dark/system mode persistence.

---

## 🤖 AI-Assisted Development & Engineering Process

This project was built leveraging modern AI-assisted workflows:

- **Prototyping with Lovable**: The initial concept and UI scaffolds were rapidly synthesized using natural-language direction in Lovable.
- **Architectural Review & Refactoring**: Audited the generated code to transition from synchronous client-side stores to asynchronous cloud writes, resolving network persistence bugs and edge-case hydration mismatches.
- **Security & Infrastructure**: Configured the backend data model, access controls, and authentication for the hosted version.
- **Iterative Feature Engineering**: Extended base capabilities with bulk numeric progress adjustments, multi-format ticket types, avatar generators, and interactive analytical dashboards.

*I treat AI tools as force-multipliers for rapid delivery, maintaining full ownership over system design, code quality, and final deployment.*

---

## 🔐 Security & Privacy

- Secrets and environment configuration are kept out of source control. This repository does not contain production credentials, database passwords, or private environment tokens.
- In the current hosted product, authentication and per-user data isolation are handled by the managed backend. Production configuration is intentionally not published in this repository.

---

## 🗺️ Roadmap

- [ ] Webhook integrations for external notifications (Slack, Discord).
- [ ] Export tickets and cycle journals to Markdown/CSV.
- [ ] Custom user-defined recurrence formulas.

---

## 📄 License

Copyright © 2026. All rights reserved.
