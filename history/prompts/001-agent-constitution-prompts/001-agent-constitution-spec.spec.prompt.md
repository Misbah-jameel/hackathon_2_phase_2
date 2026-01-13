---
id: 001
title: Agent Constitution and History Prompts Specification
stage: spec
date: 2026-01-06
surface: agent
model: claude-opus-4-5-20251101
feature: 001-agent-constitution-prompts
branch: 001-agent-constitution-prompts
user: system-architect
command: /sp.specify
labels: ["constitution", "history", "ai-agent", "specification"]
links:
  spec: specs/001-agent-constitution-prompts/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-agent-constitution-prompts/spec.md
  - specs/001-agent-constitution-prompts/checklists/requirements.md
  - .specify/memory/constitution.md
  - .specify/memory/history.md
tests:
  - null
---

## Prompt

You are a senior AI system architect.

Your task is to generate TWO things for an AI agent:

1. CONSTITUTION PROMPT
2. HISTORY PROMPT

### PROJECT CONTEXT
Project Name: AI-Driven Full-Stack Application
Stack:
- Next.js (App Router, Server Components, Server Actions)
- FastAPI (backend)
- PostgreSQL + SQLModel
- JWT authentication
- Spec-driven development (Spec-Kit)

### PART 1 — CONSTITUTION PROMPT
Create a strict but practical constitution for the agent that defines:

- The agent's role and responsibility
- What the agent MUST do
- What the agent MUST NOT do
- Coding standards and quality rules
- Security and privacy rules
- Error handling expectations
- Communication style:
  - Clear
  - Step-by-step
  - No assumptions
  - No hallucinations
- Default behavior when requirements are unclear

The constitution should be concise, structured, and enforceable.

### PART 2 — HISTORY PROMPT
Create an initial history prompt that includes:

- Project goals
- Technical decisions already made
- Constraints and no

## Response snapshot

Created feature specification for AI Agent Constitution & History Prompts feature:

1. **Branch Created**: `001-agent-constitution-prompts`
2. **Spec Written**: `specs/001-agent-constitution-prompts/spec.md`
   - 3 prioritized user stories with acceptance scenarios
   - 19 functional requirements (FR-001 to FR-019)
   - 6 measurable success criteria
   - 4 key entities defined
   - Edge cases documented
3. **Checklist Created**: `specs/001-agent-constitution-prompts/checklists/requirements.md`
   - All validation items passed
4. **Existing Documents Referenced**:
   - `.specify/memory/constitution.md` - Agent behavioral rules
   - `.specify/memory/history.md` - Project context and decisions

## Outcome

- Impact: Feature specification completed, defining requirements for AI agent governance documents
- Tests: N/A (specification phase)
- Files: 2 created (spec.md, requirements.md), 2 referenced (constitution.md, history.md)
- Next prompts: `/sp.clarify` for any refinements or `/sp.plan` to proceed with implementation planning
- Reflection: Specification captures behavioral constraints and project context requirements comprehensively

## Evaluation notes (flywheel)

- Failure modes observed: None - all checklist items passed
- Graders run and results (PASS/FAIL): Spec quality checklist - PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding version compatibility requirements between constitution and history documents
