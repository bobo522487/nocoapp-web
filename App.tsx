import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './app/providers';
import { router } from './app/router/routes';

const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;