import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSave, FiUpload, FiEye, FiEyeOff, FiSettings, FiDollarSign, FiPercent, FiImage } from 'react-icons/fi';

const Container = styled.div`
  padding: 24px;
  background: transparent;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const SettingsCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
  }
`;

const PasswordInput = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #374151;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const LogoPreview = styled.div`
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 8px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const UploadButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  
  &:hover {
    background: #2563eb;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
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

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    businessName: 'SE Bakers',
    businessAddress: '123 Main Street, City, State 12345',
    businessPhone: '+1 (555) 123-4567',
    businessEmail: 'info@sebakers.com',
    
    // Currency & Tax
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 8.5,
    taxInclusive: false,
    
    // Receipt Settings
    receiptHeader: 'SE Bakers - Fresh Daily',
    receiptFooter: 'Thank you for your business!',
    printReceipt: true,
    emailReceipt: false,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // System
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 30
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate password change
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    
    // Save to localStorage for demo
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    
    alert('Settings saved successfully!');
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // In a real app, upload to server
          console.log('Logo uploaded:', e.target.result);
          alert('Logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Container>
      <Header>
        <Title>System Settings</Title>
        <Subtitle>Manage your bakery POS system configuration</Subtitle>
      </Header>

      <SettingsGrid>
        {/* General Settings */}
        <SettingsCard>
          <CardTitle>
            <FiSettings />
            General Settings
          </CardTitle>
          
          <FormGroup>
            <Label>Business Name</Label>
            <Input
              type="text"
              value={settings.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Business Address</Label>
            <TextArea
              value={settings.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={settings.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={settings.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
            />
          </FormGroup>
        </SettingsCard>

        {/* Currency & Tax Settings */}
        <SettingsCard>
          <CardTitle>
            <FiDollarSign />
            Currency & Tax
          </CardTitle>
          
          <FormGroup>
            <Label>Currency</Label>
            <Select
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Currency Symbol</Label>
            <Input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Tax Inclusive Pricing</Label>
            <Select
              value={settings.taxInclusive}
              onChange={(e) => handleInputChange('taxInclusive', e.target.value === 'true')}
            >
              <option value="false">No - Add tax to prices</option>
              <option value="true">Yes - Include tax in prices</option>
            </Select>
          </FormGroup>
        </SettingsCard>

        {/* Receipt Settings */}
        <SettingsCard>
          <CardTitle>
            <FiImage />
            Receipt Settings
          </CardTitle>
          
          <FormGroup>
            <Label>Receipt Header</Label>
            <Input
              type="text"
              value={settings.receiptHeader}
              onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Receipt Footer</Label>
            <TextArea
              value={settings.receiptFooter}
              onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Auto Print Receipt</Label>
            <Select
              value={settings.printReceipt}
              onChange={(e) => handleInputChange('printReceipt', e.target.value === 'true')}
            >
              <option value="true">Yes - Print automatically</option>
              <option value="false">No - Manual print only</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Email Receipt</Label>
            <Select
              value={settings.emailReceipt}
              onChange={(e) => handleInputChange('emailReceipt', e.target.value === 'true')}
            >
              <option value="true">Yes - Send email receipt</option>
              <option value="false">No - Print only</option>
            </Select>
          </FormGroup>
        </SettingsCard>

        {/* Security Settings */}
        <SettingsCard>
          <CardTitle>
            <FiSettings />
            Security Settings
          </CardTitle>
          
          <FormGroup>
            <Label>Current Password</Label>
            <PasswordInput>
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={settings.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              />
              <PasswordToggle onClick={() => togglePasswordVisibility('current')}>
                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </PasswordInput>
          </FormGroup>
          
          <FormGroup>
            <Label>New Password</Label>
            <PasswordInput>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={settings.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
              />
              <PasswordToggle onClick={() => togglePasswordVisibility('new')}>
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </PasswordInput>
          </FormGroup>
          
          <FormGroup>
            <Label>Confirm New Password</Label>
            <PasswordInput>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={settings.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <PasswordToggle onClick={() => togglePasswordVisibility('confirm')}>
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </PasswordInput>
          </FormGroup>
        </SettingsCard>
      </SettingsGrid>

      {/* Logo Upload Section */}
      <SettingsCard style={{ marginBottom: '32px' }}>
        <CardTitle>
          <FiImage />
          Business Logo
        </CardTitle>
        
        <LogoSection>
          <LogoPreview>🥖</LogoPreview>
          <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
            Upload your bakery logo
          </p>
          <UploadButton onClick={handleLogoUpload}>
            <FiUpload />
            Choose File
          </UploadButton>
        </LogoSection>
      </SettingsCard>

      {/* Save Button */}
      <div style={{ textAlign: 'center' }}>
        <SaveButton onClick={handleSave}>
          <FiSave />
          Save All Settings
        </SaveButton>
      </div>
    </Container>
  );
};

export default Settings;
