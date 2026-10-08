import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { IssueCategory } from '@/types';
import { getDefaultRouteForRole } from '@/utils/roleRedirect';
import { laboratoryAPI, uploadAPI } from '@/services/api';
import { toast } from 'sonner';

const IssueReporting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: {
      type: '',
      id: '',
      name: '',
      building: '',
      floor: ''
    },
    attachments: [] as File[],
    images: [] as File[]
  });

  const categories = [
    { value: 'equipment', label: 'Equipment', icon: '🔧' },
    { value: 'furniture', label: 'Furniture', icon: '🪑' },
    { value: 'safety', label: 'Safety', icon: '⚠️' },
    { value: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { value: 'electrical_and_electronics', label: 'Electrical and Electronics', icon: '⚡' }
  ];

  // Fetch locations when location type changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.location.type || formData.location.type === 'restroom' || formData.location.type === 'other') {
        setLocations([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response: any = await laboratoryAPI.getAll({
          type: formData.location.type,
          includeAll: 'true'
        });
        if (response.success && response.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error('Failed to load locations');
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [formData.location.type]);

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

      // Upload files first if any
      let attachmentUrls: string[] = [];
      let imageUrls: string[] = [];

      try {
        if (formData.attachments.length > 0) {
          const uploadResponse: any = await uploadAPI.uploadDocuments(formData.attachments);
          if (uploadResponse.success) {
            attachmentUrls = uploadResponse.data;
          }
        }

        if (formData.images.length > 0) {
          const uploadResponse: any = await uploadAPI.uploadImages(formData.images);
          if (uploadResponse.success) {
            imageUrls = uploadResponse.data;
          }
        }
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError);
        toast.error('Failed to upload files. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Create issue via API with auto-notify admin
      const response: any = await issueAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,

        location: {
          locationType: formData.location.type,
          id: formData.location.id,
          name: formData.location.name,
          building: formData.location.building || 'Main Building',
          floor: formData.location.floor || '1',
        },
        urgency: undefined,
        estimatedImpact: undefined,
        attachments: attachmentUrls,
        images: imageUrls,
        notifyAdmin: true, // Automatically notify admin
        allowPublicView: false,
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
        location: { type: '', id: '', name: '', building: '', floor: '' },
        attachments: [],
        images: []
      });

      // Show success message
      toast.success('Issue reported successfully!', {
        description: 'Administrators have been automatically notified and will review your issue shortly'
      });

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
                onValueChange={(value) => {
                  handleInputChange('location.type', value);
                  // Reset location details when type changes
                  setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, type: value, id: '', name: '', building: '', floor: '' }
                  }));
                }}
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
                  <RadioGroupItem value="restroom" id="restroom" />
                  <Label htmlFor="restroom">Restroom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.location.type && (
              <div className="space-y-2">
                <Label htmlFor="location">Location Details *</Label>
                {(formData.location.type === 'classroom' || formData.location.type === 'laboratory') ? (
                  <Select
                    value={formData.location.id}
                    onValueChange={(value) => {
                      const selectedLocation = locations.find(loc => loc._id === value);
                      if (selectedLocation) {
                        setFormData(prev => ({
                          ...prev,
                          location: {
                            type: formData.location.type,
                            id: selectedLocation._id,
                            name: selectedLocation.name,
                            building: selectedLocation.building || 'Main Building',
                            floor: selectedLocation.floor?.toString() || '1'
                          }
                        }));
                      }
                    }}
                    disabled={loadingLocations}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingLocations ? 'Loading...' : `Select ${formData.location.type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length === 0 && !loadingLocations && (
                        <SelectItem value="none" disabled>No {formData.location.type}s available</SelectItem>
                      )}
                      {locations.map((location) => (
                        <SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="location-manual"
                    placeholder={`Enter ${formData.location.type} location details`}
                    value={formData.location.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          id: value,
                          name: value,
                          building: 'Main Building',
                          floor: '1'
                        }
                      }));
                    }}
                    required
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments (Optional)</CardTitle>
            <CardDescription>
              Add photos or files to help illustrate the issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
