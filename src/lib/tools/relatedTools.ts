import { TOOLS, type ToolDef } from './catalog';

/** Map session/video category strings to relevant free tools */
export function toolsForCategory(category: string | undefined | null): ToolDef[] {
  const c = (category || '').toLowerCase();
  let intent: 'anxiety' | 'sleep' | 'focus' | 'general' = 'general';
  if (/sleep|rest|insomnia|nidra/.test(c)) intent = 'sleep';
  else if (/anxi|stress|calm|panic|ground/.test(c)) intent = 'anxiety';
  else if (/focus|clarity|productiv|morning/.test(c)) intent = 'focus';
  else if (/breath/.test(c)) intent = 'focus';

  const matched = TOOLS.filter((t) => t.intent.includes(intent) || t.intent.includes('general'));
  // Prefer featured + pattern tools first
  return matched
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 3);
}
