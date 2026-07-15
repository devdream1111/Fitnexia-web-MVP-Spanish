import { MOBILE_APP_LABELS } from '@/constants/labels';
import { AppStoreBadges } from './app-store-badges';

/** Footer download band — horizontal promo with store badges. */
export function GetTheAppBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`fn-footer-app ${className}`.trim()}>
      <div className="fn-footer-app__copy">
        <h3 className="fn-footer-app__title">{MOBILE_APP_LABELS.title}</h3>
        <p className="fn-footer-app__subtitle">{MOBILE_APP_LABELS.subtitle}</p>
      </div>
      <AppStoreBadges tone="footer" className="fn-footer-app__badges" />
    </div>
  );
}
