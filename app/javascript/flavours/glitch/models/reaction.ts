import type { RecordOf } from 'immutable';

import type { ApiStatusReactionJSON } from 'flavours/glitch/api_types/reaction';

type StatusReactionShape = Required<ApiStatusReactionJSON>;
export type StatusReaction = RecordOf<StatusReactionShape>;

export type StatusReactionMap = Immutable.Map<string, unknown>;
