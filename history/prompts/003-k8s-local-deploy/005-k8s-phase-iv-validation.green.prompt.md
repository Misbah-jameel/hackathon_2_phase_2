---
id: 005
title: K8s Phase IV Validation Tasks
stage: green
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: 003-k8s-local-deploy
branch: 003-k8s-local-deploy
user: developer
command: manual
labels: ["k8s", "validation", "helm", "cors", "e2e"]
links:
  spec: specs/003-k8s-local-deploy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-k8s-local-deploy/tasks.md
  - helm/backend/cors-override.yaml
tests:
  - T040: Frontend landing page loads via NodePort (HTTP 200, 33KB HTML)
  - T041: End-to-end signup, login, task CRUD, chatbot verified via curl
  - T043: CORS preflight returns access-control-allow-origin matching frontend
  - T045: Backend scaled to 2 replicas successfully
  - T046: kubectl get pods,svc shows all resources
  - T047: kubectl logs shows Uvicorn health checks
  - T049: Backend scaled back to 1 replica
  - T053: Helm uninstall leaves no orphaned resources
  - T054: Full reinstall from scratch deploys cleanly
  - T055: quickstart.md validated end-to-end
---

## Prompt

Start from where I left my project — work through remaining Phase IV validation tasks (T040, T041, T043, T045-T047, T049, T053-T055).

## Response snapshot

Completed all 10 remaining Phase IV validation tasks:

**Phase 5 (US3 — Local Access):**
- T040: Frontend landing page verified — HTTP 200, 33KB HTML via NodePort
- T041: Full end-to-end verified — signup, login, create task, complete task, delete task, chatbot Help command all successful through K8s services
- T043: CORS fixed — updated ConfigMap with current NodePort URLs, restarted pod, preflight now returns `access-control-allow-origin` header matching frontend origin

**Phase 6 (US4 — AI DevOps):**
- T045-T047: kubectl-ai not installed; equivalent operations performed with standard kubectl (scale to 2, get pods/svc, view logs)
- T049: Backend scaled back to 1 replica

**Phase 8 (Polish):**
- T053: Clean uninstall — `helm uninstall` removed all resources, only `service/kubernetes` remained
- T054: Clean reinstall — full deployment sequence (backend install, wait, frontend install, wait) succeeded
- T055: quickstart.md validated — all documented commands work as written

**Key fix:** CORS_ORIGINS in backend ConfigMap had stale NodePort URLs from previous Minikube session. Updated via `cors-override.yaml` values file and pod restart.

## Outcome

- ✅ Impact: All 56/56 Phase IV tasks now complete (100%)
- 🧪 Tests: 10 manual validation tests passed (curl, kubectl, helm)
- 📁 Files: tasks.md updated (10 checkboxes), cors-override.yaml updated
- 🔁 Next prompts: Merge branch to main, plan Phase V, or create PR
- 🧠 Reflection: CORS stale-URL issue is inherent to Minikube NodePort — dynamic ports change on restart. Consider documenting a CORS update step in quickstart.md.

## Evaluation notes (flywheel)

- Failure modes observed: CORS preflight 400 due to stale NodePort URLs in ConfigMap; pod did not auto-reload ConfigMap changes (envFrom requires pod restart)
- Graders run and results (PASS/FAIL): All 10 validation tasks PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a note to quickstart.md about updating CORS_ORIGINS after minikube restart
