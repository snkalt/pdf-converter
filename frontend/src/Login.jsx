import React from 'react';

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-4">Login</h1>
      <form className="flex flex-col">
        <input type="text" placeholder="Username" className="mb-2 p-2 border border-gray-300" />
        <input type="password" placeholder="Password" className="mb-2 p-2 border border-gray-300" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default Login;
