import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, User, LoginCredentials, RegisterData, UserRole } from '@/types/auth';

// Mock authentication service - replace with actual API calls
const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.includes('admin') ? 'Admin User' : 'John Doe',
      role: credentials.email.includes('admin') ? UserRole.ADMIN : 
            credentials.email.includes('faculty') ? UserRole.FACULTY :
            credentials.email.includes('staff') ? UserRole.NON_TEACHING_STAFF :
            credentials.email.includes('rep') ? UserRole.CLASS_REP :
            UserRole.LAB_TECHNICIAN,
      department: 'Computer Science',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    return {
      user: mockUser,
      token: 'mock-jwt-token'
    };
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Math.random().toString(36),
      email: data.email,
      name: data.name,
      role: data.role,
      department: data.department,
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    return {
      user: mockUser,
      token: 'mock-jwt-token'
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Mock current user
    return {
      id: '1',
      email: 'admin@university.edu',
      name: 'Admin User',
      role: UserRole.ADMIN,
      department: 'Administration',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  }
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null
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
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
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
