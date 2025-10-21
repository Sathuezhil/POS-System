import React from 'react';
import styled from 'styled-components';
import { usePOS } from '../context/POSContext';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const ProductCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #cbd5e1;
  }
`;

const ProductImage = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 8px;
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
  line-height: 1.4;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #d97706;
  margin-bottom: 8px;
`;

const ProductCategory = styled.div`
  font-size: 11px;
  color: #d97706;
  background-color: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  margin-bottom: 12px;
  border: 1px solid rgba(217, 119, 6, 0.2);
`;

const AddButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
    transform: translateY(-1px);
  }
`;

const ProductGrid = () => {
  const { products, addToCart } = usePOS();

  return (
    <GridContainer>
        {products.map((product) => (
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
                fontSize: '24px',
                color: '#d97706'
              }}>
                🍞
              </div>
            </ProductImage>
            <ProductName>{product.name}</ProductName>
            <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
            <ProductCategory>{product.category}</ProductCategory>
            <AddButton>Add to Cart</AddButton>
          </ProductCard>
        ))}
    </GridContainer>
  );
};

export default ProductGrid;
