import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, User, LoginCredentials, RegisterData, UserRole } from '@/types/auth';
import { authAPI } from '@/services/api';

// Helper to map user data
const mapUser = (userData: any): User => ({
  ...userData,
  id: userData._id || userData.id,
  createdAt: new Date(userData.createdAt),
  updatedAt: new Date(userData.updatedAt),
});

// Authentication service using backend API
const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const data = await authAPI.login(credentials);
    return {
      user: mapUser(data.data.user),
      token: data.data.token,
    };
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await authAPI.register(data);
    return {
      user: mapUser(response.data.user),
      token: response.data.token,
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const data = await authAPI.getCurrentUser();
      return mapUser(data.data.user);
    } catch (error) {
      return null;
    }
  }
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const defaultAdminUser: User = {
  id: 'user-admin-01',
  name: 'Gideon Glady K',
  email: 'admin@university.edu',
  role: UserRole.ADMIN,
  department: 'CSBS',
  mustChangePassword: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialState: AuthState = {
  user: defaultAdminUser,
  isAuthenticated: true,
  isLoading: false,
  token: 'demo-local-token'
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token }
            });
            return;
          }
        } catch {
          // Keep defaultAdminUser if API is unreachable
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { user, token } = await authService.register(data);
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    console.log('AuthContext logout called');
    try {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
      dispatch({ type: 'LOGOUT' });
      console.log('LOGOUT action dispatched');
    } catch (error) {
      console.error('Error in logout function:', error);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...data };
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    // TODO: Make API call to update profile
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    // TODO: Implement password change API call
    throw new Error('Password change not implemented');
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
