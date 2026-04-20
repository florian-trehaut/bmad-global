# Stack Grep Bank — Python

**Consumed by:** Meta-2 (2a), Meta-3 (3a, 3b), Meta-4 (4a, 4d). Dispatched when `stack.md: language: python`.

---

## Zero Fallback (sub-axis 2a)

```bash
# "or" fallback on potentially-critical fields
grep -rn " or 0\| or ''\| or None\| or 'N/A'\| or 'Unknown'" --include="*.py" {changed_files_dirs} | grep -v "_test.py" | grep -v "test_"

# dict.get() with fallback on business fields
grep -rnE '\.get\(.*,\s*(0|""|\x27\x27|"N/A"|None)\)' --include="*.py" {changed_files_dirs} | grep -v "_test.py"

# Bare except swallowing errors
grep -rn "except:" --include="*.py" {changed_files_dirs} | grep -v "_test.py"
grep -rn "except Exception.*pass" --include="*.py" {changed_files_dirs}
```

## Security (sub-axis 3a)

```bash
# Command execution
grep -rnE "\bsubprocess\.(Popen|call|run|check_output)\(.*shell\s*=\s*True" --include="*.py" {changed_files_dirs}
grep -rn "os\.system\(\|os\.popen\(" --include="*.py" {changed_files_dirs}

# SQL injection: f-strings / format / concat into queries
grep -rnE "(cursor\.execute|\.execute)\s*\(\s*f['\"]" --include="*.py" {changed_files_dirs}
grep -rnE "(cursor\.execute|\.execute)\s*\(.*%" --include="*.py" {changed_files_dirs} | grep -v "_test.py"

# Unsafe deserialisation of untrusted input (prefer JSON / Protocol Buffers)
grep -rnE "pic(k)?le\.load|yaml\.load\(" --include="*.py" {changed_files_dirs} | grep -v "_test.py"

# Hardcoded secrets
grep -rnE "(password|secret|api_key|token)\s*=\s*['\"][A-Za-z0-9]{10,}" --include="*.py" {changed_files_dirs} | grep -v "_test.py"

# Weak crypto
grep -rn "hashlib\.md5\|hashlib\.sha1\|random\.random" --include="*.py" {changed_files_dirs}

# Django CSRF exemption
grep -rn "@csrf_exempt" --include="*.py" {changed_files_dirs}
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# LLM SDK imports
grep -rnE "^\s*(from|import)\s+(anthropic|openai|langchain|llama_index|mistralai|cohere|google\.generativeai|vertexai)" --include="*.py" {changed_files_dirs}

# Dynamic code construction from model output
grep -rnE "(exec|compile)\s*\(.*(response|completion|output)" --include="*.py" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# print() left in prod code
grep -rn "^\s*print(" --include="*.py" {changed_files_dirs} | grep -v "_test.py" | grep -v "test_" | grep -v "scripts/"

# TODO / FIXME / XXX markers
grep -rnE "#\s*(TODO|FIXME|XXX|HACK)" --include="*.py" {changed_files_dirs} | grep -v "_test.py"

# Direct os.environ access (prefer a config module)
grep -rn "os\.environ\[" --include="*.py" {changed_files_dirs} | grep -v "_test.py" | grep -v "config"
```

## QA & Testing (sub-axis 4d)

```bash
# Mocks in unit tests (pytest-mock)
grep -rnE "(mocker\.patch|unittest\.mock\.patch)" --include="test_*.py" --include="*_test.py" {changed_files_dirs}

# Skipped tests
grep -rn "@pytest\.mark\.skip\|@unittest\.skip\|pytest\.skip\(" --include="test_*.py" --include="*_test.py" {changed_files_dirs}

# Fake tests
grep -rn "assert True\|assert 1" --include="test_*.py" --include="*_test.py" {changed_files_dirs}
```
