/**
 * Commitlint Configuration
 * Enforces Conventional Commits specification
 *
 * Format: <type>(<scope>): <subject>
 *
 * Types:
 * - feat: New feature
 * - fix: Bug fix
 * - docs: Documentation changes
 * - style: Code style changes (formatting, etc.)
 * - refactor: Code refactoring
 * - perf: Performance improvements
 * - test: Adding or updating tests
 * - build: Build system or dependencies
 * - ci: CI/CD changes
 * - chore: Other changes that don't modify src or test files
 * - revert: Revert a previous commit
 */

export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Type enum - define allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation only changes
        'style',     // Changes that don't affect code meaning (white-space, formatting, etc)
        'refactor',  // Code change that neither fixes a bug nor adds a feature
        'perf',      // Performance improvement
        'test',      // Adding missing tests or correcting existing tests
        'build',     // Changes that affect the build system or external dependencies
        'ci',        // Changes to CI configuration files and scripts
        'chore',     // Other changes that don't modify src or test files
        'revert',    // Reverts a previous commit
      ],
    ],

    // Scope enum - define allowed scopes (optional)
    'scope-enum': [
      1,
      'always',
      [
        'api',
        'web',
        'mobile',
        'desktop',
        'nginx',
        'docker',
        'ci',
        'deps',
        'auth',
        'db',
        'security',
        'logging',
        'monitoring',
        'docs',
        'tests',
      ],
    ],

    // Type case - must be lower-case
    'type-case': [2, 'always', 'lower-case'],

    // Type empty - type is required
    'type-empty': [2, 'never'],

    // Scope case - must be lower-case
    'scope-case': [2, 'always', 'lower-case'],

    // Subject case - must start with lower-case
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case'],
    ],

    // Subject empty - subject is required
    'subject-empty': [2, 'never'],

    // Subject full stop - no period at the end
    'subject-full-stop': [2, 'never', '.'],

    // Subject max length
    'subject-max-length': [2, 'always', 100],

    // Header max length
    'header-max-length': [2, 'always', 120],

    // Body leading blank - body must be preceded by blank line
    'body-leading-blank': [1, 'always'],

    // Body max line length
    'body-max-line-length': [2, 'always', 200],

    // Footer leading blank - footer must be preceded by blank line
    'footer-leading-blank': [1, 'always'],

    // Footer max line length
    'footer-max-line-length': [2, 'always', 200],
  },

  // Custom prompt settings
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g. api, web, mobile)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description: 'If issues are closed, the commit requires a body. Please enter a longer description',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
