import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export const useRoleAccess = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  };

  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN;
  };

  const isFaculty = (): boolean => {
    return user?.role === UserRole.FACULTY;
  };

  const isNonTeachingStaff = (): boolean => {
    return user?.role === UserRole.NON_TEACHING_STAFF;
  };

  const isClassRep = (): boolean => {
    return user?.role === UserRole.CLASS_REP;
  };

  const isLabTechnician = (): boolean => {
    return user?.role === UserRole.LAB_TECHNICIAN;
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdmin();
  };

  const canManageIssues = (): boolean => {
    return [UserRole.ADMIN, UserRole.FACULTY, UserRole.NON_TEACHING_STAFF].includes(user?.role as UserRole);
  };

  const canReportIssues = (): boolean => {
    return isAuthenticated;
  };

  const canManageRegisters = (): boolean => {
    return [UserRole.ADMIN, UserRole.FACULTY, UserRole.NON_TEACHING_STAFF, UserRole.LAB_TECHNICIAN].includes(user?.role as UserRole);
  };

  const canViewAnalytics = (): boolean => {
    return [UserRole.ADMIN, UserRole.FACULTY].includes(user?.role as UserRole);
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const getRoleDisplayName = (): string => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.FACULTY]: 'Faculty Member',
      [UserRole.NON_TEACHING_STAFF]: 'Non-Teaching Staff',
      [UserRole.CLASS_REP]: 'Class Representative',
      [UserRole.LAB_TECHNICIAN]: 'Lab Technician'
    };
    
    return user ? roleNames[user.role] : 'Guest';
  };

  const getRoleColor = (): string => {
    const roleColors: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'text-red-600 bg-red-50',
      [UserRole.FACULTY]: 'text-blue-600 bg-blue-50',
      [UserRole.NON_TEACHING_STAFF]: 'text-green-600 bg-green-50',
      [UserRole.CLASS_REP]: 'text-purple-600 bg-purple-50',
      [UserRole.LAB_TECHNICIAN]: 'text-orange-600 bg-orange-50'
    };
    
    return user ? roleColors[user.role] : 'text-gray-600 bg-gray-50';
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isFaculty,
    isNonTeachingStaff,
    isClassRep,
    isLabTechnician,
    canAccessAdminPanel,
    canManageIssues,
    canReportIssues,
    canManageRegisters,
    canViewAnalytics,
    canManageUsers,
    getRoleDisplayName,
    getRoleColor
  };
};
