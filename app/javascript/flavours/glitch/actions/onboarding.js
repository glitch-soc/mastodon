import { changeSetting, saveSettings } from './settings';

// Increment this to force the onboarding modal to show again.
export const INTRODUCTION_VERSION = 1;

export const closeOnboarding = () => dispatch => {
  dispatch(changeSetting(['introductionVersion'], INTRODUCTION_VERSION));
  dispatch(saveSettings());
};
