import { apiRequestGet } from 'flavours/glitch/api';
import type { ApiAccountJSON } from 'flavours/glitch/api_types/accounts';

export const apiGetDirectory = (
  params: {
    order: string;
    local: boolean;
    offset?: number;
  },
  limit = 20,
) =>
  apiRequestGet<ApiAccountJSON[]>('v1/directory', {
    ...params,
    limit,
  });
