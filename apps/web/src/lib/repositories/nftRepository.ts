import { createClient } from '@supabase/supabase-js';
import { NFT } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface NFTTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  rarity: string;
  baseValue: number;
  mintConditions: Record<string, any>;
}

export class NFTRepository {
  /**
   * Get all NFTs for a specific user
   */
  async getUserNFTs(userId: string): Promise<NFT[]> {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('owner_id', userId)
      .order('mint_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user NFTs: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToNFT) || [];
  }

  /**
   * Get NFT by ID for a specific user
   */
  async getNFTById(nftId: string, userId: string): Promise<NFT | null> {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('id', nftId)
      .eq('owner_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch NFT by ID: ${error.message}`);
    }

    return data ? this.mapDatabaseToNFT(data) : null;
  }

  /**
   * Mint a new NFT for a user
   */
  async mintNFT(nftId: string, userId: string, templateId: string): Promise<NFT> {
    // First get the template
    const template = await this.getNFTTemplate(templateId);
    if (!template) {
      throw new Error(`NFT template not found: ${templateId}`);
    }

    const nftData = {
      id: nftId,
      owner_id: userId,
      name: template.name,
      description: template.description,
      image_url: template.imageUrl,
      rarity: template.rarity,
      base_value: template.baseValue,
      dynamic_properties: {},
      is_featured: false,
    };

    const { data, error } = await supabase
      .from('nfts')
      .insert([nftData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }

    return this.mapDatabaseToNFT(data);
  }

  /**
   * Update NFT featured status
   */
  async setFeatured(nftId: string, userId: string, isFeatured: boolean): Promise<NFT> {
    const { data, error } = await supabase
      .from('nfts')
      .update({ is_featured: isFeatured })
      .eq('id', nftId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update NFT featured status: ${error.message}`);
    }

    return this.mapDatabaseToNFT(data);
  }

  /**
   * Update NFT dynamic properties
   */
  async updateDynamicProperties(
    nftId: string,
    userId: string,
    properties: Record<string, any>
  ): Promise<NFT> {
    const { data, error } = await supabase
      .from('nfts')
      .update({ dynamic_properties: properties })
      .eq('id', nftId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update NFT dynamic properties: ${error.message}`);
    }

    return this.mapDatabaseToNFT(data);
  }

  /**
   * Get NFT template by ID
   */
  async getNFTTemplate(templateId: string): Promise<NFTTemplate | null> {
    const { data, error } = await supabase
      .from('nft_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch NFT template: ${error.message}`);
    }

    return data ? this.mapDatabaseToNFTTemplate(data) : null;
  }

  /**
   * Get all available NFT templates
   */
  async getNFTTemplates(): Promise<NFTTemplate[]> {
    const { data, error } = await supabase
      .from('nft_templates')
      .select('*')
      .order('rarity', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch NFT templates: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToNFTTemplate) || [];
  }

  /**
   * Map database row to NFT interface
   */
  private mapDatabaseToNFT(row: any): NFT {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      rarity: row.rarity,
      mintDate: new Date(row.mint_date),
      dynamicProperties: row.dynamic_properties || {},
      isFeatured: row.is_featured,
      baseValue: parseFloat(row.base_value),
    };
  }

  /**
   * Map database row to NFTTemplate interface
   */
  private mapDatabaseToNFTTemplate(row: any): NFTTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      rarity: row.rarity,
      baseValue: parseFloat(row.base_value),
      mintConditions: row.mint_conditions || {},
    };
  }
}