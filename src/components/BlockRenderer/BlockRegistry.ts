import type { BlockRegistry as IBlockRegistry, BlockRegistration } from '@/types/blocks';

/**
 * Global Block Registry for managing WordPress block components
 * 
 * This registry maps block names to their corresponding React components,
 * supporting both Gutenberg core blocks and custom ACF blocks.
 */
class BlockRegistryManager implements IBlockRegistry {
  private blocks = new Map<string, BlockRegistration>();

  /**
   * Register a new block component
   */
  registerBlock(registration: BlockRegistration): void {
    if (!registration.name) {
      throw new Error('Block registration must include a name');
    }

    if (!registration.component) {
      throw new Error(`Block registration for "${registration.name}" must include a component`);
    }

    // Validate block name format
    if (!this.isValidBlockName(registration.name)) {
      throw new Error(`Invalid block name format: "${registration.name}". Expected format: "namespace/blockname"`);
    }

    this.blocks.set(registration.name, {
      category: 'custom',
      icon: 'block-default',
      description: '',
      supports: {
        html: true,
        align: false,
        anchor: false,
        className: true
      },
      ...registration
    });

    if (typeof window !== 'undefined') {
      console.log(`Block "${registration.name}" registered successfully`);
    }
  }

  /**
   * Register multiple blocks at once
   */
  registerBlocks(registrations: BlockRegistration[]): void {
    registrations.forEach(registration => this.registerBlock(registration));
  }

  /**
   * Unregister a block component
   */
  unregisterBlock(name: string): boolean {
    const deleted = this.blocks.delete(name);
    
    if (deleted && typeof window !== 'undefined') {
      console.log(`Block "${name}" unregistered successfully`);
    }
    
    return deleted;
  }

  /**
   * Get a specific block registration
   */
  getBlock(name: string): BlockRegistration | undefined {
    return this.blocks.get(name);
  }

  /**
   * Get all registered blocks
   */
  getAllBlocks(): BlockRegistration[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Check if a block is registered
   */
  hasBlock(name: string): boolean {
    return this.blocks.has(name);
  }

  /**
   * Get blocks by category
   */
  getBlocksByCategory(category: string): BlockRegistration[] {
    return this.getAllBlocks().filter(block => block.category === category);
  }

  /**
   * Get all available block names
   */
  getBlockNames(): string[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAllBlocks().forEach(block => {
      if (block.category) {
        categories.add(block.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Search blocks by name or description
   */
  searchBlocks(query: string): BlockRegistration[] {
    const searchTerm = query.toLowerCase();
    return this.getAllBlocks().filter(block => 
      block.name.toLowerCase().includes(searchTerm) ||
      block.description?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Clear all registered blocks
   */
  clear(): void {
    this.blocks.clear();
    
    if (typeof window !== 'undefined') {
      console.log('All blocks unregistered');
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalBlocks: number;
    blocksByCategory: Record<string, number>;
    coreBlocks: number;
    acfBlocks: number;
    customBlocks: number;
  } {
    const blocks = this.getAllBlocks();
    const blocksByCategory: Record<string, number> = {};
    let coreBlocks = 0;
    let acfBlocks = 0;
    let customBlocks = 0;

    blocks.forEach(block => {
      // Count by category
      const category = block.category || 'uncategorized';
      blocksByCategory[category] = (blocksByCategory[category] || 0) + 1;

      // Count by type
      if (block.name.startsWith('core/')) {
        coreBlocks++;
      } else if (block.name.startsWith('acf/')) {
        acfBlocks++;
      } else {
        customBlocks++;
      }
    });

    return {
      totalBlocks: blocks.length,
      blocksByCategory,
      coreBlocks,
      acfBlocks,
      customBlocks
    };
  }

  /**
   * Validate block name format
   */
  private isValidBlockName(name: string): boolean {
    // Block names should follow the format: namespace/blockname
    const blockNameRegex = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;
    return blockNameRegex.test(name);
  }

  /**
   * Export all registrations for debugging or migration
   */
  exportRegistrations(): Record<string, Omit<BlockRegistration, 'component'>> {
    const exported: Record<string, Omit<BlockRegistration, 'component'>> = {};
    
    this.blocks.forEach((registration, name) => {
      exported[name] = {
        name: registration.name,
        category: registration.category,
        icon: registration.icon,
        description: registration.description,
        supports: registration.supports
      };
    });

    return exported;
  }
}

// Create singleton instance
export const BlockRegistry = new BlockRegistryManager();

// Export type for external use
export type { IBlockRegistry as BlockRegistryType };

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make registry available in browser console for debugging
  (window as any).__BlockRegistry = BlockRegistry;
}

export default BlockRegistry;