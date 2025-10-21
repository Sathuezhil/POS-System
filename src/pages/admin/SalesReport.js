import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiFilter, FiCalendar, FiTrendingUp } from 'react-icons/fi';
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

const ExportButton = styled.button`
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
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

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const FilterInput = styled.input`
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

const FilterSelect = styled.select`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const SalesTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: #374151;
`;

const AmountCell = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #059669;
`;

const SalesReport = () => {
  const { sales } = usePOS();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');

  const handleExportToExcel = () => {
    // Create CSV content
    const csvContent = [
      ['Order ID', 'Date & Time', 'Cashier', 'Items', 'Amount'],
      ...filteredSales.map(sale => [
        sale.id,
        new Date(sale.timestamp).toLocaleString(),
        'Sarah Johnson',
        sale.items.length,
        sale.total.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Sales report exported successfully!');
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
    const toDate = dateTo ? new Date(dateTo) : new Date();
    
    return saleDate >= fromDate && saleDate <= toDate;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = filteredSales.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Container>
      <Header>
        <Title>Sales Report</Title>
        <ExportButton onClick={handleExportToExcel}>
          <FiDownload />
          Export to Excel
        </ExportButton>
      </Header>

      <FiltersSection>
        <FilterGroup>
          <FilterLabel>From Date</FilterLabel>
          <FilterInput
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>To Date</FilterLabel>
          <FilterInput
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Cashier</FilterLabel>
          <FilterSelect
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
          >
            <option value="all">All Cashiers</option>
            <option value="sarah">Sarah Johnson</option>
            <option value="mike">Mike Chen</option>
            <option value="emma">Emma Wilson</option>
          </FilterSelect>
        </FilterGroup>
      </FiltersSection>

      <StatsGrid>
        <StatCard>
          <StatValue>${totalRevenue.toFixed(2)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalOrders}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${averageOrder.toFixed(2)}</StatValue>
          <StatLabel>Average Order</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>12.5%</StatValue>
          <StatLabel>Growth Rate</StatLabel>
        </StatCard>
      </StatsGrid>

      <SalesTable>
        <TableHeader>
          <div>Order ID</div>
          <div>Date & Time</div>
          <div>Cashier</div>
          <div>Items</div>
          <div>Amount</div>
        </TableHeader>
        
        {filteredSales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell>#{sale.id}</TableCell>
            <TableCell>{new Date(sale.timestamp).toLocaleString()}</TableCell>
            <TableCell>Sarah Johnson</TableCell>
            <TableCell>{sale.items.length} items</TableCell>
            <AmountCell>${sale.total.toFixed(2)}</AmountCell>
          </TableRow>
        ))}
      </SalesTable>
    </Container>
  );
};

export default SalesReport;
