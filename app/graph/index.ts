import { createClient, Client, gql } from 'urql';
import { readFileSync } from 'fs';
import path from 'path';

interface SubgraphConfig {
  name: string;
  subgraphId: string;
  queries: {
    [key: string]: string;
  };
}

interface GraphConfig {
  subgraphs: SubgraphConfig[];
}

export class GraphService {
  private config: GraphConfig;
  private clients: Map<string, Client> = new Map();
  private readonly GRAPH_API_KEY: string;
  private readonly GRAPH_GATEWAY_URL = 'https://gateway.thegraph.com/api';

  constructor() {
    // Check for required environment variable
    if (!process.env.THEGRAPH_API_KEY) {
      throw new Error('THEGRAPH_API_KEY environment variable is not set');
    }
    this.GRAPH_API_KEY = process.env.THEGRAPH_API_KEY;
    
    this.loadConfig();
    this.initializeClients();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(process.cwd(), 'config', 'graph-config.json');
      const configFile = readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configFile);
    } catch (error) {
      throw new Error('Failed to load graph configuration: ' + error);
    }
  }

  private constructEndpointUrl(subgraphId: string): string {
    return `${this.GRAPH_GATEWAY_URL}/${this.GRAPH_API_KEY}/subgraphs/id/${subgraphId}`;
  }

  private initializeClients(): void {
    this.config.subgraphs.forEach(subgraph => {
      const url = this.constructEndpointUrl(subgraph.subgraphId);
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.GRAPH_API_KEY}`
      };

      const client = createClient({
        url,
        fetchOptions: {
          headers,
        },
        requestPolicy: 'network-only', // Ensures fresh data
      });

      this.clients.set(subgraph.name, client);
    });
  }

  async querySubgraph(subgraphName: string, queryName: string, variables: any = {}): Promise<any> {
    const subgraph = this.config.subgraphs.find(sg => sg.name === subgraphName);
    const client = this.clients.get(subgraphName);
    
    if (!subgraph || !client) {
      throw new Error(`Subgraph ${subgraphName} not found in configuration`);
    }

    const queryTemplate = subgraph.queries[queryName];
    if (!queryTemplate) {
      throw new Error(`Query ${queryName} not found for subgraph ${subgraphName}`);
    }

    try {
      const query = gql`${queryTemplate}`;
      const { data, error } = await client.query(query, variables).toPromise();
      
      if (error) {
        throw new Error(Array.isArray(error) ? error[0].message : error.message);
      }

      if (!data) {
        throw new Error('No data returned from the subgraph');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query subgraph: ${error.message}`);
      }
      throw new Error('An unknown error occurred while querying the subgraph');
    }
  }

  async getSubgraphData(subgraphName: string, queryName: string, variables: any = {}): Promise<string> {
    try {
      const data = await this.querySubgraph(subgraphName, queryName, variables);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      if (error instanceof Error) {
        return `Error fetching data: ${error.message}`;
      }
      return 'An unknown error occurred';
    }
  }

  // Helper method to get available subgraphs
  getAvailableSubgraphs(): string[] {
    return this.config.subgraphs.map(sg => sg.name);
  }

  // Helper method to get available queries for a subgraph
  getAvailableQueries(subgraphName: string): string[] {
    const subgraph = this.config.subgraphs.find(sg => sg.name === subgraphName);
    if (!subgraph) {
      return [];
    }
    return Object.keys(subgraph.queries);
  }
}
