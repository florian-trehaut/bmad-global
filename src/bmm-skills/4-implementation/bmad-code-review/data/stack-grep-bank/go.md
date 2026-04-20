# Stack Grep Bank — Go

**Consumed by:** Meta-2 (2a), Meta-3 (3a, 3b), Meta-4 (4a, 4d). Dispatched when `stack.md: language: go`.

---

## Zero Fallback (sub-axis 2a)

```bash
# Swallowed errors
grep -rn "_ = " --include="*.go" {changed_files_dirs} | grep -v "_test.go"
grep -rnE "if err != nil \{\s*\}" --include="*.go" {changed_files_dirs}

# Silent zero-value returns on error
grep -rnE "return\s+0,\s*nil\s*//.*error" --include="*.go" {changed_files_dirs}
grep -rnE 'return\s+"",\s*nil\s*//.*error' --include="*.go" {changed_files_dirs}

# Default case in switch without error
grep -rn "default:" --include="*.go" {changed_files_dirs} | grep -v "_test.go"
```

## Security (sub-axis 3a)

```bash
# Command execution with shell interpolation
grep -rnE "exec\.Command\(.*sh.*-c" --include="*.go" {changed_files_dirs}

# SQL string concatenation / Sprintf into query
grep -rnE "fmt\.Sprintf.*(SELECT|INSERT|UPDATE|DELETE|FROM)" --include="*.go" {changed_files_dirs}
grep -rn "db\.Query(\|db\.Exec(" --include="*.go" {changed_files_dirs} | grep -E '\+|Sprintf'

# Weak crypto
grep -rnE "crypto/md5|crypto/sha1|math/rand" --include="*.go" {changed_files_dirs} | grep -v "_test.go"

# Hardcoded credentials heuristic
grep -rnE '(password|secret|apiKey|token)\s*:=?\s*"[A-Za-z0-9]{10,}"' --include="*.go" {changed_files_dirs} | grep -v "_test.go"
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# Go LLM SDK imports
grep -rnE '"github\.com/(anthropics/anthropic-sdk-go|sashabaranov/go-openai|tmc/langchaingo|google/generative-ai-go)"' --include="*.go" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# fmt.Println left in prod code
grep -rn "fmt\.Println\|fmt\.Printf" --include="*.go" {changed_files_dirs} | grep -v "_test.go" | grep -v "main.go" | grep -v "cmd/"

# TODO / FIXME
grep -rnE "//\s*(TODO|FIXME|XXX|HACK)" --include="*.go" {changed_files_dirs} | grep -v "_test.go"

# os.Getenv direct access (prefer config package)
grep -rn "os\.Getenv(" --include="*.go" {changed_files_dirs} | grep -v "_test.go" | grep -v "/config/"
```

## QA & Testing (sub-axis 4d)

```bash
# Mocks in unit tests (prefer interfaces + in-memory fakes)
grep -rn "gomock\.\|mockery\|testify/mock" --include="*_test.go" {changed_files_dirs}

# Skipped tests
grep -rn "t\.Skip(\|testing\.Short()" --include="*_test.go" {changed_files_dirs}
```

## Resilience (sub-axis 2b)

```bash
# HTTP client without timeout (stdlib default is infinite)
grep -rn "http\.Client{}\|http\.DefaultClient" --include="*.go" {changed_files_dirs} | grep -v "_test.go"
```
