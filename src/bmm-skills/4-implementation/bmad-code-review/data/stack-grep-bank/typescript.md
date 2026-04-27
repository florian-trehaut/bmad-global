# Stack Grep Bank — TypeScript / JavaScript

**Consumed by:** Meta-2 (2a zero-fallback), Meta-3 (3a security, 3b AI safety), Meta-4 (4a code quality, 4d QA).

Meta-agents dispatch these grep patterns when the tech-stack-lookup protocol with `language: typescript` or `javascript`. For other stacks, the Meta-agent dispatches `data/stack-grep-bank/{stack}.md` instead.

---

## Zero Fallback (sub-axis 2a)

```bash
# Nullish coalescing / OR fallback on potentially-critical fields
grep -rn "?? 0\|?? ''\||| 0\||| ''" --include="*.ts" --include="*.tsx" --include="*.js" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn "?? 'N/A'\|?? 'Unknown'\|?? 'TODO'\|?? null" --include="*.ts" --include="*.tsx" {changed_files_dirs}

# Arithmetic with hidden constants (e.g., hardcoded conversion factors)
grep -rn "/ 1\.2\|/ 1\.1\|\* 0\.8\|\* 1\.2" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"

# Switch-default silencing
grep -rn "default:.*return\|default:.*break" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
```

## Security (sub-axis 3a)

```bash
# Command execution via shell interpolation (Node child_process)
grep -rnE "\b(exec|spawn|execSync|spawnSync)\s*\(" --include="*.ts" --include="*.tsx" --include="*.js" {changed_files_dirs} | grep -v node_modules | grep -v "spec.ts"

# SQL injection (Prisma unsafe helpers)
grep -rn "queryRawUnsafe\|executeRawUnsafe" --include="*.ts" {changed_files_dirs}

# Raw queries
grep -rn "db.raw(\|knex.raw(\|sequelize.query(" --include="*.ts" {changed_files_dirs}

# Hardcoded secrets heuristics
grep -rn "password\s*[:=]\|secret\s*[:=]\|api_key\s*[:=]\|apiKey\s*[:=]\|accessToken\s*[:=]" --include="*.ts" --include="*.tsx" {changed_files_dirs} | grep -v "spec.ts" | grep -v ".d.ts"

# Weak crypto
grep -rn "createHash('md5')\|createHash('sha1')\|Math\.random\(\)" --include="*.ts" {changed_files_dirs}

# JWT algorithm confusion
grep -rn "alg:\s*['\"]none['\"]\|verify.*algorithm.*['\"]none['\"]" --include="*.ts" {changed_files_dirs}

# NoSQL operator injection
grep -rn "\\\$where\|\\\$function\|\\\$accumulator" --include="*.ts" {changed_files_dirs}

# CORS reflection
grep -rn "origin:\s*true\|origin:\s*req\.\|Access-Control-Allow-Origin.*req" --include="*.ts" {changed_files_dirs}
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# LLM SDK imports
grep -rn "from '@anthropic-ai\|from 'openai\|from 'langchain\|from 'llamaindex\|from '@modelcontextprotocol\|from '@google/generative-ai\|from 'ai'" --include="*.ts" --include="*.tsx" {changed_files_dirs}

# Unsafe model-output handling (dynamic code construction of response content)
grep -rnE "(Function|Reflect\.construct)\s*\(.*(response|completion)" --include="*.ts" {changed_files_dirs}

# Tool definitions (flag if destructive without approval gate)
grep -rn "name:\s*['\"](delete_\|drop_\|run_shell_)" --include="*.ts" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# console.log / console.error / console.warn in prod code
grep -rn "console\.log\|console\.error\|console\.warn" --include="*.ts" --include="*.tsx" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"

# any / as any
grep -rn ":\s*any\b\|as\s*any\b" --include="*.ts" --include="*.tsx" {changed_files_dirs} | grep -v "spec.ts"

# @ts-ignore / @ts-expect-error
grep -rn "@ts-ignore\|@ts-expect-error" --include="*.ts" --include="*.tsx" {changed_files_dirs}

# Domain imports infrastructure (DDD boundary violation)
grep -rn "from.*infrastructure" --include="*.ts" {changed_files_dirs} | grep "/domain/"

# Direct process.env access (should go through a config service)
grep -rn "process\.env\." --include="*.ts" --include="*.tsx" {changed_files_dirs} | grep -v "spec.ts" | grep -v "configuration.ts" | grep -v "config/"
```

## QA & Testing (sub-axis 4d)

```bash
# Mocks (BLOCKER in unit tests)
grep -rn "jest\.mock\|vi\.mock" --include="*.spec.ts" --include="*.test.ts" --include="*.spec.tsx" {changed_files_dirs}

# Fake tests
grep -rn "expect(true)\.toBe(true)\|expect(1)\.toBe(1)" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}

# Skipped tests
grep -rn "describe\.skip\|it\.skip\|xit\|xdescribe\|test\.skip" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

## Performance (sub-axis 4e)

```bash
# Unbounded Promise.all on user input (BLOCKER per §7.5 of the spec)
grep -rn "Promise\.all\(.*\.map\(" --include="*.ts" --include="*.tsx" {changed_files_dirs} | grep -v "spec.ts"

# Nested awaits in a loop (N+1 pattern)
grep -rn "for.*await\|while.*await" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"

# Missing timeout on fetch / axios
grep -rn "fetch(\|axios\.\(get\|post\|put\|delete\)" --include="*.ts" {changed_files_dirs} | grep -v "timeout" | grep -v "spec.ts"
```

## i18n (sub-axis 6b)

```bash
# Hardcoded strings in components (flag when i18n.library != none)
grep -rn ">[A-Z][a-z]\+[A-Za-z ]\+<" --include="*.tsx" --include="*.jsx" {changed_files_dirs}

# CLDR plural anti-pattern
grep -rn "count\s*===\s*1\|count\s*==\s*1\|length\s*===\s*1" --include="*.tsx" --include="*.jsx" {changed_files_dirs}

# Physical CSS (when rtl_required: true)
grep -rn "margin-left\|margin-right\|padding-left\|padding-right" --include="*.css" --include="*.scss" --include="*.tsx" {changed_files_dirs}
```
