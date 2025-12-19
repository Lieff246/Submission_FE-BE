import { useState } from 'react';
import { authService } from '../api/authService';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test dengan data dummy
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User'
      };
      
      await authService.register(testData);
      setStatus('✅ Koneksi berhasil! Backend dan Frontend terhubung.');
    } catch (error) {
      if (error.response?.status === 409) {
        setStatus('✅ Koneksi berhasil! (User sudah ada)');
      } else {
        setStatus(`❌ Koneksi gagal: ${error.message}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Test Koneksi Backend</h3>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Koneksi'}
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
};

export default TestConnection;