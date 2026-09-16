import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getMe,
  login as loginApi,
  logoutApi,
  register as registerApi,
} from '../api/auth.api';

const AuthContext = createContext();

const getTokenFromResponse = (data) =>
  data?.token ||
  data?.accessToken ||
  data?.data?.token ||
  data?.data?.accessToken ||
  null;

const getUserFromResponse = (data) =>
  data?.user ||
  data?.data?.user ||
  data?.data ||
  data ||
  null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const saveUser = (userData) => {
    setUser(userData);

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const fetchSession = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      const currentUser = getUserFromResponse(data);

      saveUser(currentUser);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const loginUser = async (credentials) => {
    const data = await loginApi(credentials);

    const token = getTokenFromResponse(data);
    const loggedUser = getUserFromResponse(data);

    if (token) {
      localStorage.setItem('token', token);
    }

    saveUser(loggedUser);

    return data;
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch {
      // Continue with local logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
    }
  };

  const registerUser = async (userData) => {
    const data = await registerApi(userData);

    const token = getTokenFromResponse(data);
    const registeredUser = getUserFromResponse(data);

    if (token) {
      localStorage.setItem('token', token);
    }

    if (registeredUser) {
      saveUser(registeredUser);
    }

    return data;
  };

  const updateUser = (updatedUser) => {
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};