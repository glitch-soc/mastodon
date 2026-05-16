import type { RecordOf } from 'immutable';

import type { ApiCollectionJSON } from 'flavours/glitch/api_types/collections';
import type { ApiPreviewCardJSON } from 'flavours/glitch/api_types/statuses';

export type { StatusVisibility } from 'flavours/glitch/api_types/statuses';

// Temporary until we type it correctly
export type Status = Immutable.Map<string, unknown>;

export type Card = RecordOf<ApiPreviewCardJSON>;

export type MediaAttachment = Immutable.Map<string, unknown>;

export type CollectionAttachment = RecordOf<ApiCollectionJSON>;
