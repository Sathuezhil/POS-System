import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiPrinter } from 'react-icons/fi';
import { usePOS } from '../../context/POSContext';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  background: transparent;
  height: calc(100vh - 70px);
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SearchSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #d97706;
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 8px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #d97706;
  margin-bottom: 8px;
`;

const ProductCategory = styled.div`
  font-size: 11px;
  color: #d97706;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
`;

const CartSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
`;

const CartHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const CartTitle = styled.h2`
  font-size: 18px;
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
  padding: 16px 0;
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
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const TotalSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const TotalAmount = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #d97706;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const CheckoutButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const PrintButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const Billing = () => {
  const { products, cart, getCartTotal, addToCart, updateCartQuantity, removeFromCart, processSale } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Container>
      <LeftSection>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchSection>

        <ProductsGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} onClick={() => addToCart(product)}>
            <ProductImage>
              <img 
                src={product.image} 
                alt={product.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ 
                display: 'none', 
                fontSize: '20px',
                color: '#d97706'
              }}>
                🍞
              </div>
            </ProductImage>
            <ProductName>{product.name}</ProductName>
            <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
            <ProductCategory>{product.category}</ProductCategory>
          </ProductCard>
        ))}
        </ProductsGrid>
      </LeftSection>

      <CartSection>
        <CartHeader>
          <CartTitle>Current Order ({cart.length} items)</CartTitle>
        </CartHeader>
        
        {cart.length === 0 ? (
          <EmptyCart>
            <p>Your cart is empty</p>
            <p>Add products to get started</p>
          </EmptyCart>
        ) : (
          <>
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
              
              <ActionButtons>
                <CheckoutButton 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  <FiCreditCard />
                  {isProcessing ? 'Processing...' : 'Checkout'}
                </CheckoutButton>
                <PrintButton>
                  <FiPrinter />
                  Print
                </PrintButton>
              </ActionButtons>
            </CartFooter>
          </>
        )}
      </CartSection>
    </Container>
  );
};

export default Billing;
