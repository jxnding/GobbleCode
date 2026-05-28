## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"
- Prefer end to end tests, remember that tests are only as useful as their fidelity.

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
etc
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Use Git and Deduction

**When bugs exist, use the power of Git**

- Utilize known good states to diff
- Deduce bugs from their fundamental sources
- Don't just think. Mental models are prone to failure, don't bash your head against the wall
- Keep master/main an always working state

## 6. Test driven development

** Write with tests already in mind **

- For new features and bugfixes, first create a test to reproduce, then fix until the test passes

## 7. Use Agents and Subagents
Use opencode worker & tester agent for all changes, write tests for all new features and changes. Then pass them. Then stage for a commit and have the reviewer critique each commit to maintain high quality. Use GLM5.1 for the reviewer