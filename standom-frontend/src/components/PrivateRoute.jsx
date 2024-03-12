import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  // const { isAuthenticated } = useAuth0();

  // return isAuthenticated ? children : <Navigate to="/dashboard" />;
  const { user } = useAuth0()
  return (
    user ? children: <Navigate to="/" />
  )
}
