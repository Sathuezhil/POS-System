import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiX, FiSave } from 'react-icons/fi';
import { productsAPI, uploadAPI } from '../../services/api';

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
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    imagePath: '',
    selectedFile: null
  });

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await productsAPI.getProducts({ _t: Date.now() });
      setProducts(response.data.products);
      console.log('📦 Products fetched:', response.data.products.length);
      response.data.products.forEach(product => {
        console.log(`  - ${product.name}: ${product.image_path ? 'Has image' : 'No image'}`);
        if (product.image_path) {
          console.log(`    Image URL: http://localhost:5000${product.image_path}`);
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Clean up previous object URL to prevent memory leaks
      if (formData.image && formData.image.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image);
      }
      
      // Create immediate preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update form data immediately for preview
      setFormData(prev => ({
        ...prev, 
        image: previewUrl, 
        selectedFile: file,
        imagePath: '' // Clear previous image path
      }));
      
      try {
        // Create FormData for upload
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        
        // Upload image to backend
        const response = await uploadAPI.uploadImage(uploadFormData);
        const imagePath = response.data.filePath;
        
        // Update with backend URL while keeping the preview
        setFormData(prev => ({
          ...prev, 
          image: imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`, 
          imagePath: imagePath
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        // Keep the preview URL even if upload fails
      }
    } else {
      // If no file selected, clear the image
      setFormData(prev => ({
        ...prev,
        image: '',
        imagePath: '',
        selectedFile: null
      }));
    }
  };

  const categories = [...new Set(products.map(p => p.category_name || p.category))].filter(Boolean);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const productCategory = product.category_name || product.category;
    const matchesCategory = !categoryFilter || productCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      imagePath: '',
      selectedFile: null
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category_name || product.category || '',
      stock: product.stock_quantity?.toString() || '',
      image: product.image_path ? `http://localhost:5000${product.image_path}` : '',
      imagePath: product.image_path || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingProduct) {
      const confirmInput = document.getElementById('deleteConfirm');
      if (confirmInput && confirmInput.value === deletingProduct.name) {
        try {
          await productsAPI.deleteProduct(deletingProduct.id);
          alert('Product deleted successfully!');
          await fetchProducts(); // Refresh products list
          setShowDeleteModal(false);
          setDeletingProduct(null);
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      } else {
        alert('Please type the product name exactly to confirm deletion.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock_quantity: parseInt(formData.stock) || 0,
      image_url: formData.imagePath || formData.image || null
    };

    try {
      if (editingProduct) {
        const response = await productsAPI.updateProduct(editingProduct.id, productData);
        alert('Product updated successfully!');
        
        // Update the product in the local state immediately using API response (ensures correct image_path)
        const updated = response.data.product;
        setProducts(prevProducts => prevProducts.map(p => p.id === updated.id ? updated : p));
      } else {
        const response = await productsAPI.createProduct(productData);
        alert('Product added successfully!');
        
        // Add the new product to the local state immediately
        setProducts(prevProducts => [...prevProducts, response.data.product]);
      }
      
      // Also refresh from server to ensure data consistency
      setTimeout(async () => {
        await fetchProducts();
      }, 100);
      
      setShowModal(false);
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        imagePath: '',
        selectedFile: null
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleCloseModal = () => {
    // Clean up object URL to prevent memory leaks
    if (formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image);
    }
    
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      imagePath: '',
      selectedFile: null
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
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </FilterSelect>
      </FiltersSection>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading products...
        </div>
      ) : (
        <ProductsGrid>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id}>
            <ProductImage>
              {product.image_path ? (
                <img 
                  src={product.image_path.startsWith('http') ? product.image_path : `http://localhost:5000${product.image_path}?v=${Date.now()}&t=${Math.random()}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    console.log('❌ Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', product.name);
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  color: '#64748b',
                  fontSize: '24px',
                  textAlign: 'center',
                  border: '2px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>📷</div>
                  <div style={{ fontSize: '10px', fontWeight: '500' }}>No Image</div>
                </div>
              )}
            </ProductImage>
            
            <ProductName>{product.name}</ProductName>
            
            <ProductHeader>
              <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
            </ProductHeader>
            
            <ProductCategory>{product.category_name || product.category || 'No Category'}</ProductCategory>
            <ProductStock>Stock: {product.stock_quantity || product.stock || 'N/A'} units</ProductStock>
            
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
      )}

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
              <Label>Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e)}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Select an image file (max 5MB)
              </small>
              {(formData.image || formData.imagePath || formData.selectedFile) && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Image Preview:
                  </div>
                  <img 
                    src={formData.image || (formData.imagePath ? `http://localhost:5000${formData.imagePath}` : '')} 
                    alt="Preview" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #d97706',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {formData.selectedFile && (
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>
                      Selected: {formData.selectedFile.name}
                    </div>
                  )}
                  {!formData.selectedFile && formData.imagePath && (
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px', wordBreak: 'break-all' }}>
                      Current: {formData.imagePath}
                    </div>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        // Clean up object URL
                        if (formData.image && formData.image.startsWith('blob:')) {
                          URL.revokeObjectURL(formData.image);
                        }
                        setFormData(prev => ({
                          ...prev,
                          image: '',
                          imagePath: '',
                          selectedFile: null
                        }));
                        // Clear the file input
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
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
