import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { NotificationPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  notification: NotificationPayload;
  onClose: () => void;
  onRead: (id: string) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  onClose,
  onRead
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onRead(notification.id);
    }, 300);
  };

  const handleClick = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    handleClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'approval':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'approval':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-96 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${getBackgroundColor()} border rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-700 line-clamp-2">
              {notification.message}
            </p>
            {notification.actionUrl && (
              <p className="text-xs text-blue-600 mt-2">Click to view details</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
