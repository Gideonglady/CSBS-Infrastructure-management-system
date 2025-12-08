import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Eye, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return notifications;
      case 'recent':
        return notifications.filter(n => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      case 'pending':
        return notifications.filter(n => !n.read);
      case 'closed':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // If notification has issueId in metadata, fetch and show issue details
    if (notification.metadata?.issueId) {
      try {
        const { issueAPI } = await import('@/services/api');
        const response = await issueAPI.getById(notification.metadata.issueId);

        if (response && response.data) {
          setSelectedIssue(response.data);
          setIsIssueDialogOpen(true);
        }
      } catch (error) {
        console.error('Error fetching issue details:', error);
        // Fallback to navigation if fetch fails
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      }
    } else if (notification.actionUrl) {
      // Navigate to the action URL if no issue ID
      window.location.href = notification.actionUrl;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">Stay updated with system activities and issue updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500 text-center">
                    You're all caught up! New notifications will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-75' : 'border-l-4 border-l-primary'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                            {notification.actionUrl && (
                              <span className="flex items-center text-primary hover:underline">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View details
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent notifications</h3>
                  <p className="text-gray-500 text-center">
                    Recent notifications (last 7 days) will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-75' : 'border-l-4 border-l-primary'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                            {notification.actionUrl && (
                              <span className="flex items-center text-primary hover:underline">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View details
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending notifications</h3>
                  <p className="text-gray-500 text-center">
                    Unread notifications will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-75' : 'border-l-4 border-l-primary'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                            {notification.actionUrl && (
                              <span className="flex items-center text-primary hover:underline">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View details
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No closed notifications</h3>
                  <p className="text-gray-500 text-center">
                    Read notifications will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-75' : 'border-l-4 border-l-primary'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</span>
                            {notification.actionUrl && (
                              <span className="flex items-center text-primary hover:underline">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View details
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Notification Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Understanding different notification types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-medium">Information</p>
                <p className="text-sm text-gray-500">General updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium">Success</p>
                <p className="text-sm text-gray-500">Completed actions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium">Warning</p>
                <p className="text-sm text-gray-500">Important notices</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm text-gray-500">Issues requiring attention</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Details Dialog */}
      {selectedIssue && (
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Issue Details</DialogTitle>
              <DialogDescription>
                Detailed information about this issue
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm">{selectedIssue.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm">
                    <Badge className={getStatusColor(selectedIssue.status)}>
                      {selectedIssue.status.replace('_', ' ')}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reporter</label>
                  <p className="text-sm">{selectedIssue.reporterName}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm bg-gray-100 p-3 rounded mt-1">
                  {selectedIssue.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm">{selectedIssue.location?.name} - {selectedIssue.location?.building}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{new Date(selectedIssue.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Images Section */}
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedIssue.images.map((img: string, index: number) => (
                      <a key={index} href={img} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img
                          src={img}
                          alt={`Issue attachment ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Documents</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.attachments.map((file: string, index: number) => {
                      const fileName = file.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
                      return (
                        <a key={index} href={file} target="_blank" rel="noopener noreferrer">
                          <Badge variant="outline" className="hover:bg-gray-100 p-2 cursor-pointer flex items-center gap-2">
                            <span className="truncate max-w-[200px]">{fileName}</span>
                          </Badge>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsIssueDialogOpen(false);
                setSelectedIssue(null);
              }}>
                Close
              </Button>
              <Button onClick={() => {
                // Navigate to full issue management page
                window.location.href = `/admin/issues?issueId=${selectedIssue._id}`;
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Manage Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Notifications;
