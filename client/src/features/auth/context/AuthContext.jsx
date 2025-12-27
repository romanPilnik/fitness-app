/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';
import { tokenStorage } from '../../../utils/storage';
import { AuthApi } from '../api/AuthApi';

const AuthContext = createContext();

const actions = {
  loginSuccess: 'LOGIN_SUCCESS',
  registerSuccess: 'REGISTER_SUCCESS',
  logout: 'LOGOUT',
  setLoading: 'SET_LOADING',
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthReducer = (state, action) => {
  switch (action.type) {
    case actions.loginSuccess:
    case actions.registerSuccess:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case actions.logout:
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case actions.setLoading:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.get();
      if (token) {
        try {
          const user = await AuthApi.currentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch {
          tokenStorage.remove();
          dispatch({ type: 'SET_LOADING' });
        }
      } else {
        dispatch({ type: 'SET_LOADING' });
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const responseData = await AuthApi.login(email, password);
    tokenStorage.set(responseData.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: responseData.user });
  };

  const register = async (email, password, name) => {
    const responseData = await AuthApi.register(email, password, name);
    tokenStorage.set(responseData.token);
    dispatch({ type: 'REGISTER_SUCCESS', payload: responseData.user });
  };

  const logout = async () => {
    tokenStorage.remove();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
