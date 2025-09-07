# Claude Code Plugin Development Guide

## 📋 Complete Guide for Updating, Maintaining & Testing Strapi Plugin Custom API Builder

This comprehensive guide documents how to maintain, update, and test the `strapi-plugin-custom-api-builder` using Claude Code, based on the successful Strapi v4 → v5 migration completed in 2025.

## 🎯 Overview

This plugin was successfully migrated from Strapi v4 to v5 using Claude Code, demonstrating advanced AI-assisted development capabilities including:
- Complex API migrations
- Dependency resolution
- End-to-end testing with Playwright
- Multi-step debugging and troubleshooting

## 🛠 Setting Up Claude Code Environment

### Prerequisites
```bash
# Install Claude Code CLI
npm install -g @anthropics/claude-code

# Verify installation
claude --version
```

### Project Setup
```bash
# Clone the repository
git clone https://github.com/vivmagarwal/strapi-plugin-custom-api-builder.git
cd strapi-plugin-custom-api-builder

# Install dependencies
npm install
```

## 📚 Claude Code Documentation & Instructions

### CLAUDE.md File
The `CLAUDE.md` file serves as the master documentation for Claude Code operations:

```markdown
# Key Sections in CLAUDE.md:
- Project Overview & Status
- Migration History & Achievements  
- Installation Requirements
- Technical Implementation Details
- Testing Procedures
- Troubleshooting Guide
```

**Always update CLAUDE.md when:**
- Completing major changes
- Discovering new requirements
- Fixing critical bugs
- Adding new features
- Updating documentation

## 🔄 Plugin Update Workflow with Claude Code

### 1. Planning Phase
```bash
# Start Claude Code session
claude code

# In Claude Code, always begin with:
"Read the CLAUDE.md file to understand current status and requirements"
```

**Best Practices:**
- Review existing todos and status
- Understand dependency requirements
- Check compatibility requirements
- Plan systematic approach

### 2. Development Phase

#### Use TodoWrite Tool Extensively
```javascript
// Always use TodoWrite to track progress
TodoWrite({
  todos: [
    {
      content: "Update API endpoints for new Strapi version",
      status: "pending", 
      activeForm: "Updating API endpoints"
    },
    {
      content: "Test plugin loading in admin interface",
      status: "in_progress",
      activeForm: "Testing plugin loading"
    }
  ]
})
```

#### Code Changes Pattern
1. **Read files first**: Always use Read tool before editing
2. **Multiple file edits**: Use MultiEdit for complex changes
3. **Systematic approach**: Update related files together
4. **Commit frequently**: Small, focused commits with detailed messages

#### Critical Files to Monitor
```
📁 Key Plugin Files:
├── package.json                    # Dependencies & version
├── strapi-admin.js                 # Admin entry point  
├── strapi-server.js               # Server entry point
├── admin/src/index.jsx            # Admin plugin config
├── admin/src/pages/App/index.jsx  # Main app component
├── server/controllers/            # API controllers
├── server/services/               # Business logic
└── CLAUDE.md                      # Documentation
```

### 3. Testing Phase

#### Automated Testing Setup
```bash
# Set up test Strapi environment
npx create-strapi-app@latest test-strapi --quickstart

# Install plugin locally
cd test-strapi
npm install ../strapi-plugin-custom-api-builder

# Install required dependencies  
npm install @strapi/design-system @strapi/icons
```

#### Playwright Testing with Claude Code
```javascript
// Use Playwright MCP for end-to-end testing
mcp__playwright__browser_navigate({url: "http://localhost:1337/admin"})
mcp__playwright__browser_click({element: "Custom API link"})
mcp__playwright__browser_snapshot() // Verify UI state
```

**Testing Checklist:**
- [ ] Plugin loads in admin navigation
- [ ] No console errors on page load
- [ ] All dependencies resolve correctly
- [ ] Custom API creation works
- [ ] Content type selection functions
- [ ] Field mapping operates correctly
- [ ] API generation produces valid endpoints

## 🔧 Maintenance Tasks

### Regular Maintenance Schedule

#### Weekly Tasks
- [ ] Check for Strapi core updates
- [ ] Review dependency security alerts
- [ ] Test plugin functionality
- [ ] Update documentation if needed

#### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Run comprehensive test suite
- [ ] Check compatibility with latest Strapi version
- [ ] Update CLAUDE.md with any changes

#### Before Major Updates
- [ ] Create backup branch
- [ ] Document current working state
- [ ] Plan migration strategy using Claude Code
- [ ] Set up testing environment
- [ ] Use TodoWrite to track all tasks

### Dependency Management

#### Critical Dependencies
```json
{
  "peerDependencies": {
    "@strapi/strapi": "^5.0.0"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "userMustInstall": [
    "lodash",
    "@strapi/design-system@2.0.0-rc.29", 
    "@strapi/icons"
  ]
}
```

#### Dependency Update Process
1. **Check compatibility**: Research breaking changes
2. **Update systematically**: One dependency at a time
3. **Test thoroughly**: Verify functionality after each update
4. **Document changes**: Update CLAUDE.md with requirements

## 🧪 Comprehensive Testing Strategy

### 1. Development Testing
```bash
# Start development environment
npm run develop

# In parallel terminal, start test Strapi instance
cd test-strapi && npm run develop
```

### 2. Automated Testing
```bash
# Run Playwright tests
npx playwright test

# Test specific functionality
npx playwright test --grep "custom-api"
```

### 3. Manual Testing Workflow
1. **Plugin Installation Test**
2. **Admin Interface Test**  
3. **API Generation Test**
4. **Content Type Integration Test**
5. **Relationship Mapping Test**
6. **Generated API Functionality Test**

### 4. Claude Code Testing Commands
```javascript
// Essential testing commands in Claude Code
Read({file_path: "/path/to/test-results"})
Bash({command: "npm test", description: "Run test suite"})
BashOutput({bash_id: "test-server"}) // Monitor background processes
Playwright__browser_snapshot() // Visual verification
```

## 🔍 Debugging with Claude Code

### Common Issues and Solutions

#### 1. Plugin Not Loading
```javascript
// Debug steps in Claude Code:
1. Bash({command: "npm ls", description: "Check dependencies"})
2. Read({file_path: "package.json"}) // Verify peer dependencies
3. BashOutput({bash_id: "strapi-server"}) // Check server logs
4. Grep({pattern: "custom-api", path: "."}) // Find references
```

#### 2. Import/Export Issues
```javascript
// Check module compatibility:
1. Read({file_path: "strapi-admin.js"}) // Verify export format
2. Grep({pattern: "import.*custom-api"}) // Find import statements  
3. Edit() // Fix ES6/CommonJS compatibility
```

#### 3. Dependency Resolution
```javascript
// Resolve missing dependencies:
1. Bash({command: "npm list --depth=0"}) // Check installed packages
2. Edit({file_path: "package.json"}) // Add missing dependencies
3. Bash({command: "npm install"}) // Install dependencies
```

### Systematic Debugging Approach
1. **Identify the issue**: Use logs and error messages
2. **Isolate the problem**: Test individual components
3. **Research solutions**: Use available MCP tools for research
4. **Implement fixes**: Make targeted changes
5. **Verify resolution**: Test thoroughly
6. **Document findings**: Update CLAUDE.md

## 📦 Release Management

### Version Update Process
```bash
# 1. Update version in package.json
npm version patch|minor|major

# 2. Update CLAUDE.md with changes
# 3. Commit all changes  
git add -A
git commit -m "Release v2.x.x: Description of changes"

# 4. Push to repository
git push origin main

# 5. Publish to NPM
npm publish
```

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CLAUDE.md reflects current status
- [ ] Version number incremented
- [ ] Changelog updated
- [ ] Dependencies verified
- [ ] Installation guide current

## 🎯 Best Practices for Claude Code Development

### 1. Always Start with Documentation
```javascript
// First command in any Claude Code session:
Read({file_path: "/path/to/CLAUDE.md"})
```

### 2. Use TodoWrite Proactively
- Track all tasks, even small ones
- Mark tasks completed immediately after finishing
- Keep only one task "in_progress" at a time
- Use clear, actionable task descriptions

### 3. Systematic File Updates
```javascript
// Preferred workflow:
1. Read({file_path: "target-file"}) // Understand current state
2. MultiEdit() // Make multiple related changes
3. Bash({command: "npm run lint"}) // Verify code quality
4. Test functionality
5. Commit changes
```

### 4. Comprehensive Testing
- Test after every significant change
- Use both automated and manual testing
- Verify functionality in clean environment
- Document any new requirements discovered

### 5. Clear Communication
- Write detailed commit messages
- Update documentation continuously
- Use descriptive task names in TodoWrite
- Explain complex changes in CLAUDE.md

## 🚨 Emergency Troubleshooting

### When Plugin Stops Working

#### Immediate Steps
1. **Check server logs**: `BashOutput({bash_id: "server"})`
2. **Verify dependencies**: `Bash({command: "npm ls"})`  
3. **Test in clean environment**: Create fresh Strapi instance
4. **Check recent changes**: `git log --oneline -10`

#### Recovery Process
1. **Isolate the issue**: Test individual components
2. **Research the problem**: Use MCP tools for investigation
3. **Implement targeted fix**: Make minimal necessary changes
4. **Verify resolution**: Test thoroughly
5. **Document the solution**: Update CLAUDE.md

#### Prevention
- Always test before releasing
- Keep detailed change logs
- Maintain clean git history
- Document all requirements

## 📞 Community Support

### Getting Help
1. **Check CLAUDE.md**: Most issues documented
2. **Review git history**: Look for similar fixes
3. **Test in isolation**: Verify issue reproduction
4. **Create detailed issue**: Include logs and steps

### Contributing Back
1. **Document solutions**: Add to CLAUDE.md
2. **Share findings**: Update community resources
3. **Improve processes**: Refine this guide
4. **Test thoroughly**: Ensure quality contributions

## 🎉 Conclusion

This guide provides a comprehensive framework for maintaining the Strapi Plugin Custom API Builder using Claude Code. The key to success is:

- **Systematic approach**: Use TodoWrite and follow established patterns
- **Thorough testing**: Verify functionality at every step
- **Clear documentation**: Keep CLAUDE.md current and detailed
- **Community focus**: Share knowledge and improvements

Following this guide will ensure the plugin remains stable, compatible, and well-maintained for the community.

---

**Last Updated**: 2025-09-07  
**Plugin Version**: 2.0.0  
**Strapi Compatibility**: v5.x  
**Status**: ✅ Production Ready