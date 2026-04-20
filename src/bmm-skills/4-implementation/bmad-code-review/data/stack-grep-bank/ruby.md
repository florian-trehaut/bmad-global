# Stack Grep Bank — Ruby

**Consumed by:** Meta-2 (2a), Meta-3 (3a, 3b), Meta-4 (4a, 4d). Dispatched when `stack.md: language: ruby`.

---

## Zero Fallback (sub-axis 2a)

```bash
# || fallback on business fields
grep -rnE "\|\|\s*(0|\"\"|''|nil|\"N/A\")" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb" | grep -v "_test.rb"

# Rescue Exception swallowing (should be specific)
grep -rn "rescue\b.*=> \|rescue => " --include="*.rb" {changed_files_dirs}
grep -rnE "rescue\b\s*$" --include="*.rb" {changed_files_dirs}

# Hash#fetch with default on business fields — consider raise instead
grep -rnE "\.fetch\(.*,\s*(0|nil|\"\"|''|\"N/A\")\)" --include="*.rb" {changed_files_dirs}
```

## Security (sub-axis 3a)

```bash
# Command execution
grep -rnE "\bsystem\(|\bexec\(|\`[^\`]+\`|%x\{" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb" | grep -v "_test.rb"
grep -rn "Open3\.popen\|Kernel\.system" --include="*.rb" {changed_files_dirs}

# Rails SQL injection
grep -rnE "(where|find_by_sql|select_all)\s*\(.*\#\{" --include="*.rb" {changed_files_dirs}
grep -rnE "(\.where|\.find)\s*\(\s*\".*\\#\{" --include="*.rb" {changed_files_dirs}

# Unsafe YAML / Marshal on untrusted input
grep -rnE "YAML\.load\b|Marshal\.load" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb"

# Weak crypto
grep -rn "Digest::MD5\|Digest::SHA1\|rand(" --include="*.rb" {changed_files_dirs} | grep -v "SecureRandom"

# Hardcoded credentials
grep -rnE "(password|secret|api_key|token)\s*=\s*['\"][A-Za-z0-9]{10,}" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb"

# Mass assignment (Rails — bypasses strong params)
grep -rnE "\.attributes\s*=|\.update_attributes(!)?\(" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb"
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# Ruby LLM SDK imports
grep -rnE "require\s+['\"](anthropic|openai|ruby-openai|langchainrb)['\"]" --include="*.rb" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# puts / p / pp left in prod code
grep -rn "^\s*(puts|p\s|pp\s)" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb" | grep -v "_test.rb" | grep -v "script/"

# TODO / FIXME
grep -rnE "#\s*(TODO|FIXME|XXX|HACK)" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb"

# Direct ENV access (prefer Rails credentials / config)
grep -rn "ENV\[" --include="*.rb" {changed_files_dirs} | grep -v "_spec.rb" | grep -v "config/"
```

## QA & Testing (sub-axis 4d)

```bash
# RSpec mocks (prefer fakes)
grep -rn "allow(.*receive\|expect(.*receive\|double(" --include="*_spec.rb" {changed_files_dirs}

# Skipped tests
grep -rn "xit\s\|xdescribe\s\|pending\s\|skip\s" --include="*_spec.rb" {changed_files_dirs}

# Fake tests
grep -rn "expect(true)\.to be\|expect(1)\.to eq" --include="*_spec.rb" {changed_files_dirs}
```
