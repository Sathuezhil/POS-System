import React, { useState } from 'react';
import styled from 'styled-components';
import { FiTrash2, FiMinus, FiPlus, FiCreditCard } from 'react-icons/fi';
import { usePOS } from '../context/POSContext';

const CartContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CartHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
`;

const CartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CartItems = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  font-size: 12px;
  color: #666;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Quantity = styled.span`
  font-size: 14px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #ffeaea;
  }
`;

const CartFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e9ecef;
`;

const TotalSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TotalLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TotalAmount = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #27ae60;
`;

const CheckoutButton = styled.button`
  width: 100%;
  background-color: #059669;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #047857;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const Cart = () => {
  const { cart, getCartTotal, updateCartQuantity, removeFromCart, processSale, loading } = usePOS();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await processSale({
        paymentMethod: 'cash',
        customerName: 'Walk-in Customer'
      });
      
      if (result.success) {
        alert('Sale completed successfully!');
      } else {
        alert('Error processing sale: ' + result.error);
      }
    } catch (error) {
      alert('Error processing sale: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <CartContainer>
        <CartHeader>
          <CartTitle>Shopping Cart</CartTitle>
        </CartHeader>
        <EmptyCart>
          <p>Your cart is empty</p>
          <p>Add products to get started</p>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <CartHeader>
        <CartTitle>Shopping Cart ({cart.length} items)</CartTitle>
      </CartHeader>
      
      <CartItems>
        {cart.map((item) => (
          <CartItem key={item.id}>
            <ItemInfo>
              <ItemName>{item.name}</ItemName>
              <ItemPrice>${item.price.toFixed(2)} each</ItemPrice>
            </ItemInfo>
            
            <QuantityControls>
              <QuantityButton 
                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
              >
                <FiMinus size={12} />
              </QuantityButton>
              <Quantity>{item.quantity}</Quantity>
              <QuantityButton 
                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
              >
                <FiPlus size={12} />
              </QuantityButton>
            </QuantityControls>
            
            <RemoveButton onClick={() => removeFromCart(item.id)}>
              <FiTrash2 size={14} />
            </RemoveButton>
          </CartItem>
        ))}
      </CartItems>
      
      <CartFooter>
        <TotalSection>
          <TotalLabel>Total:</TotalLabel>
          <TotalAmount>${getCartTotal().toFixed(2)}</TotalAmount>
        </TotalSection>
        
        <CheckoutButton 
          onClick={handleCheckout}
          disabled={isProcessing || loading}
        >
          <FiCreditCard />
          {isProcessing ? 'Processing...' : 'Checkout'}
        </CheckoutButton>
      </CartFooter>
    </CartContainer>
  );
};

export default Cart;
