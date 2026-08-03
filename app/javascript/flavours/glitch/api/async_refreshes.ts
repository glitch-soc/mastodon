import { apiRequestGet } from 'flavours/glitch/api';
import type { ApiAsyncRefreshJSON } from 'flavours/glitch/api_types/async_refreshes';

export const apiGetAsyncRefresh = (id: string) =>
  apiRequestGet<ApiAsyncRefreshJSON>(`v1_alpha/async_refreshes/${id}`);
