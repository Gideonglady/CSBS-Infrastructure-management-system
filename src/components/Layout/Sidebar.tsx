import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Microscope,
  FileText,
  Bell,
  UserCheck
} from 'lucide-react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getRoleDisplayName, getRoleColor } = useRoleAccess();
  const { isAdmin, canManageIssues, canManageRegisters, canViewAnalytics, canManageUsers } = useRoleAccess();
  const { logout } = useAuth();

  const handleLogout = () => {
    console.log('Logout button clicked');
    try {
      logout();
      console.log('Logout function called successfully');
      
      // Use window.location for more reliable navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      console.log('Navigation to login called');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback navigation
      window.location.href = '/login';
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      href: user?.role === 'admin' ? '/admin' : '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'non_teaching_staff', 'class_rep', 'lab_technician']
    },
    {
      label: 'Digital Registers',
      href: '/registers',
      icon: Building2,
      roles: ['admin', 'faculty', 'non_teaching_staff', 'lab_technician'],
      children: [
        { label: 'Classrooms', href: '/registers/classrooms', icon: BookOpen },
        { label: 'Laboratories', href: '/registers/labs', icon: Microscope }
      ]
    },
    {
      label: 'Issue Management',
      href: user?.role === 'admin' ? '/admin/issues' : '/issues',
      icon: AlertTriangle,
      roles: ['admin', 'faculty', 'non_teaching_staff', 'class_rep'],
      children: user?.role === 'admin' ? [] : [
        { label: 'Report Issue', href: '/issues/report', icon: FileText },
        { label: 'My Issues', href: '/my-issues', icon: AlertTriangle }
      ]
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'faculty']
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['admin', 'faculty', 'non_teaching_staff', 'class_rep', 'lab_technician']
    },
    {
      label: 'User Management',
      href: '/users',
      icon: Users,
      roles: ['admin']
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'faculty', 'non_teaching_staff', 'class_rep', 'lab_technician']
    },
    {
      label: 'Audit Log',
      href: '/audit-log',
      icon: UserCheck,
      roles: ['admin']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">DIMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <Badge variant="secondary" className={cn("text-xs", getRoleColor())}>
                {getRoleDisplayName()}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <div key={item.label}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isCollapsed && "mx-auto")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
              
              {/* Sub-items */}
              {!isCollapsed && item.children && active && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    
                    return (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          childActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <ChildIcon className="w-4 h-4" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-gray-100",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn("w-5 h-5", isCollapsed && "mx-auto")} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
