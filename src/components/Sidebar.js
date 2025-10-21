import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiShoppingBag, 
  FiShoppingCart,
  FiTrendingUp, 
  FiBarChart2, 
  FiSettings,
  FiPackage,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
  color: white;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(217, 119, 6, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
`;

const SidebarHeader = styled.div`
  padding: 30px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h2`
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '🥖';
    font-size: 24px;
  }
`;

const Nav = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  margin: 4px 16px;
  border-radius: 12px;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: translateX(8px);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-left-color: #fef3c7;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
    transform: translateX(8px);
  }
`;

const NavIcon = styled.span`
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const NavText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const Sidebar = () => {
  const { hasPermission, role } = useAuth();
  
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard', permission: 'view_dashboard' },
        { path: '/admin/products', icon: FiPackage, label: 'Products', permission: 'manage_products' },
        { path: '/admin/users', icon: FiUsers, label: 'Users', permission: 'manage_settings' },
        { path: '/admin/reports', icon: FiBarChart2, label: 'Reports', permission: 'view_reports' },
        { path: '/admin/settings', icon: FiSettings, label: 'Settings', permission: 'manage_settings' }
      ];
    } else if (role === 'cashier') {
      return [
        { path: '/cashier/billing', icon: FiShoppingCart, label: 'Billing', permission: 'process_sales' },
        { path: '/cashier/sales', icon: FiShoppingBag, label: 'Sales History', permission: 'view_sales' }
      ];
    }
    return [];
  };

  const navItems = getNavItems().filter(item => hasPermission(item.permission));

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo>SE Bakers</Logo>
      </SidebarHeader>
      
      <Nav>
        {navItems.map((item) => (
          <NavItem key={item.path} to={item.path}>
            <NavIcon>
              <item.icon />
            </NavIcon>
            <NavText>{item.label}</NavText>
          </NavItem>
        ))}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;
