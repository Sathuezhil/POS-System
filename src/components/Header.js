import React from 'react';
import styled from 'styled-components';
import { FiShoppingCart, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { usePOS } from '../context/POSContext';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-bottom: 1px solid rgba(217, 119, 6, 0.3);
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(217, 119, 6, 0.2);
  position: relative;
  z-index: 10;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CartInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }
`;

const CartIcon = styled(FiShoppingCart)`
  font-size: 18px;
`;

const CartText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const Header = () => {
  const { getCartItemCount, getCartTotal } = usePOS();
  const { user, role, logout } = useAuth();

  return (
    <HeaderContainer>
      <LeftSection>
      </LeftSection>
      
      <RightSection>
       
        
        <UserSection>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <FiUser size={16} />
            <span>{user?.username} ({role})</span>
          </div>
          <UserButton title="Logout" onClick={logout}>
            <FiLogOut size={18} />
          </UserButton>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
