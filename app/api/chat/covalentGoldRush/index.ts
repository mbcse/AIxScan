import { Chain, GoldRushClient } from "@covalenthq/client-sdk";

// Replace with your Covalent API key
const API_KEY = process.env.GOLDRUSH_API_KEY || '';
const client = new GoldRushClient(API_KEY);

class CovalentHelper {
    static async getTransactionDetails(chainId: Chain, transactionHash: string) {
        console.log("Fetching transaction details for:", { chainId, transactionHash });
        try {
            const response = await client.TransactionService.getTransaction(
                chainId,
                transactionHash
            );
            console.log(response)
            console.log("Transaction details fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching transaction details:", error);
            return null;
        }
    }

    static async getUserBalance(chainId: Chain, walletAddress: string) {
        console.log("Fetching user balance for:", { chainId, walletAddress });
        try {
            const response = await client.BalanceService.getTokenBalancesForWalletAddress(
                chainId,
                walletAddress
            );
            console.log("User balance fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user balance:", error);
            return null;
        }
    }

    static async getNftDetails(chainId: Chain, walletAddress: string) {
        console.log("Fetching NFT details for:", { chainId, walletAddress });
        try {
            const response = await client.NftService.getNftsForAddress(
                chainId,
                walletAddress
            );
            console.log("NFT details fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching NFT details:", error);
            return null;
        }
    }

    static async getTokenDetails(chainId: Chain, tokenAddress: string) {
        console.log("Fetching token details for:", { chainId, tokenAddress });
        try {
            const response = await client.BalanceService.getTokenBalancesForWalletAddress(
                chainId,
                tokenAddress
            );
            console.log("Token details fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching token details:", error);
            return null;
        }
    }
}

export default CovalentHelper;