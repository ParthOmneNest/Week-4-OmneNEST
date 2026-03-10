import { render, screen,act } from '@testing-library/react';
import {DashboardHeader} from '../src/shared/components/DashboardHeader'
import axios from 'axios';

jest.mock('axios');
jest.mock('@/store',()=>({
    useUIStore: (selector:any)=> selector({activeTab:'home',setActiveTab: jest.fn() })
}))

jest.mock('@/services/apis/dashboard', () => ({
  getDashboardConfig: jest.fn(() => Promise.resolve({
    dashboard: { features: [{ name: 'Watchlist' }] }
  })),
}));


describe('DashboardHeader',()=>{
    beforeEach(()=>{
         jest.useRealTimers();

        (axios.post as jest.Mock).mockResolvedValue({
            data: {market_status: {marketStatus:'Open'}}
        })
    })

    afterEach(()=>{
        jest.clearAllMocks()
    })

    it('should render the brand name',async()=>{
        await act(async()=>{
            render(<DashboardHeader/>)
        })
        expect(screen.getByText('OmneNest')).toBeInTheDocument()
    })

    it('should render LIVE', async ()=>{
        render(<DashboardHeader/>)
        const status = await screen.findByText('LIVE')
        expect(status).toBeInTheDocument()
    })
})