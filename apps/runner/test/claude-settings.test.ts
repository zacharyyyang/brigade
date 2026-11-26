import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CLAUDE_SETTINGS,
  claudeSettingsEnv,
  isReadOnlyRole,
  PROTECTED_CONFIG_DENY_RULES,
  READ_ONLY_DENIED_TOOLS,
  READ_ONLY_ROLE_MARKER,
} from '../src/harness/claude-settings.js'

test("Claude Code's own schedules, memory and other sessions are off in Brigade", () => {
  for (const tool of ['CronCreate', 'ScheduleWakeup', 'ListAgents', 'Workflow', 'RemoteTrigger'])
    assert.ok(CLAUDE_SETTINGS.permissions.deny.includes(tool), tool)
  assert.equal(CLAUDE_SETTINGS.autoMemoryEnabled, false)
})

test('what Brigade relies on in Claude Code stays on, skills included', () => {
  const denied = new Set(CLAUDE_SETTINGS.permissions.deny)
  // Sub-agents (and SendMessage to go on with one), questions, background work, skills, search.
  for (const tool of [
    'Agent',
    'SendMessage',
    'AskUserQuestion',
    'Bash',
    'Monitor',
    'TaskStop',
    'Skill',
    'ToolSearch',
    'ReportFindings',
  ])
    assert.ok(!denied.has(tool), tool)
  // A whole tool is denied by its bare name: "Bash(rm *)" would only ask before such commands.
  for (const rule of denied) assert.match(rule, /^\w+(\(statusline-setup\))?$/)
  // No skill is turned off: Claude Code would turn off any skill of that name, a member's too.
  assert.equal('skillOverrides' in CLAUDE_SETTINGS, false)
})

test('the settings reach the bridge as one JSON value', () => {
  const env = claudeSettingsEnv()
  // With the thread's own tools, which its sub-agents may not call (thread-tools.ts).
  assert.deepEqual(Object.keys(env).sort(), [
    'BRIGADE_CLAUDE_SETTINGS',
    'BRIGADE_THREAD_TOOLS',
    'CLAUDE_CODE_FORK_SUBAGENT',
  ])
  assert.deepEqual(JSON.parse(env.BRIGADE_CLAUDE_SETTINGS!), CLAUDE_SETTINGS)
})

test("Claude Code's privacy mod is off, which nobody could answer, and no other plugin is named", () => {
  // Turned off by name, the only one: the setting joins a member's own enabledPlugins.
  assert.deepEqual(CLAUDE_SETTINGS.enabledPlugins, { 'cc-plugin-privacy@builtin': false })
})

test('fork sub-agents stay off, as before Claude Code turned them on in SDK sessions', () => {
  assert.equal(claudeSettingsEnv().CLAUDE_CODE_FORK_SUBAGENT, '0')
})

test('read-only governance roles deny Edit/Write/NotebookEdit and protectConfig denies global CLI dirs', () => {
  assert.equal(isReadOnlyRole(`You are Lead.\n${READ_ONLY_ROLE_MARKER}`), true)
  assert.equal(isReadOnlyRole('You are Builder.'), false)
  assert.equal(isReadOnlyRole(undefined), false)

  const env = claudeSettingsEnv({ readOnly: true, protectConfig: true })
  const parsed = JSON.parse(env.BRIGADE_CLAUDE_SETTINGS!)
  for (const tool of READ_ONLY_DENIED_TOOLS) assert.ok(parsed.permissions.deny.includes(tool), tool)
  for (const rule of PROTECTED_CONFIG_DENY_RULES)
    assert.ok(parsed.permissions.deny.includes(rule), rule)
  // Default CLAUDE_SETTINGS remains untouched
  assert.ok(!CLAUDE_SETTINGS.permissions.deny.includes('Edit'))
})
