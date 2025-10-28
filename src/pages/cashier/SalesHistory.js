import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiFilter, FiDownload, FiEye, FiPrinter, FiCalendar } from 'react-icons/fi';
import { salesAPI } from '../../services/api';
import jsPDF from 'jspdf';

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

const FilterButton = styled.button`
  background: #3b82f6;
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
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FilterButton2 = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #d97706;
    color: white;
    border-color: #d97706;
  }
`;

const SalesTable = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #666;
`;

const SaleId = styled.span`
  font-family: monospace;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
`;

const Amount = styled.span`
  font-weight: 600;
  color: #059669;
`;

const Status = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #d4edda;
  color: #155724;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-right: 8px;
  
  &:hover {
    background: #e3f2fd;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
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
`;

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchSales();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchSales();
      setLastRefresh(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getSales({ page: 1, limit: 1000 });
      
      // Fetch details for each sale to get items
      const salesData = await Promise.all(
        response.data.sales.map(async (sale) => {
          try {
            const detailResponse = await salesAPI.getSale(sale.id);
            const items = detailResponse.data.items || [];
            return {
              id: sale.id,
              sale_number: sale.sale_number,
              timestamp: sale.created_at,
              items: items,
              itemCount: items.length,
              total: sale.total_amount,
              customer: sale.customer_name || 'Walk-in',
              cashier: sale.cashier_name || 'Unknown'
            };
          } catch (error) {
            console.error(`Error fetching details for sale ${sale.id}:`, error);
            return {
              id: sale.id,
              sale_number: sale.sale_number,
              timestamp: sale.created_at,
              items: [],
              itemCount: 0,
              total: sale.total_amount,
              customer: sale.customer_name || 'Walk-in',
              cashier: sale.cashier_name || 'Unknown'
            };
          }
        })
      );
      
      setSales(salesData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale) => {
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
    
    // Sale number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sale #: ${sale.sale_number}`, margin, yPos);
    yPos += 5;
    doc.text(`Date: ${new Date(sale.timestamp).toLocaleDateString()}`, margin, yPos);
    doc.text(`Time: ${new Date(sale.timestamp).toLocaleTimeString()}`, 160, yPos);
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
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach(item => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(item.product_name || 'Item', margin, yPos);
        yPos += 5;
        doc.setFontSize(9);
        doc.text(`$${item.unit_price.toFixed(2)} x ${item.quantity}`, margin + 5, yPos);
        doc.text(`${item.quantity}`, 140, yPos);
        doc.text(`$${item.total_price.toFixed(2)}`, 160, yPos);
        yPos += 8;
      });
    } else {
      doc.setFontSize(10);
      doc.text('Items not available', margin, yPos);
      yPos += 8;
    }
    
    yPos += 5;
    doc.line(margin, yPos, 190, yPos);
    yPos += 8;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 140, yPos);
    doc.text(`$${sale.total.toFixed(2)}`, 170, yPos);
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
    doc.save(`receipt-${sale.sale_number}.pdf`);
  };

  const handleExport = () => {
    const csvContent = [
      ['Sale ID', 'Date & Time', 'Items', 'Amount', 'Status'],
      ...filteredSales.map(sale => [
        sale.id,
        new Date(sale.timestamp).toLocaleString(),
        sale.items.length,
        sale.total.toFixed(2),
        'Completed'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Sales history exported successfully!');
  };

  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.timestamp).toDateString() === today);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const filteredSales = sales.filter(sale => {
    if (filter === 'today') {
      return new Date(sale.timestamp).toDateString() === today;
    }
    return true;
  });

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container>
      <Header>
        <Title>Sales History</Title>
        <FilterButton onClick={handleExport}>
          <FiDownload />
          Export
        </FilterButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>${todayTotal.toFixed(2)}</StatValue>
          <StatLabel>Today's Revenue</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{todaySales.length}</StatValue>
          <StatLabel>Today's Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{sales.length}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <FilterButton2 
          onClick={() => setFilter('today')}
          className={filter === 'today' ? 'active' : ''}
        >
          <FiCalendar />
          Today
        </FilterButton2>
        <FilterButton2 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          <FiFilter />
          All Sales
        </FilterButton2>
      </FilterSection>

      {filteredSales.length === 0 ? (
        <EmptyState>
          <p>No sales found</p>
          <p>Start making sales to see them here</p>
        </EmptyState>
      ) : (
        <SalesTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Sale ID</TableHeaderCell>
                <TableHeaderCell>Date & Time</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <SaleId>{sale.sale_number || `#${sale.id}`}</SaleId>
                  </TableCell>
                  <TableCell>{formatDate(sale.timestamp)}</TableCell>
                  <TableCell>{sale.itemCount !== undefined ? sale.itemCount : sale.items.length} items</TableCell>
                  <TableCell>
                    <Amount>${sale.total.toFixed(2)}</Amount>
                  </TableCell>
                  <TableCell>
                    <Status>Completed</Status>
                  </TableCell>
                  <TableCell>
                    <ActionButton title="View Details">
                      <FiEye size={16} />
                    </ActionButton>
                    <ActionButton title="Reprint" onClick={() => handlePrint(sale)}>
                      <FiPrinter size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </SalesTable>
      )}
    </Container>
  );
};

export default SalesHistory;
