import api, { apiRequestPut, getAsyncRefreshHeader } from 'flavours/glitch/api';
import type {
  ApiContextJSON,
  ApiStatusJSON,
} from 'flavours/glitch/api_types/statuses';

import type { ApiQuotePolicy } from '../api_types/quotes';

export const apiGetContext = async (statusId: string) => {
  const response = await api().request<ApiContextJSON>({
    method: 'GET',
    url: `/api/v1/statuses/${statusId}/context`,
  });

  return {
    context: response.data,
    refresh: getAsyncRefreshHeader(response),
  };
};

export const apiSetQuotePolicy = async (
  statusId: string,
  policy: ApiQuotePolicy,
) => {
  return apiRequestPut<ApiStatusJSON>(
    `v1/statuses/${statusId}/interaction_policy`,
    {
      quote_approval_policy: policy,
    },
  );
};
