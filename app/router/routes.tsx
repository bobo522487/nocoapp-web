import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomeDashboard from '../../features/dashboard/HomeDashboard';
import AppBuilder from '../../features/apps/AppBuilder';
import DataGrid from '../../features/data/DataGrid';
import Editor from '../../features/editor/Editor';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomeDashboard />
      },
      {
        path: 'apps',
        element: <AppBuilder />
      },
      {
        path: 'data',
        element: <Navigate to="/data/users" replace />
      },
      {
        path: 'data/:tableName',
        element: <DataGrid />
      },
      {
        path: 'code',
        element: <Editor />
      }
    ]
  }
]);