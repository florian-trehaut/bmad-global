# Stack Grep Bank — Java

**Consumed by:** Meta-2 (2a, 2d), Meta-3 (3a, 3b), Meta-4 (4a, 4d). Dispatched when the tech-stack-lookup protocol with `language: java`.

---

## Zero Fallback (sub-axis 2a)

```bash
# Optional.orElse with fallback on critical fields
grep -rnE "\.orElse\(\s*(0|\"\"|\"N/A\"|null)" --include="*.java" {changed_files_dirs} | grep -v "/test/"

# Catch + swallow
grep -rnE "catch\s*\([^)]+\)\s*\{\s*\}" --include="*.java" {changed_files_dirs}
grep -rn "catch.*Exception.*e.*{ }" --include="*.java" {changed_files_dirs}

# Switch default silently returning default value
grep -rnE "default:\s*return\s+(0|null|\"\")" --include="*.java" {changed_files_dirs}
```

## Security (sub-axis 3a)

```bash
# Command execution
grep -rn "Runtime\.getRuntime()\.exec\|ProcessBuilder" --include="*.java" {changed_files_dirs}

# SQL injection: string concatenation
grep -rnE "(createStatement|createQuery)\(.*\+" --include="*.java" {changed_files_dirs}

# Deserialisation of untrusted input (prefer JSON)
grep -rnE "ObjectInputStream|readObject|XMLDecoder" --include="*.java" {changed_files_dirs} | grep -v "/test/"

# Weak crypto
grep -rn "MessageDigest\.getInstance(\"MD5\"\|MessageDigest\.getInstance(\"SHA-1\"" --include="*.java" {changed_files_dirs}
grep -rn "Random()" --include="*.java" {changed_files_dirs} | grep -v "SecureRandom"

# Hardcoded credentials
grep -rnE '(password|secret|apiKey|token)\s*=\s*"[A-Za-z0-9]{10,}"' --include="*.java" {changed_files_dirs} | grep -v "/test/"
```

## AI / Agentic Safety (sub-axis 3b)

```bash
# Java LLM SDK imports
grep -rnE 'import\s+(com\.anthropic|com\.openai|dev\.langchain4j|ai\.djl)' --include="*.java" {changed_files_dirs}
```

## Code Quality (sub-axis 4a)

```bash
# System.out / System.err in prod code
grep -rn "System\.out\.\|System\.err\." --include="*.java" {changed_files_dirs} | grep -v "/test/" | grep -v "Main.java"

# TODO / FIXME
grep -rnE "//\s*(TODO|FIXME|XXX|HACK)" --include="*.java" {changed_files_dirs} | grep -v "/test/"

# @SuppressWarnings without justification
grep -rn "@SuppressWarnings" --include="*.java" {changed_files_dirs}
```

## QA & Testing (sub-axis 4d)

```bash
# Mocks in unit tests (Mockito, PowerMock — prefer in-memory fakes)
grep -rnE "@Mock\b|Mockito\.mock|mock\(" --include="*Test.java" --include="*Tests.java" {changed_files_dirs}

# Disabled tests
grep -rn "@Disabled\|@Ignore" --include="*Test.java" --include="*Tests.java" {changed_files_dirs}
```

## API Contract (sub-axis 1b)

Java public API diff detected via Revapi / japicmp:

```bash
mvn revapi:check
# or
japicmp -o old.jar -n new.jar
```

Breaking change → BLOCKER.

## Runtime State Continuity (sub-axis 2d)

Detect destructive bulk operations on shared state that would create a window where consumers see empty/missing values during execution. Audit each match against concurrent readers and the surrounding pattern (transaction, atomic swap, versioned pointer, or idempotent merge/upsert).

```bash
# SQL bulk destructive (JDBC, Spring JdbcTemplate)
grep -rnE "executeUpdate\(.*(TRUNCATE|DELETE FROM)|createNativeQuery\(.*(TRUNCATE|DELETE FROM)|jdbcTemplate\.execute\(.*(TRUNCATE|DELETE FROM)" --include="*.java" --include="*.kt" {changed_files_dirs} | grep -v "Test\.java\|Test\.kt\|/migrations/"

# JPA / Hibernate bulk delete
grep -rnE "createQuery\(.*DELETE FROM|deleteAllInBatch\(\)|deleteAll\(\)" --include="*.java" --include="*.kt" {changed_files_dirs} | grep -v "Test\.java\|Test\.kt"

# Redis (Lettuce, Jedis) bulk
grep -rnE "\.flushdb\(\)|\.flushall\(\)|\.flushDB\(\)|\.flushAll\(\)" --include="*.java" --include="*.kt" {changed_files_dirs} | grep -v "Test"

# Cache (Caffeine, Ehcache, Spring Cache) bulk invalidation
grep -rnE "\.invalidateAll\(\)|\.removeAll\(\)|\.clear\(\)" --include="*.java" --include="*.kt" {changed_files_dirs} | grep -v "Test"
```
