import { z } from 'zod';
import { tool } from 'ai';
import { GraphService } from '@/app/graph';

const graphService = new GraphService();

export const getDexPoolsTool = tool({
  description: 'Get information about DEX liquidity pools. Can fetch top pools by TVL, specific pool details, or pool statistics from protocols like Uniswap V3, SushiSwap, or PancakeSwap.',
  parameters: z.object({
    type: z.enum(['top_pools', 'pool_details']).describe('Type of pool data to fetch'),
    limit: z.number().min(1).max(100).optional().describe('Number of pools to fetch (for top pools)'),
    poolId: z.string().optional().describe('Specific pool ID to fetch details for'),
    protocol: z.enum(['uniswap_v3', 'sushiswap', 'pancakeswap']).optional()
      .describe('Specific DEX protocol to query. If not specified, defaults to Uniswap V3'),
  }),
  execute: async ({ type, limit = 10, poolId, protocol = 'uniswap_v3' }) => {
    try {
      const subgraphMap = {
        uniswap_v3: 'uniswap-v3',
        sushiswap: 'sushiswap',
        pancakeswap: 'pancakeswap'
      };
      
      const subgraphName = subgraphMap[protocol];
      const queryName = type === 'top_pools' ? 'getTopPools' : 'getPoolDetails';
      const variables = type === 'top_pools' ? { limit } : { poolId };

      const data = await graphService.getSubgraphData(subgraphName, queryName, variables);
      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});

export const getLendingMarketTool = tool({
  description: 'Get lending market data from protocols like Aave or Compound. Can fetch market statistics, user positions, or specific asset details.',
  parameters: z.object({
    type: z.enum(['market_overview', 'user_positions', 'asset_details'])
      .describe('Type of lending data to fetch'),
    protocol: z.enum(['aave_v3', 'compound_v3']).optional()
      .describe('Lending protocol to query. Defaults to Aave V3'),
    userAddress: z.string().optional().describe('User address for fetching positions'),
    assetAddress: z.string().optional().describe('Asset address for fetching specific asset details'),
  }),
  execute: async ({ type, protocol = 'aave_v3', userAddress, assetAddress }) => {
    try {
      const subgraphMap = {
        aave_v3: 'aave-v3',
        compound_v3: 'compound-v3'
      };

      const subgraphName = subgraphMap[protocol];
      let queryName: string;
      let variables = {};

      switch (type) {
        case 'market_overview':
          queryName = 'getMarketData';
          break;
        case 'user_positions':
          queryName = 'getUserData';
          variables = { userAddress };
          break;
        case 'asset_details':
          queryName = 'getAssetData';
          variables = { assetAddress };
          break;
      }

      const data = await graphService.getSubgraphData(subgraphName, queryName, variables);
      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});

export const getNFTMarketTool = tool({
  description: 'Get NFT market data from various NFT marketplaces and protocols.',
  parameters: z.object({
    type: z.enum(['collection_stats', 'token_details', 'trading_activity'])
      .describe('Type of NFT data to fetch'),
    protocol: z.enum(['opensea', 'blur', 'nft20']).optional()
      .describe('NFT protocol to query. Defaults to OpenSea'),
    collectionAddress: z.string().optional().describe('Collection address for stats'),
    tokenId: z.string().optional().describe('Token ID for specific NFT details'),
    timeRange: z.enum(['24h', '7d', '30d']).optional().describe('Time range for trading activity'),
  }),
  execute: async ({ type, protocol = 'opensea', collectionAddress, tokenId, timeRange }) => {
    try {
      const subgraphMap = {
        opensea: 'opensea',
        blur: 'blur',
        nft20: 'nft20'
      };

      const subgraphName = subgraphMap[protocol];
      let queryName: string;
      let variables = {};

      switch (type) {
        case 'collection_stats':
          queryName = 'getCollectionStats';
          variables = { collectionAddress };
          break;
        case 'token_details':
          queryName = 'getTokenDetails';
          variables = { collectionAddress, tokenId };
          break;
        case 'trading_activity':
          queryName = 'getTradingActivity';
          variables = { collectionAddress, timeRange };
          break;
      }

      const data = await graphService.getSubgraphData(subgraphName, queryName, variables);
      return {
        success: true,
        data: JSON.parse(data),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
}); 