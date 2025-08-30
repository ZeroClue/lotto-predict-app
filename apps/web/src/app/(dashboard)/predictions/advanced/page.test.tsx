import { render, screen } from '@testing-library/react';
import AdvancedAnalyticsPage from './page';

// Mock the components that are used in the page
jest.mock('../../../../features/lottery/components/EntertainmentDisclaimer', () => ({
  EntertainmentDisclaimer: () => <div>EntertainmentDisclaimer</div>,
}));
jest.mock('../../../../features/lottery/components/AnalyticsFilters', () => ({
  AnalyticsFilters: () => <div>AnalyticsFilters</div>,
}));
jest.mock('../../../../features/lottery/components/NumberFrequencyChart', () => ({
  NumberFrequencyChart: () => <div>NumberFrequencyChart</div>,
}));
jest.mock('../../../../features/lottery/components/TrendAnalysisChart', () => ({
  TrendAnalysisChart: () => <div>TrendAnalysisChart</div>,
}));

describe('AdvancedAnalyticsPage', () => {
  it('renders the main heading', () => {
    render(<AdvancedAnalyticsPage />);
    const heading = screen.getByRole('heading', {
      name: /advanced lottery analytics/i
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the disclaimer', () => {
    render(<AdvancedAnalyticsPage />);
    expect(screen.getByText('EntertainmentDisclaimer')).toBeInTheDocument();
  });

  it('renders the filter component', () => {
    render(<AdvancedAnalyticsPage />);
    expect(screen.getByText('AnalyticsFilters')).toBeInTheDocument();
  });

  it('renders the chart components', () => {
    render(<AdvancedAnalyticsPage />);
    expect(screen.getByText('NumberFrequencyChart')).toBeInTheDocument();
    expect(screen.getByText('TrendAnalysisChart')).toBeInTheDocument();
  });

  it('renders a link back to the predictions page', () => {
    render(<AdvancedAnalyticsPage />);
    const link = screen.getByRole('link', { name: /back to predictions/i });
    expect(link).toHaveAttribute('href', '/predictions');
  });
});