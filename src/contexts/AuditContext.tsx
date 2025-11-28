import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuditLog } from '@/types';

interface AuditContextType {
  logs: AuditLog[];
  addLog: (action: string, resource: string, resourceId?: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) => void;
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByResource: (resource: string, resourceId?: string) => AuditLog[];
}

type AuditAction = {
  type: 'ADD_LOG';
  payload: AuditLog;
};

const initialState = {
  logs: [] as AuditLog[]
};

function auditReducer(state: typeof initialState, action: AuditAction): typeof initialState {
  switch (action.type) {
    case 'ADD_LOG':
      return {
        logs: [action.payload, ...state.logs]
      };
    default:
      return state;
  }
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};

interface AuditProviderProps {
  children: ReactNode;
}

export const AuditProvider: React.FC<AuditProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(auditReducer, initialState);

  const addLog = (
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user', // In real app, get from auth context
      userName: 'Current User', // In real app, get from auth context
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: navigator.userAgent,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_LOG', payload: log });
  };

  const getLogsByUser = (userId: string) => {
    return state.logs.filter(log => log.userId === userId);
  };

  const getLogsByResource = (resource: string, resourceId?: string) => {
    return state.logs.filter(log => 
      log.resource === resource && 
      (resourceId ? log.resourceId === resourceId : true)
    );
  };

  const value: AuditContextType = {
    logs: state.logs,
    addLog,
    getLogsByUser,
    getLogsByResource
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};
