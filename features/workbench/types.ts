/**
 * Type definitions for workbench
 */

/**
 * Workbench module interface
 */
export interface IWorkbenchModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  isEnabled: boolean;
  category: string;
  order: number;
  permissions: string[];
}

/**
 * Workbench configuration
 */
export interface IWorkbenchConfig {
  modules: IWorkbenchModule[];
  categories: {
    id: string;
    name: string;
    order: number;
  }[];
}

/**
 * User preferences
 */
export interface IUserPreferences {
  enabledModules: string[];
  layout: 'grid' | 'list';
  theme: 'light' | 'dark' | 'system';
  favorites: string[];
}
