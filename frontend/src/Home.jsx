import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to the File Conversion App</h1>
      <p>Convert your files easily and quickly!</p>
      <div className="mt-4">
        <Link to="/login" className="mr-4 text-blue-600 hover:underline">Login</Link>
        <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
      </div>
    </div>
  );
};

export default Home;
