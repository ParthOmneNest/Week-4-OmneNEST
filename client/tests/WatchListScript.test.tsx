import { render, screen } from '@testing-library/react';
import { WatchListScriptTable } from '@/features/dashboard/WatchListScriptTable';
import { getWatchlistScripts } from '@/services/apis/watchlist';

// Mock the API
jest.mock('@/services/apis/watchlist');
const mockedGetScripts = getWatchlistScripts as jest.Mock;

describe('WatchListScriptTable', () => {
    const mockApiData = {
        scrips: [
            {
                scripToken: "1270",
                companyName: "AMBUJA CEMENTS LTD",
                exchange: "NSE",
                openPrice: 459.1,
                previousClosePrice: 451.95,
                volumeTradedToday: 2221924,
                lotSize: 1
            },
            {
                scripToken: "438",
                companyName: "BHEL",
                exchange: "NSE",
                openPrice: 259.1,
                previousClosePrice: 255.4,
                volumeTradedToday: 6103027,
                lotSize: 1
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the script table with real API data format', async () => {
        mockedGetScripts.mockResolvedValue(mockApiData);

        render(<WatchListScriptTable watchlistId={123} />);

        const ambuja = await screen.findByText('AMBUJA CEMENTS LTD');
        expect(ambuja).toBeInTheDocument();
        expect(screen.getByText('BHEL')).toBeInTheDocument();

        expect(screen.getByText('₹459.10')).toBeInTheDocument();
        expect(screen.getByText('₹255.40')).toBeInTheDocument();

        const formattedVolume = (2221924).toLocaleString();
        expect(screen.getByText(formattedVolume)).toBeInTheDocument();

        const nseLabels = screen.getAllByText('NSE');
        expect(nseLabels.length).toBe(2);
    });

    it('handles missing openPrice by showing 0.00', async () => {
        mockedGetScripts.mockResolvedValue({
            scrips: [{
                scripToken: "853866",
                companyName: "RELIANCE OPT",
                openPrice: null, 
                previousClosePrice: 49.3,
                lotSize: 500
            }]
        });

        render(<WatchListScriptTable watchlistId={123} />);

        const fallbackPrice = await screen.findByText('₹0.00');
        expect(fallbackPrice).toBeInTheDocument();
    });
});
