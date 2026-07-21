import {and, eq, inArray} from 'drizzle-orm';
import {getDb, hasDatabase} from '..';
import {translations} from '../schema';
import {demoTranslations} from '@/lib/demo-data';
import type {TranslationRow} from '@/lib/types';

const BASE_LOCALE = 'en';

type FieldMap = Map<string, string>; // field -> translated value

/**
 * Loads data-level translations for a set of entities and returns a map
 * entityId -> (field -> value). Falls back to the bundled demo translations
 * when no database is configured.
 */
export async function loadTranslations(
  entityType: string,
  entityIds: string[],
  locale: string
): Promise<Map<string, FieldMap>> {
  const result = new Map<string, FieldMap>();
  if (locale === BASE_LOCALE || entityIds.length === 0) return result;

  let rows: TranslationRow[];
  if (hasDatabase()) {
    const db = getDb();
    rows = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, entityType),
          eq(translations.locale, locale),
          inArray(translations.entityId, entityIds)
        )
      );
  } else {
    rows = demoTranslations.filter(
      (t) =>
        t.entityType === entityType &&
        t.locale === locale &&
        entityIds.includes(t.entityId)
    );
  }

  for (const row of rows) {
    const fields = result.get(row.entityId) ?? new Map<string, string>();
    fields.set(row.field, row.value);
    result.set(row.entityId, fields);
  }
  return result;
}

/** Applies translated fields onto an entity, keeping base values as fallback. */
export function applyTranslation<T extends {id: string}>(
  entity: T,
  translationsById: Map<string, FieldMap>,
  fields: Array<keyof T & string>
): T {
  const fieldMap = translationsById.get(entity.id);
  if (!fieldMap) return entity;
  const patch: Partial<Record<string, string>> = {};
  for (const field of fields) {
    const value = fieldMap.get(field);
    if (value) patch[field] = value;
  }
  return {...entity, ...patch};
}
