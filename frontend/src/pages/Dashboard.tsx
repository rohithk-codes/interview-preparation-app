import React from 'react';
import Layout from '../components/common/Layout';
import { BarChart3 } from 'lucide-react';

const Dashboard = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="card text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
           Welcome To Dashboard 
          </h2>
          
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;