import type {
  AccountStatusShape,
  StatusShape,
} from '@/flavours/glitch/models/status';

export function statusLink({
  account,
  id,
}: Pick<StatusShape | AccountStatusShape, 'account' | 'id'>) {
  return `/@${typeof account === 'string' ? account : account.acct}/${id}`;
}
