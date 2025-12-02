import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Paperclip, MapPin, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { IssueCategory, IssuePriority } from '@/types';
import { getDefaultRouteForRole } from '@/utils/roleRedirect';

const IssueReporting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: {
      type: '',
      id: '',
      name: '',
      building: '',
      floor: ''
    },
    urgency: '',
    estimatedImpact: '',
    attachments: [] as File[],
    images: [] as File[],
    notifyAdmin: true,
    allowPublicView: false
  });

  const categories = [
    { value: 'equipment', label: 'Equipment', icon: '🔧' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🏢' },
    { value: 'safety', label: 'Safety', icon: '⚠️' },
    { value: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const locations = [
    { type: 'classroom', id: '1', name: 'Room 101', building: 'Computer Science Building', floor: 1 },
    { type: 'classroom', id: '2', name: 'Room 205', building: 'Engineering Building', floor: 2 },
    { type: 'laboratory', id: '3', name: 'Computer Lab 1', building: 'Computer Science Building', floor: 2 },
    { type: 'laboratory', id: '4', name: 'Chemistry Lab A', building: 'Science Building', floor: 1 },
    { type: 'other', id: '5', name: 'Main Entrance', building: 'Main Building', floor: 0 },
    { type: 'other', id: '6', name: 'Parking Lot', building: 'N/A', floor: 0 }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (field: 'attachments' | 'images', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ...fileArray]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Import the issueAPI
      const { issueAPI } = await import('@/services/api');

      // Create issue via API
      const response: any = await issueAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: {
          locationType: formData.location.type,
          id: formData.location.id,
          name: formData.location.name,
          building: formData.location.building,
          floor: formData.location.floor,
        },
        urgency: formData.urgency || undefined,
        estimatedImpact: formData.estimatedImpact || undefined,
        attachments: formData.attachments.map(f => f.name),
        images: formData.images.map(f => f.name),
        notifyAdmin: formData.notifyAdmin,
        allowPublicView: formData.allowPublicView,
      });

      // Check if the response indicates success
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to create issue');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: '',
        location: { type: '', id: '', name: '', building: '', floor: '' },
        urgency: '',
        estimatedImpact: '',
        attachments: [],
        images: [],
        notifyAdmin: true,
        allowPublicView: false
      });

      // Show success message
      alert('Issue reported successfully! It has been routed to the administrator for review.');

      navigate(getDefaultRouteForRole(user?.role));
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error submitting issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Report an Issue</h1>
          <p className="text-gray-600">Help us improve infrastructure by reporting issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Issue Details</span>
            </CardTitle>
            <CardDescription>
              Provide detailed information about the issue you're reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include any relevant information that might help resolve it."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location Details</span>
            </CardTitle>
            <CardDescription>
              Specify where the issue is occurring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Location Type *</Label>
              <RadioGroup
                value={formData.location.type}
                onValueChange={(value) => handleInputChange('location.type', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classroom" id="classroom" />
                  <Label htmlFor="classroom">Classroom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="laboratory" id="laboratory" />
                  <Label htmlFor="laboratory">Laboratory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.location.type && (
              <div className="space-y-2">
                <Label htmlFor="location">Specific Location *</Label>
                <Select
                  value={formData.location.id}
                  onValueChange={(value) => {
                    const selectedLocation = locations.find(loc => loc.id === value);
                    if (selectedLocation) {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          type: selectedLocation.type,
                          id: selectedLocation.id,
                          name: selectedLocation.name,
                          building: selectedLocation.building,
                          floor: selectedLocation.floor.toString()
                        }
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter(loc => loc.type === formData.location.type)
                      .map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.building}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Help us understand the impact and urgency of this issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">How urgent is this issue?</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_urgent">Not Urgent - Can wait</SelectItem>
                    <SelectItem value="somewhat_urgent">Somewhat Urgent - Should be addressed soon</SelectItem>
                    <SelectItem value="urgent">Urgent - Needs immediate attention</SelectItem>
                    <SelectItem value="critical">Critical - Emergency situation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">Estimated Impact</Label>
                <Select value={formData.estimatedImpact} onValueChange={(value) => handleInputChange('estimatedImpact', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal - Affects few users</SelectItem>
                    <SelectItem value="moderate">Moderate - Affects some users</SelectItem>
                    <SelectItem value="significant">Significant - Affects many users</SelectItem>
                    <SelectItem value="severe">Severe - Affects entire department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('attachments')?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                </div>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                />
                <input
                  id="attachments"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload('attachments', e.target.files)}
                />
                {(formData.images.length > 0 || formData.attachments.length > 0) && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.images.map((file, index) => (
                        <Badge key={index} variant="secondary">
                          📷 {file.name}
                        </Badge>
                      ))}
                      {formData.attachments.map((file, index) => (
                        <Badge key={index} variant="secondary">
                          📎 {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-admin"
                checked={formData.notifyAdmin}
                onCheckedChange={(checked) => handleInputChange('notifyAdmin', checked)}
              />
              <Label htmlFor="notify-admin">
                Notify administrators immediately
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-public"
                checked={formData.allowPublicView}
                onCheckedChange={(checked) => handleInputChange('allowPublicView', checked)}
              />
              <Label htmlFor="allow-public">
                Allow other users to view this issue (for transparency)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Issue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IssueReporting;
