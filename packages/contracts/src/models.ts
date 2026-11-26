// The models a teammate can run, per harness. The single list: the teammate form's
// picker, the API's validation and the labels shown elsewhere all read it. To add a
// model when it's released, add a line to its harness below; order is display order.
import type { Effort, HarnessId, TeammateHarness } from './runner.js'

export type HarnessModel = {
  /** What the harness CLI takes as its model (Claude Code `--model`, Codex `-m`). */
  id: string
  /** As the vendor names it in its own picker. */
  label: string
  description: string
  /**
   * The effort the CLI runs it at when Brigade sends none, from the vendor's docs
   * (Claude Code's model config, OpenAI's model guide). Unset where they don't say.
   */
  effort?: Effort
  /**
   * The efforts the model takes, lowest first, where the harness can't take any (Antigravity's
   * models each have their own thinking levels): another effort runs at the nearest of these.
   */
  efforts?: readonly Effort[]
}

const CLAUDE_MODELS = [
  {
    id: 'claude-opus-5-5',
    label: 'Opus 5.5',
    description: 'Most capable Opus for complex, agentic work.',
    effort: 'medium',
  },
  {
    id: 'claude-fable-5-2',
    label: 'Fable 5.2',
    description: 'Anthropic’s most capable model, for the hardest long tasks.',
    effort: 'high',
  },
  {
    id: 'claude-fable-5-1',
    label: 'Fable 5.1',
    description: 'Previous Fable model.',
    effort: 'high',
  },
  {
    id: 'claude-sonnet-5-5',
    label: 'Sonnet 5.5',
    description: 'Fast and capable for everyday coding and agent work.',
    effort: 'medium',
  },
  {
    id: 'claude-haiku-5-5',
    label: 'Haiku 5.5',
    description: 'Fastest and cheapest, for simple tasks.',
    effort: 'medium',
  },
  {
    id: 'claude-mythos-1',
    label: 'DeepSeek · V4.1 Flash (GenUR)',
    description: 'GenUR CC Multi shell → deepseek-v4.1-flash-1017.',
    effort: 'medium',
  },
  {
    id: 'claude-mythos-2',
    label: 'Gemini · 3.8 Flash (GenUR)',
    description: 'GenUR CC Multi shell → gemini-3.8-flash.',
    effort: 'medium',
  },
  {
    id: 'claude-mythos-4',
    label: 'Gemini · 4 Argon (GenUR)',
    description: 'GenUR CC Multi shell → gemini-4-argon.',
    effort: 'medium',
  },
  {
    id: 'claude-mythos-8',
    label: 'Gemini · 4 Hydrogen 1M (GenUR)',
    description: 'GenUR CC Multi shell → gemini-4-hydrogen (1M).',
    effort: 'medium',
  },
  {
    id: 'claude-mythos-9',
    label: 'Gemini · 4 Neon 1M (GenUR)',
    description: 'GenUR CC Multi shell → gemini-4-neon (1M).',
    effort: 'medium',
  },
] as const satisfies readonly HarnessModel[]

const CODEX_MODELS = [
  {
    id: 'gpt-6.2-sol',
    label: 'GPT-6.2 Sol',
    description: 'Latest workhorse model for coding and everyday work.',
  },
  {
    id: 'gpt-6.2-astra',
    label: 'GPT-6.2 Astra',
    description: 'Frontier intelligence for the most demanding work.',
  },
  {
    id: 'gpt-6.1-sol',
    label: 'GPT-6.1 Sol',
    description: 'Previous workhorse model.',
    effort: 'medium',
  },
  {
    id: 'gpt-6-astra',
    label: 'GPT-6 Astra',
    description: 'Previous frontier model.',
  },
  { id: 'gpt-6-sol', label: 'GPT-6 Sol', description: 'Older generation workhorse model.' },
  {
    id: 'gpt-6-luna',
    label: 'GPT-6 Luna',
    description: 'Fast and affordable model for easier tasks.',
  },
  { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol', description: 'Older generation workhorse model.' },
  {
    id: 'gpt-5.6-terra',
    label: 'GPT-5.6 Terra',
    description: 'Older balanced model for straightforward work.',
  },
  { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna', description: 'Older fast and efficient model.' },
] as const satisfies readonly HarnessModel[]

// Antigravity's own Gemini models, as `agy acp` names them (its session's `model` option); the
// thinking level goes on the model's id (antigravityModelId). Only Gemini: Google offers its
// other models only to its own and a few named editors' clients.
const ANTIGRAVITY_MODELS = [
  {
    id: 'gemini-4-neon',
    label: 'Gemini 4 Neon',
    description: 'Google’s newest Gemini, on Google AI Pro and Ultra plans as Google opens it.',
    effort: 'high',
    efforts: ['low', 'medium', 'high', 'xhigh'],
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    description: 'Fast Gemini for everyday coding and agent work.',
    effort: 'high',
    efforts: ['low', 'medium', 'high'],
  },
] as const satisfies readonly HarnessModel[]

export const HARNESS_MODELS = {
  claude_code: CLAUDE_MODELS,
  codex: CODEX_MODELS,
  // Pi calls the vendor's API itself, on the login of the model's vendor (loginOf): Claude's
  // models on a Claude login, GPT's on a ChatGPT one.
  pi: [...CLAUDE_MODELS, ...CODEX_MODELS],
  antigravity: ANTIGRAVITY_MODELS,
} as const satisfies Record<TeammateHarness, readonly HarnessModel[]>

/** What a Pi teammate on Default runs: Pi has no account default of its own to fall back on. */
export const PI_DEFAULT_MODEL = 'claude-opus-5-5'

/**
 * What a Codex teammate on Default runs, and the image tool. The Codex adapter's
 * own default (GPT-5.5) was retired for ChatGPT sign-ins on 2026-10-14.
 */
export const CODEX_DEFAULT_MODEL = 'gpt-6.2-sol'

/**
 * What an Antigravity teammate on Default runs: the model `agy` itself starts on, named so a
 * thread's effort has a model to go on.
 */
export const ANTIGRAVITY_DEFAULT_MODEL = 'gemini-3.8-flash'

/** The model a turn asks for: on Default, Claude Code runs the account's own, the others ours. */
export const runModel = (harness: TeammateHarness, model: string | null) =>
  model ??
  (harness === 'codex'
    ? CODEX_DEFAULT_MODEL
    : harness === 'pi'
      ? PI_DEFAULT_MODEL
      : harness === 'antigravity'
        ? ANTIGRAVITY_DEFAULT_MODEL
        : null)

/**
 * The effort a model runs at: the one asked for where it takes it, else the nearest it takes (a
 * tie goes to the lower), and its own when none is asked for.
 */
export const modelEffort = (
  harness: TeammateHarness,
  model: string | null,
  effort: Effort | null,
): Effort | null => {
  const id = runModel(harness, model)
  const models: readonly HarnessModel[] = HARNESS_MODELS[harness]
  const known = models.find((m) => m.id === id)
  const wanted = effort ?? known?.effort ?? null
  if (!wanted || !known?.efforts?.length || known.efforts.includes(wanted)) return wanted
  const rank = (e: Effort) => EFFORTS.findIndex((x) => x.id === e)
  return [...known.efforts].sort(
    (a, b) =>
      Math.abs(rank(a) - rank(wanted)) - Math.abs(rank(b) - rank(wanted)) || rank(a) - rank(b),
  )[0]!
}

/**
 * What `agy acp` takes as its model (session/set_model): the model's id with its thinking level,
 * as `agy models` lists them (gemini-3.8-flash-high).
 */
export const antigravityModelId = (model: string | null, effort: Effort | null) => {
  const id = runModel('antigravity', model)!
  const level = modelEffort('antigravity', model, effort)
  return level ? `${id}-${level}` : id
}

/**
 * The login a teammate's turns run on: Claude Code's and Codex's own, and for Pi the login of its
 * model's vendor. Accounts, usage and limits are the login's; the harness only runs the turns.
 */
export const loginOf = (harness: TeammateHarness, model: string | null): HarnessId => {
  if (harness !== 'pi') return harness
  return CODEX_MODELS.some((m) => m.id === runModel(harness, model)) ? 'codex' : 'claude_code'
}

/** A login's vendor, as people know it: Claude, Codex (ChatGPT) or Antigravity (Google). */
export const loginName = (login: HarnessId) =>
  login === 'codex' ? 'Codex' : login === 'antigravity' ? 'Antigravity' : 'Claude'

/** The harness as its vendor names it. */
export const harnessName = (harness: TeammateHarness) =>
  harness === 'codex'
    ? 'Codex'
    : harness === 'pi'
      ? 'Pi'
      : harness === 'antigravity'
        ? 'Antigravity'
        : 'Claude Code'

/** A teammate's model: null is Default (runModel). */
export const isHarnessModel = (harness: TeammateHarness, model: string | null) =>
  model === null || HARNESS_MODELS[harness].some((m) => m.id === model)

/** The vendor's name for a model id, or the id itself for one no longer listed. */
export const modelLabel = (harness: TeammateHarness, model: string | null) =>
  model === null ? 'Default' : (HARNESS_MODELS[harness].find((m) => m.id === model)?.label ?? model)

/** A thread's effort choices, lowest first, as Claude Code and Codex name them. */
export const EFFORTS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'xhigh', label: 'Extra high' },
  { id: 'max', label: 'Max' },
] as const satisfies readonly { id: Effort; label: string }[]

/** An effort's name, or Default for none. */
export const effortLabel = (effort: Effort | null) =>
  EFFORTS.find((e) => e.id === effort)?.label ?? 'Default'

/**
 * The effort a thread with none runs at, for the slider's Default mark: the model's own,
 * else Medium, the level of today's models (and a guess for the account's own model).
 */
export const defaultEffort = (harness: TeammateHarness, model: string | null): Effort => {
  const id = runModel(harness, model)
  const models: readonly HarnessModel[] = HARNESS_MODELS[harness]
  return models.find((m) => m.id === id)?.effort ?? 'medium'
}
