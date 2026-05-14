import { useMemo } from 'react';

import type { Map as ImmutableMap } from 'immutable';

import { ensureGamepatchCard } from 'gamepatch-card-runtime';
ensureGamepatchCard();
import 'gamepatch-card-styles';

type Payload = ImmutableMap<string, unknown>;

type Props = {
  payload: Payload;
};

const toPlain = (value: unknown) => {
  if (value && typeof (value as { toJS?: () => unknown }).toJS === 'function') {
    return (value as { toJS: () => unknown }).toJS();
  }
  return value;
};

const safeStringify = (value: unknown): string | undefined => {
  const plain = toPlain(value);
  if (plain === undefined) return undefined;
  try {
    return JSON.stringify(plain);
  } catch {
    return undefined;
  }
};

export const GamepatchCard: React.FC<Props> = ({ payload }) => {
  if (!payload) return null;

  const uid = payload.get('uid') as string | undefined;
  if (!uid) return null;

  const api = `/gamepatch/api/cards/${uid}`;
  const cardInstanceId = payload.get('card_instance_id');

  const definitionJson = useMemo(
    () => safeStringify(payload.get('definition')),
    [payload],
  );
  const hostConfigJson = useMemo(
    () => safeStringify(payload.get('host_config')),
    [payload],
  );
  const contextJson = useMemo(
    () => safeStringify(payload.get('context')),
    [payload],
  );
  const stateJson = useMemo(
    () => safeStringify(payload.get('state')),
    [payload],
  );
  const dataJson = useMemo(() => safeStringify(payload.get('data')), [payload]);

  return (
    <gamepatch-card
      data-uid={uid}
      data-api={api}
      data-card-instance-id={cardInstanceId ?? undefined}
      data-definition={definitionJson}
      data-host-config={hostConfigJson}
      data-context={contextJson}
      data-state={stateJson}
      data-data={dataJson}
    />
  );
};
