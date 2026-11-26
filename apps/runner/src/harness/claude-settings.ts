import { threadToolsEnv } from './thread-tools.js'

// What Brigade turns off in Claude Code. Claude Code ships its own ways of doing
// what Brigade does (schedules, memory, other sessions, cloud routines),
// which would work outside Brigade where nobody sees them, and each costs
// context on every turn. They go to Claude Code as settings above every
// settings file (the bridge's BRIGADE_CLAUDE_SETTINGS), so a member's own
// ~/.claude, on a Mac, keeps what it set and loses only these.

/** Claude Code's tools that Brigade does otherwise, by their names in Claude Code. */
const DENIED_TOOLS = [
  // Schedules and wake-ups: create_schedule and set_wakeup, which outlive the session.
  'CronCreate',
  'CronDelete',
  'CronList',
  'ScheduleWakeup',
  // Other Claude sessions on this computer, other threads': message_thread and child threads.
  // SendMessage stays, for the teammate's own sub-agents.
  'ListAgents',
  // Many agents on the member's subscription: sub-agents and child threads.
  'Workflow',
  // Claude's cloud routines and phone notifications, outside Brigade.
  'RemoteTrigger',
  'PushNotification',
  // A thread works on its own branch (checkout_repository).
  'EnterWorktree',
  'ExitWorktree',
  // Claude's own design sync, which Brigade does not show (designs are library files).
  'DesignSync',
  // Its status line agent, for a terminal Brigade has none of.
  'Agent(statusline-setup)',
]

// Its bundled skills stay: Claude Code turns a skill off by its name, whatever it comes from,
// so turning one off would also turn off a skill of the same name a member or a repository
// has. Those that do what Brigade does (loop, schedule) find their tools turned off above.

/**
 * Claude Code's built-in mods that Brigade turns off, by name. Since 2.1.317 its privacy mod asks
 * before a shell or web call holds the signed-in account's email and may leave the computer (a
 * curl with the member's address, on a Mac signed in to their own Claude). A thread asks before
 * nothing, so nobody can answer: the call failed ("canUseTool callback is not provided"), where it
 * ran before. Settings join a member's own enabledPlugins, so theirs stay as they set them.
 */
const DISABLED_MODS = ['cc-plugin-privacy@builtin']

export const CLAUDE_SETTINGS = {
  // Memory is Brigade's (CLAUDE.md's memory sections); Claude Code's own would be a second one.
  autoMemoryEnabled: false,
  enabledPlugins: Object.fromEntries(DISABLED_MODS.map((name) => [name, false])),
  permissions: { deny: DENIED_TOOLS },
}

/**
 * Write-only tools denied to read-only governance roles (e.g. a supervisor or reviewer whose
 * instructions explicitly declare `[role:read-only]`): prevents a supervisor from authoring code
 * or scripts on behalf of the executor, preserving independent verification.
 */
export const READ_ONLY_DENIED_TOOLS = ['Edit', 'Write', 'NotebookEdit'] as const

/**
 * Config paths protected from teammate edits: prevents an executor under allow-all from drifting
 * global CLI/gateway settings (such as ~/.claude, ~/.brigade, ~/.thincoder, ~/.codex).
 */
export const PROTECTED_CONFIG_DENY_RULES = [
  'Edit(~/.claude/**)',
  'Write(~/.claude/**)',
  'Edit(~/.brigade/**)',
  'Write(~/.brigade/**)',
  'Edit(~/.thincoder/**)',
  'Write(~/.thincoder/**)',
  'Edit(~/.codex/**)',
  'Write(~/.codex/**)',
] as const

/** Marker in a teammate's instructions that turns on strict no-authoring guardrails. */
export const READ_ONLY_ROLE_MARKER = '[role:read-only]'

export const isReadOnlyRole = (instructions?: string | null) =>
  typeof instructions === 'string' && instructions.includes(READ_ONLY_ROLE_MARKER)

/**
 * Claude Code's environment for what no setting turns off. Fork sub-agents (an Agent call
 * with subagent_type "fork", which starts from the whole conversation), on by default in SDK
 * sessions since Claude Code 2.1.302, stay off as before it: turning them on is a choice of its own.
 */
const CLAUDE_ENV = { CLAUDE_CODE_FORK_SUBAGENT: '0' }

/**
 * The environment that gives a Claude Code session Brigade's settings, and the thread's own
 * tools its sub-agents may not call (thread-tools.ts).
 * Pass `{ readOnly: true }` for read-only governance roles (supervisor / red-team reviewer), and
 * `{ protectConfig: true }` on member machines to block global config drift.
 */
export const claudeSettingsEnv = (options?: {
  readOnly?: boolean
  protectConfig?: boolean
}): Record<string, string> => {
  const extraDeny = [
    ...(options?.protectConfig ? PROTECTED_CONFIG_DENY_RULES : []),
    ...(options?.readOnly ? READ_ONLY_DENIED_TOOLS : []),
  ]
  const settings = extraDeny.length
    ? {
        ...CLAUDE_SETTINGS,
        permissions: {
          ...CLAUDE_SETTINGS.permissions,
          deny: [...CLAUDE_SETTINGS.permissions.deny, ...extraDeny],
        },
      }
    : CLAUDE_SETTINGS
  return {
    ...CLAUDE_ENV,
    BRIGADE_CLAUDE_SETTINGS: JSON.stringify(settings),
    ...threadToolsEnv(),
  }
}
