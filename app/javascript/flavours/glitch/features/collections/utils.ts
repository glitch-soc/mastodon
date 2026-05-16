import { isServerFeatureEnabled } from '@/flavours/glitch/utils/environment';

export function areCollectionsEnabled() {
  return isServerFeatureEnabled('collections');
}

export const getCollectionPath = (id: string) => `/collections/${id}`;
