import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productsAPI } from '../services/api';

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

const ProductGrid = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading products...
      </div>
    );
  }

  return (
    <GridContainer>
        {products.map((product) => (
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
                fontSize: '24px',
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
            <ProductCategory>{product.category_name || product.category || 'No Category'}</ProductCategory>
            <AddButton>Add to Cart</AddButton>
          </ProductCard>
        ))}
    </GridContainer>
  );
};

export default ProductGrid;
