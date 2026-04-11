---
nextStepFile: './step-07-validation.md'
---

# Step 6: Project Structure and Boundaries

## STEP GOAL

Define the complete project structure and architectural boundaries based on all decisions made, creating a concrete implementation guide for AI agents.

## RULES

- Read the complete step file before taking any action
- Create complete project tree, not generic placeholders
- Map requirements/epics to architectural components
- You are a facilitator -- collaborative structure definition
- NEVER generate content without user input
- Present A/P/C menu after generating project structure
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to explore innovative project organization approaches
- **P (Party Mode)**: invoke `bmad-party-mode` to evaluate project structure trade-offs from different perspectives
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Analyze Requirements Mapping

Map project requirements to architectural components:

**From Epics (if available):**
"Epic: {epic_name} -> Lives in {module/directory/service}"
- User stories within the epic
- Cross-epic dependencies
- Shared components needed

**From FR Categories (if no epics):**
"FR Category: {fr_category_name} -> Lives in {module/directory/service}"
- Related functional requirements
- Shared functionality across categories
- Integration points between categories

### 2. Define Project Directory Structure

Based on technology stack and patterns, create the complete project structure:

**Root Configuration Files:**
- Package management files
- Build and development configuration
- Environment configuration files
- CI/CD pipeline files

**Source Code Organization:**
- Application entry points
- Core application structure
- Feature/module organization
- Shared utilities and libraries

**Test Organization:**
- Unit test locations and structure
- Integration test organization
- End-to-end test structure
- Test utilities and fixtures

**Build and Distribution:**
- Build output directories
- Static assets

### 3. Define Integration Boundaries

Map how components communicate and where boundaries exist:

**API Boundaries:**
- External API endpoints
- Internal service boundaries
- Authentication and authorization boundaries
- Data access layer boundaries

**Component Boundaries:**
- Frontend component communication patterns
- State management boundaries
- Service communication patterns
- Event-driven integration points

**Data Boundaries:**
- Database schema boundaries
- Data access patterns
- Caching boundaries
- External data integration points

### 4. Create Complete Project Tree

Generate a comprehensive directory structure showing all files and directories. Use the specific technology stack chosen in previous steps to create a real, project-specific tree -- not a generic placeholder.

### 5. Map Requirements to Structure

Create explicit mapping from project requirements to specific files/directories:

**Epic/Feature Mapping:**
"Epic: User Management
- Components: src/components/features/users/
- Services: src/services/users/
- API Routes: src/app/api/users/
- Database: prisma/migrations/*users*
- Tests: tests/features/users/"

**Cross-Cutting Concerns:**
"Authentication System
- Components: src/components/auth/
- Services: src/services/auth/
- Middleware: src/middleware/auth.ts
- Guards: src/guards/auth.guard.ts
- Tests: tests/auth/"

### 6. Generate Structure Content

Prepare content to append to the document:

```markdown
## Project Structure and Boundaries

### Complete Project Directory Structure

{complete_project_tree_with_all_files_and_directories}

### Architectural Boundaries

**API Boundaries:**
{api_boundary_definitions_and_endpoints}

**Component Boundaries:**
{component_communication_patterns_and_boundaries}

**Service Boundaries:**
{service_integration_patterns_and_boundaries}

**Data Boundaries:**
{data_access_patterns_and_boundaries}

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
{mapping_of_epics_or_features_to_specific_directories}

**Cross-Cutting Concerns:**
{mapping_of_shared_functionality_to_locations}

### Integration Points

**Internal Communication:**
{how_components_within_the_project_communicate}

**External Integrations:**
{third_party_service_integration_points}

**Data Flow:**
{how_data_flows_through_the_architecture}

### File Organization Patterns

**Configuration Files:**
{where_and_how_config_files_are_organized}

**Source Organization:**
{how_source_code_is_structured_and_organized}

**Test Organization:**
{how_tests_are_structured_and_organized}

**Asset Organization:**
{how_static_and_dynamic_assets_are_organized}

### Development Workflow Integration

**Development Server Structure:**
{how_the_project_is_organized_for_development}

**Build Process Structure:**
{how_the_build_process_uses_the_project_structure}

**Deployment Structure:**
{how_the_project_structure_supports_deployment}
```

### 7. Present Content and Menu

"I have created a complete project structure based on all our architectural decisions.

**Here is what I will add to the document:**

[Show the complete markdown content from step 6]

**What would you like to do?**
[A] Advanced Elicitation - explore innovative project organization approaches
[P] Party Mode - review structure from different development perspectives
[C] Continue - save this structure and move to architecture validation"

### 8. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with current project structure. Process enhanced organizational insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with project structure context. Process collaborative insights about organization trade-offs. Ask user to accept/reject, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.
