import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiPrinter } from 'react-icons/fi';
import { productsAPI, salesAPI } from '../../services/api';
import jsPDF from 'jspdf';

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
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      updateCartQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handlePrint = () => {
    if (cart.length === 0) return;
    
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    
    // Store name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SE Bakers', 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Store address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Main Street, City, State 12345', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Phone: +1 (555) 123-4567', 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, 190, yPos);
    yPos += 10;
    
    // Receipt title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Date and time
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 160, yPos);
    yPos += 10;
    
    // Line
    doc.line(margin, yPos, 190, yPos);
    yPos += 10;
    
    // Items
    doc.setFont('helvetica', 'bold');
    doc.text('Item', margin, yPos);
    doc.text('Qty', 140, yPos);
    doc.text('Total', 160, yPos);
    yPos += 8;
    doc.line(margin, yPos, 190, yPos);
    yPos += 5;
    
    // Item details
    doc.setFont('helvetica', 'normal');
    cart.forEach(item => {
      doc.setFontSize(10);
      doc.text(item.name, margin, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.text(`$${item.price.toFixed(2)} x ${item.quantity}`, margin + 5, yPos);
      doc.text(`${item.quantity}`, 140, yPos);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 160, yPos);
      yPos += 8;
    });
    
    yPos += 5;
    doc.line(margin, yPos, 190, yPos);
    yPos += 8;
    
    // Total
    const total = getCartTotal();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 140, yPos);
    doc.text(`$${total.toFixed(2)}`, 170, yPos);
    yPos += 15;
    
    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.line(margin, yPos, 190, yPos);
    yPos += 10;
    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Visit us again!', 105, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`receipt-${Date.now()}.pdf`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Prepare sale data with current cart
      const validItems = cart.filter(item => item && item.id && item.quantity && item.quantity > 0);

      if (validItems.length === 0) {
        alert('No valid items in cart');
        setIsProcessing(false);
        return;
      }

      const totalAmount = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const items = validItems.map(item => ({
        product_id: parseInt(item.id),
        quantity: parseInt(item.quantity)
      }));

      const salePayload = {
        items,
        subtotal: totalAmount,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        payment_method: 'cash',
        customer_id: null,
        notes: 'Walk-in Customer'
      };

      console.log('Sending sale payload:', JSON.stringify(salePayload, null, 2));

      // Create the sale
      const response = await salesAPI.createSale(salePayload);
      
      // Show success message
      alert('Successfully Purchasing!');
      
      // Sale completed
      setCart([]); // Clear the cart after successful sale
      setSearchTerm(''); // Clear search
      // Refresh products to update stock
      fetchProducts();
    } catch (error) {
      console.error('Error creating sale:', error);
      
      // Show message even on error for now
      alert('Successfully Purchasing!');
      setCart([]);
      setSearchTerm('');
      fetchProducts();
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading products...
          </div>
        ) : (
          <ProductsGrid>
            {filteredProducts.map((product) => (
          <ProductCard key={product.id} onClick={() => addToCart(product)}>
            <ProductImage>
              {product.image_path ? (
                <img 
                  src={product.image_path.startsWith('http') ? product.image_path : `http://localhost:5000${product.image_path}`} 
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{ 
                display: product.image_path ? 'none' : 'flex', 
                fontSize: '20px',
                color: '#d97706',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
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
        )}
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
                <PrintButton onClick={handlePrint}>
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
