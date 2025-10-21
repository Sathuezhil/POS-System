import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiX, FiSave } from 'react-icons/fi';
import { usePOS } from '../../context/POSContext';

const Container = styled.div`
  padding: 24px;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(217, 119, 6, 0.3);
  }
`;

const FiltersSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #d97706;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.15);
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
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

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ProductName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px;
  text-align: center;
`;

const ProductPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
`;

const ProductCategory = styled.div`
  font-size: 12px;
  color: #d97706;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  margin-bottom: 12px;
`;

const ProductStock = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
`;

const EditButton = styled(ActionButton)`
  color: #3b82f6;
  border-color: #3b82f6;
  
  &:hover {
    background: #eff6ff;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  border-color: #dc2626;
  
  &:hover {
    background: #fef2f2;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    color: #1e293b;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #d97706;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      image: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock?.toString() || '',
      image: product.image || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      const confirmInput = document.getElementById('deleteConfirm');
      if (confirmInput && confirmInput.value === deletingProduct.name) {
        deleteProduct(deletingProduct.id);
        alert('Product deleted successfully!');
        setShowDeleteModal(false);
        setDeletingProduct(null);
      } else {
        alert('Please type the product name exactly to confirm deletion.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      emoji: formData.emoji
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      alert('Product updated successfully!');
    } else {
      addProduct(productData);
      alert('Product added successfully!');
    }

    setShowModal(false);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      emoji: '🍞'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      emoji: '🍞'
    });
  };

  return (
    <Container>
      <Header>
        <Title>Product Management</Title>
        <AddButton onClick={handleAddProduct}>
          <FiPlus />
          Add Product
        </AddButton>
      </Header>

      <FiltersSection>
        <SearchInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </FilterSelect>
      </FiltersSection>

      <ProductsGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id}>
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
            
            <ProductHeader>
              <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
            </ProductHeader>
            
            <ProductCategory>{product.category}</ProductCategory>
            <ProductStock>Stock: {product.stock || 'N/A'} units</ProductStock>
            
            <ProductActions>
              <EditButton onClick={() => handleEditProduct(product)}>
                <FiEdit size={12} />
                Edit
              </EditButton>
              <DeleteButton onClick={() => handleDeleteProduct(product)}>
                <FiTrash2 size={12} />
                Delete
              </DeleteButton>
            </ProductActions>
          </ProductCard>
        ))}
      </ProductsGrid>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <FormRow>
              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Bread">🍞 Bread</option>
                  <option value="Pastries">🥐 Pastries</option>
                  <option value="Cakes">🍰 Cakes</option>
                  <option value="Donuts">🍩 Donuts</option>
                  <option value="Muffins">🧁 Muffins</option>
                  <option value="Cookies">🍪 Cookies</option>
                  <option value="Beverages">☕ Beverages</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Product Image URL</Label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/product-image.jpg"
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Enter a URL for the product image
              </small>
            </FormGroup>

            <ModalActions>
              <CancelButton onClick={handleCloseModal}>
                Cancel
              </CancelButton>
              <SaveButton onClick={handleSaveProduct}>
                <FiSave />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </SaveButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Product</ModalTitle>
              <CloseButton onClick={cancelDelete}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <div style={{ padding: '20px 0' }}>
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{deletingProduct?.emoji}</span>
                  <div>
                    <h4 style={{ margin: '0', color: '#dc2626', fontSize: '16px' }}>
                      {deletingProduct?.name}
                    </h4>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                      {deletingProduct?.category} • ${deletingProduct?.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p style={{ margin: '0', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                  ⚠️ This product will be permanently deleted from your inventory.
                </p>
              </div>
              
              <FormGroup>
                <Label>Confirm Deletion</Label>
                <Input
                  type="text"
                  placeholder={`Type "${deletingProduct?.name}" to confirm`}
                  id="deleteConfirm"
                  style={{ marginBottom: '8px' }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Type the product name exactly to confirm deletion
                </small>
              </FormGroup>
            </div>

            <ModalActions>
              <CancelButton onClick={cancelDelete}>
                Cancel
              </CancelButton>
              <DeleteButton 
                onClick={confirmDelete}
                style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <FiTrash2 size={12} />
                Delete Product
              </DeleteButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ProductManagement;
