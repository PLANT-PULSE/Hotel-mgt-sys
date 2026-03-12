import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface AdminConfig {
  activities: {
    bookingManagement: string[];
    roomManagement: string[];
    calendarOccupancy: string[];
    guestManagement: string[];
    revenueAnalytics: string[];
    systemControls: string[];
  };
}

export interface UserConfig {
  [key: string]: any;
}

let adminConfigCache: AdminConfig | null = null;
let userConfigCache: UserConfig | null = null;

export function loadAdminConfig(): AdminConfig {
  if (adminConfigCache) return adminConfigCache;

  try {
    const configPath = path.join(process.cwd(), 'config.admin.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as AdminConfig;
    adminConfigCache = config;
    return config;
  } catch (error) {
    console.error('[Config] Failed to load admin config:', error);
    return {
      activities: {
        bookingManagement: [],
        roomManagement: [],
        calendarOccupancy: [],
        guestManagement: [],
        revenueAnalytics: [],
        systemControls: [],
      },
    };
  }
}

export function loadUserConfig(): UserConfig {
  if (userConfigCache) return userConfigCache;

  try {
    const configPath = path.join(process.cwd(), 'config.user.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as UserConfig;
    userConfigCache = config;
    return config;
  } catch (error) {
    console.error('[Config] Failed to load user config:', error);
    return {};
  }
}

export function getAdminConfig(): AdminConfig {
  return loadAdminConfig();
}

export function getUserConfig(): UserConfig {
  return loadUserConfig();
}

export function reloadConfigs(): void {
  adminConfigCache = null;
  userConfigCache = null;
}
