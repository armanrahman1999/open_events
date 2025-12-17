import { MenuItem } from '../models/sidebar';

const createMenuItem = (
  id: string,
  name: string,
  path: string,
  icon?: MenuItem['icon'],
  options: Partial<Omit<MenuItem, 'id' | 'name' | 'path' | 'icon'>> = {}
): MenuItem => ({
  id,
  name,
  path,
  icon,
  ...options,
});

export const menuItems: MenuItem[] = [
  createMenuItem('dashboard', 'DASHBOARD', '/dashboard', 'LayoutDashboard', {
    isIntegrated: true,
  }),
  createMenuItem('finance', 'COMMUNITIES', '/finance', 'ChartNoAxesCombined'),
  createMenuItem('iam', 'EVENTS', '/events', 'Users', {
    isIntegrated: true,
  }),
  createMenuItem('inventory', 'CATAGORIES', '/inventory', 'Store', { isIntegrated: true }),
  createMenuItem('invoices', 'INVOICES', '/invoices', 'ReceiptText', {
    isIntegrated: true,
  }),

  createMenuItem('task-manager', 'USERS', '/task-manager', 'Presentation', {
    isIntegrated: true,
  }),
];
