import { UserRole } from '@/types/auth';

export const getDefaultRouteForRole = (role?: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.FACULTY:
    case UserRole.NON_TEACHING_STAFF:
      return '/digital-registers';
    case UserRole.LAB_TECHNICIAN:
      return '/issues';
    case UserRole.LAB_INCHARGE:
      return '/digital-registers/laboratories';
    case UserRole.CLASS_REP:
      return '/issues';
    case UserRole.STAFF:
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

