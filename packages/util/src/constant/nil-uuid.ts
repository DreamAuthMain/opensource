import { type UuidLike } from '../predicate/is-uuid.js';

/**
 * A nil UUID is a special UUID which is all zeros.
 */
export const NilUuid = '00000000-0000-0000-0000-000000000000' satisfies UuidLike;
