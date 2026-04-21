# Step 1: Detect Changes

## STEP GOAL

Identify which knowledge files need refreshing by combining three signals: conversation context analysis, source hash comparison, and date-based staleness. Build a prioritized TARGET_FILES list with user confirmation.

---

## SEQUENCE

### 1. Inventory Existing Knowledge Files

List all `.md` files in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`:

```bash
ls -la {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/*.md 2>/dev/null
```

For each file, read the YAML frontmatter and extract:
- `generated` — date of last generation (YYYY-MM-DD)
- `generator` — which skill generated it (bmad-knowledge-bootstrap or bmad-knowledge-refresh)
- `source_hash` — 8-character MD5 hash of source files at generation time

Store as `KNOWLEDGE_INVENTORY`:
```
{filename}: { generated: date, generator: string, source_hash: string }
```

If a file has no frontmatter or no `generated` date, mark its status as `STALE_NO_META`.

### 2. Analyze Conversation Context

Review the current conversation history. Identify changes made during this session:

**A. Files created or modified** — from tool use history (Write, Edit calls), git diff output, or explicit user statements about what changed.

**B. Technologies added or removed** — npm install, cargo add, pip install, new config files created, dependencies modified.

**C. Structural changes** — new directories created, files moved, modules reorganized.

**D. Configuration changes** — lint rules, CI workflows, env vars, deployment configs, test configs.

Load `../data/source-hash-mapping.md` and use the **Context-to-File Mapping** table to map each detected change to the knowledge files it likely affects.

Store results as `CONTEXT_CANDIDATES` — a list of `{ filename, reason }` pairs.

### 3. Compute Current Source Hashes

Using the **Source File Mapping** table from `../data/source-hash-mapping.md`:

For each file in KNOWLEDGE_INVENTORY, identify its source files and compute the current hash:

```bash
cat {source_files} 2>/dev/null | md5 | cut -c1-8
```

Compare the computed hash with the stored `source_hash` from frontmatter:
- **MATCH** — source files have not changed since generation
- **MISMATCH** — source files have changed

Store as `HASH_STATUS` per file.

**Note:** If source files for a knowledge file do not exist (e.g., no Cargo.toml in a JS project), that knowledge file's hash status is MATCH by default — absence is not change.

### 4. Date-Based Staleness Check

For each file in KNOWLEDGE_INVENTORY:
- No `generated` date → `DATE_STALE`
- `generated` date > 7 days ago → `DATE_STALE`
- `generated` date ≤ 7 days → `DATE_FRESH`

### 5. Cascade Analysis

Load the **Dependency Graph** from `../data/source-hash-mapping.md`.

For each file that has `HASH_STATUS = MISMATCH` or is in `CONTEXT_CANDIDATES`:
- Check if it has Tier 1 dependents in the dependency graph
- Add each dependent to the candidate list with reason: "cascade from {parent_filename}"
- Do NOT cascade from Tier 1 files — only Tier 0 → Tier 1 cascades

### 6. Classify Each File

Assign a final status to each knowledge file using this priority order:

| Status | Condition | Priority |
|---|---|---|
| `STALE_NO_META` | No frontmatter or no generated date | HIGH |
| `REFRESH_NEEDED` | HASH_STATUS = MISMATCH OR file is in CONTEXT_CANDIDATES | HIGH |
| `REFRESH_CASCADE` | File is a Tier 1 dependent of a REFRESH_NEEDED file | MEDIUM |
| `STALE_DATE_ONLY` | DATE_STALE but HASH_STATUS = MATCH and not in CONTEXT_CANDIDATES | LOW |
| `FRESH` | DATE_FRESH and HASH_STATUS = MATCH and not in CONTEXT_CANDIDATES | SKIP |

### 7. Present Assessment

Display a structured summary:

```
Knowledge Refresh — Change Detection
=====================================

Conversation context signals:
  - {change description} → {affected file(s)}
  - ...

Knowledge file status:

| File | Hash | Date | Context | Cascade | Status |
|------|------|------|---------|---------|--------|
| stack.md | MATCH/MISMATCH | FRESH/STALE | YES/— | — | {status} |
| infrastructure.md | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

Recommended refresh:
  HIGH:   {list or "none"}
  MEDIUM: {list or "none"}
  LOW:    {list or "none"}
```

If ALL files are FRESH and CONTEXT_CANDIDATES is empty:
- Display: "All knowledge files are up to date. Nothing to refresh."
- **END OF WORKFLOW.**

Otherwise, HALT and present the menu.

### 8. User Choice

> **[A]** Accept recommendation — refresh HIGH + MEDIUM priority files
> **[H]** HIGH only — refresh only HIGH priority files
> **[C]** Custom — select specific files to refresh
> **[F]** Force all — refresh every existing knowledge file regardless of status
> **[Q]** Quit — nothing to refresh

HALT — wait for user selection.

**Menu handling:**
- **A**: TARGET_FILES = all HIGH + MEDIUM files
- **H**: TARGET_FILES = all HIGH files only
- **C**: Present numbered list of all files, ask user to select by number. HALT — wait for selection.
- **F**: TARGET_FILES = all files in KNOWLEDGE_INVENTORY
- **Q**: END OF WORKFLOW

### 9. Check workflow-context.md (OPTIONAL)

If CONTEXT_CANDIDATES includes signals that suggest `workflow-context.md` itself may need updates (new tracker config, new commands, forge changes, new build commands):

```
workflow-context.md may also need updates based on session changes:
  - {field}: {reason for potential update}
  - ...

Include workflow-context.md in refresh? [Y/N]
```

HALT — wait for user response.

If Y: add `workflow-context.md` to TARGET_FILES with a `context_update` flag.
If N: proceed without it.

### 10. Build TARGET_FILES and Proceed

Store the final TARGET_FILES list.

Log:
```
Refreshing {N} files: {comma-separated list}
```

---

**Next:** Read fully and follow `./step-02-scan-and-generate.md`
