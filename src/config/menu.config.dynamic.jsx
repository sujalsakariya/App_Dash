import { getUserRole, getFilteredMenuItems } from '@/utils/RoleUtils';

// Base menu configuration
const BASE_MENU_SIDEBAR = [{
  title: 'Dashboards',
  icon: 'element-11',
  path: '/'
}, {
  heading: 'Leads Data'
}, {
  title: 'LM Leads',
  icon: 'questionnaire-tablet',
  path: '/Leads'
}, 
// {
//   title: 'DP Leads',
//   icon: 'menu',
//   path: '/DPLeads'
// }, 
{
  title: 'All Leads',
  icon: 'users',
  path: '/AllLeads'
},
{
  title: 'Dispositions',
  icon: 'badge',
  path: '/Dispositions'
}, 
{
  heading: 'Sales'
}, {
  title: 'Sales',
  icon: 'handcart',
  path: '/Sales'
}, 
{
  heading: 'Payments'
}, {
  title: 'Payments',
  icon: 'dollar',
  path: '/Payments'
},
{
  heading: 'Expenses'
}, {
  title: 'Expense',
  icon: 'bill',
  path: '/Expense'
}];

// Function to get menu based on user role
export const getMenuSidebar = () => {
  const userRole = getUserRole();
  return getFilteredMenuItems(BASE_MENU_SIDEBAR, userRole);
};

// Export the base menu for backward compatibility
export const MENU_SIDEBAR = BASE_MENU_SIDEBAR;
