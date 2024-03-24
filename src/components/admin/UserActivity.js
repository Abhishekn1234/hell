import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function UserActivity() {
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    async function fetchUserOrders() {
      try {
        const response = await axios.get('http://localhost:5000/orderss');
        setUserOrders(response.data);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      }
    }
  
    fetchUserOrders();
  }, []);
  
  // Prepare data for bar chart (category-wise sales distribution)
  const prepareCategorySalesData = () => {
    const categorySales = {};
    userOrders.forEach(order => {
      order.cartItems.forEach(item => {
        const { category, price, quantity } = item;
        if (categorySales[category]) {
          categorySales[category] += price * quantity;
        } else {
          categorySales[category] = price * quantity;
        }
      });
    });
    return Object.entries(categorySales).map(([category, totalSales]) => ({ category, totalSales }));
  };

  // Prepare data for line chart (sales trend over time)
  const prepareSalesTrendData = () => {
    const salesTrendData = [];
    const salesByDate = {};
    userOrders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      if (salesByDate[orderDate]) {
        salesByDate[orderDate] += order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      } else {
        salesByDate[orderDate] = order.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      }
    });
    for (const date in salesByDate) {
      salesTrendData.push({ date, totalSales: salesByDate[date] });
    }
    return salesTrendData;
  };
  // Calculate total sales per user
  const calculateTotalSalesPerUser = () => {
    const totalSalesPerUser = {};
    userOrders.forEach(order => {
      const { Name, cartItems } = order;
      const totalSale = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      if (totalSalesPerUser[Name]) {
        totalSalesPerUser[Name] += totalSale;
      } else {
        totalSalesPerUser[Name] = totalSale;
      }
    });
    return totalSalesPerUser;
  };

  // Prepare data for bar chart
  const prepareBarChartData = () => {
    const data = [];
    const totalSalesPerUser = calculateTotalSalesPerUser();
    for (const user in totalSalesPerUser) {
      data.push({ name: user, sales: totalSalesPerUser[user] });
    }
    return data;
  };

  // Prepare data for pie chart (payment method distribution)
  const preparePaymentMethodData = () => {
    const paymentMethods = {};
    userOrders.forEach(order => {
      const method = order.payment.method;
      if (paymentMethods[method]) {
        paymentMethods[method]++;
      } else {
        paymentMethods[method] = 1;
      }
    });
    return Object.entries(paymentMethods).map(([method, count]) => ({ name: method, value: count }));
  };

  // Calculate top selling products
  const calculateTopSellingProducts = () => {
    const productSalesMap = new Map();
    userOrders.forEach(order => {
      order.cartItems.forEach(item => {
        const { name, quantity } = item;
        if (productSalesMap.has(name)) {
          productSalesMap.set(name, productSalesMap.get(name) + quantity);
        } else {
          productSalesMap.set(name, quantity);
        }
      });
    });
    // Sort the products by quantity sold in descending order
    const sortedProducts = Array.from(productSalesMap.entries()).sort((a, b) => b[1] - a[1]);
    // Take top 5 products
    return sortedProducts.slice(0, 5);
  };

  const topSellingProducts = calculateTopSellingProducts();

  return (
    <div>
      <h1>User Activity</h1>
      <CCard>
        <CCardHeader>
          User Sales Summary
        </CCardHeader>
        <CCardBody>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
            <BarChart width={400} height={300} data={prepareBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
            <PieChart width={400} height={300}>
              <Pie data={preparePaymentMethodData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {
                  preparePaymentMethodData().map((entry, index) => <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />)
                }
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
          <LineChart width={600} height={300} data={userOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
          </LineChart>
          <div>
            <h3>Top Selling Products</h3>
            <ul>
              {topSellingProducts.map(([productName, quantity]) => (
                <li key={productName}>{productName}: {quantity} units</li>
              ))}
            </ul>
          </div>
        </CCardBody>
      </CCard>
      <CCard>
       
        <CCardBody>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
            {/* Bar Chart for Category-wise Sales Distribution */}
            <BarChart width={400} height={300} data={prepareCategorySalesData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSales" fill="#8884d8" />
            </BarChart>
            {/* Line Chart for Sales Trend over Time */}
            <LineChart width={400} height={300} data={prepareSalesTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
            </LineChart>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
}
