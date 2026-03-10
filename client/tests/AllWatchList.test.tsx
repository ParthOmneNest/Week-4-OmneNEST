import { render, screen } from '@testing-library/react';
import { AllWatchList } from '@/features/dashboard/AllWatchList';
import { getWatchList } from '@/services/apis/watchlist';

jest.mock('@/services/apis/watchlist')

const mockedGetWatchList = getWatchList as jest.Mock;

describe('AllWatchList',()=>{

        it('renders watchlist names from the API response', async () => {
        mockedGetWatchList.mockResolvedValue({
            userDefinedWatchlists: [{
            "watchlistName": "eqw",
            "watchlistId": 1321
        },
        {
            "watchlistName": "roko",
            "watchlistId": 1780
        },
        {
            "watchlistName": "tuko",
            "watchlistId": 1785
        }],
            predefinedWatchlists: [{ watchlistId: 916, watchlistName: 'W1' }],
            defaultWatchlistId: 1785,
        });
    

        render(<AllWatchList />);
        expect(screen.getByText(/SYNCING WATCHLISTS/i)).toBeInTheDocument();

             const firstList = await screen.findByText('EQW');
        const secondList = await screen.findByText('ROKO');

        expect(firstList).toBeInTheDocument();
        expect(secondList).toBeInTheDocument();
        expect(screen.getByText('4 available lists')).toBeInTheDocument();
    })
})