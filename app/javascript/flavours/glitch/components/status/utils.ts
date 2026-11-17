import type { AccountShape } from '@/flavours/glitch/models/account';
import type { AccountStatusShape } from '@/flavours/glitch/models/status';

import type { StatusImageAttachmentJSON } from './types';

export function statusLink({
  account,
  id,
}: Pick<AccountStatusShape, 'account' | 'id'>) {
  return `/@${account.acct}/${id}`;
}

export function accountStatusLinkProps(
  account: Pick<AccountShape, 'acct' | 'id'>,
) {
  return {
    to: {
      pathname: `/@${account.acct}`,
      state: { reference: 'status' },
    },
    title: `@${account.acct}`,
    'data-id': account.id,
    'data-hover-card-account': account.id,
    'data-hover-card-reference': 'status',
  };
}

export function attachmentAspectRatio(
  attachment?: Pick<StatusImageAttachmentJSON, 'meta'>,
) {
  const width = attachment?.meta?.original?.width;
  const height = attachment?.meta?.original?.height;

  if (!width || !height) {
    return undefined;
  }

  return `${width} / ${height}`;
}
