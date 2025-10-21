import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiDollarSign, FiPackage, FiUsers, FiShoppingCart, FiBarChart3 } from 'react-icons/fi';
import { usePOS } from '../../context/POSContext';

const DashboardContainer = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  background: ${props => props.color || '#d97706'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const StatChange = styled.div`
  font-size: 12px;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
`;

const RecentSales = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const SalesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 0;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 12px 0;
  color: #6b7280;
`;

const Dashboard = () => {
  const { sales, products } = usePOS();

  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => new Date(sale.timestamp).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = products.length;
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const stats = [
    {
      icon: FiDollarSign,
      color: '#059669',
      value: `$${todayRevenue.toFixed(2)}`,
      label: "Today's Revenue",
      change: '+12.5%'
    },
    {
      icon: FiShoppingCart,
      color: '#3b82f6',
      value: todaySales.length,
      label: "Today's Orders",
      change: '+8.2%'
    },
    {
      icon: FiPackage,
      color: '#d97706',
      value: totalProducts,
      label: 'Total Products',
      change: '+2.1%'
    },
    {
      icon: FiTrendingUp,
      color: '#8b5cf6',
      value: `$${totalRevenue.toFixed(2)}`,
      label: 'Total Revenue',
      change: '+15.3%'
    }
  ];

  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Overview of your bakery business performance</Subtitle>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatHeader>
              <StatIcon color={stat.color}>
                <stat.icon />
              </StatIcon>
              <StatChange positive={true}>
                <FiTrendingUp size={12} />
                {stat.change}
              </StatChange>
            </StatHeader>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Sales Trend</ChartTitle>
          <ChartPlaceholder>Sales Chart - Last 7 Days</ChartPlaceholder>
        </ChartCard>
        
        <ChartCard>
          <ChartTitle>Top Categories</ChartTitle>
          <ChartPlaceholder>Category Chart</ChartPlaceholder>
        </ChartCard>
      </ChartsGrid>

      <RecentSales>
        <ChartTitle>Recent Sales</ChartTitle>
        <SalesTable>
          <thead>
            <tr>
              <TableHeader>Order ID</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Time</TableHeader>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 5).map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>#{sale.id}</TableCell>
                <TableCell>Walk-in Customer</TableCell>
                <TableCell>${sale.total.toFixed(2)}</TableCell>
                <TableCell>{new Date(sale.timestamp).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </SalesTable>
      </RecentSales>
    </DashboardContainer>
  );
};

export default Dashboard;
