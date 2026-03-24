# Review Perspectives — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Project-specific code review checklists. -->

## Mandatory Perspectives

<!-- List the review perspectives applicable to this project. Each perspective has a checklist of items to verify during code review. Adapt to the detected stack. -->

### 1. Specs Compliance

<!-- Does the code do what was asked? AC coverage, scope analysis. Universal — always include. -->

### 2. Zero Fallback / Zero False Data

<!-- Silent defaults, wrong data substitution, lossy mapping. Universal — always include. -->

### 3. Security

<!-- Stack-specific security checklist. Detected from stack: injection patterns, auth patterns, crypto usage, SSRF, etc. -->

### 4. QA & Testing

<!-- Stack-specific test quality checklist. Forbidden patterns (mocks?), test completeness rules, naming conventions. -->

### 5. Code Quality

<!-- Architecture boundaries, naming conventions, dead code, stack-specific anti-patterns. -->

### 6. Tech Lead

<!-- SOLID, scalability, DI patterns, backward compatibility, migration risks. -->

### 7. Pattern Consistency

<!-- Reference code directories, approved patterns, legacy code to avoid. -->

### 8. Commit History

<!-- Commit format (conventional commits?), squash policy, PR conventions. -->

## Severity Classification

<!-- BLOCKER, WARNING, RECOMMENDATION, QUESTION — define what qualifies for each in this project's context. -->

## Grep Scans

<!-- Stack-specific grep patterns for automated detection. Example: grep for console.log, any type, raw SQL, etc. -->
