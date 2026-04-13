import { rowToInfographic } from './db';
import type { Infographic } from '../types';

export const INFOGRAPHICS_PAGE_SIZE = 24;

export async function getPublishedInfographicsPage(
  db: any,
  page: number,
): Promise<{ infographics: Infographic[]; total: number; totalPages: number; page: number }> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const offset = (safePage - 1) * INFOGRAPHICS_PAGE_SIZE;

  const countRes = await db.prepare(
    "SELECT COUNT(*) as c FROM infographics WHERE status = 'published'"
  ).first<{ c: number }>();
  const total = countRes?.c || 0;
  const totalPages = Math.max(1, Math.ceil(total / INFOGRAPHICS_PAGE_SIZE));

  const { results } = await db.prepare(
    "SELECT * FROM infographics WHERE status = 'published' ORDER BY published_at DESC LIMIT ? OFFSET ?"
  ).bind(INFOGRAPHICS_PAGE_SIZE, offset).all();

  const infographics = (results || []).map((row: any) => rowToInfographic(row));
  return { infographics, total, totalPages, page: safePage };
}
