import { UserRole } from '@/types/auth';

export const getDefaultRouteForRole = (role?: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.FACULTY:
    case UserRole.NON_TEACHING_STAFF:
      return '/registers';
    case UserRole.LAB_TECHNICIAN:
      return '/issues';
    case UserRole.LAB_INCHARGE:
      return '/registers/labs';
    case UserRole.CLASS_REP:
      return '/issues';
    default:
      return '/issues';
  }
};

