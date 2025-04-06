declare global {
  interface Window {
    gtag: (
      command: 'event',
      eventName: string,
      eventParameters: {
        event_category: string;
        event_label?: string;
        value?: number;
        timestamp?: string;
        [key: string]: unknown;
      }
    ) => void;
  }
}

type EventNames = 
  | 'form_step_change'
  | 'form_submission'
  | 'theme_selection'
  | 'series_interest'
  | 'form_success'
  | 'form_error';

interface AnalyticsEvent {
  event_category: string;
  event_label?: string;
  value?: number;
}

export const trackEvent = (eventName: EventNames, properties: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
};
