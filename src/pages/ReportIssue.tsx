import { useState, useEffect } from "react";
import { Upload, X, AlertCircle, Send, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { laboratoryAPI } from "@/services/api";

interface Location {
  _id: string;
  name: string;
  type: string;
  building?: string;
  floor?: string;
}

const ReportIssue = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    locationType: "",
    location: "",
    description: "",
  });

  // Fetch locations when location type changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.locationType || formData.locationType === "restroom" || formData.locationType === "other") {
        setLocations([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const response: any = await laboratoryAPI.getAll({ type: formData.locationType });
        if (response.success && response.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error("Failed to load locations");
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [formData.locationType]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (photoFiles.length + newFiles.length > 5) {
        toast.error("Maximum 5 photos allowed");
        return;
      }
      setPhotoFiles([...photoFiles, ...newFiles]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (documentFiles.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setDocumentFiles([...documentFiles, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(documentFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Import the issueAPI
      const { issueAPI } = await import('@/services/api');

      // Get location details
      let locationName = "";
      let locationId = "";
      let building = "";
      let floor = "";

      if (formData.locationType === "classroom" || formData.locationType === "laboratory") {
        const selectedLocation = locations.find(loc => loc._id === formData.location);
        if (selectedLocation) {
          locationName = selectedLocation.name;
          locationId = selectedLocation._id;
          building = selectedLocation.building || "Main Building";
          floor = selectedLocation.floor || "1";
        }
      } else {
        locationName = formData.location;
        locationId = formData.location;
        building = "Main Building";
        floor = "1";
      }

      // Create issue via API with auto-notify admin
      const response: any = await issueAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: "medium", // Default priority since user doesn't select it
        location: {
          locationType: formData.locationType,
          id: locationId,
          name: locationName,
          building: building,
          floor: floor,
        },
        urgency: undefined,
        estimatedImpact: undefined,
        attachments: [],
        images: [],
        notifyAdmin: true, // Automatically notify admin
        allowPublicView: false,
      });

      // Check if the response indicates success
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to create issue');
      }

      toast.success("Issue reported successfully!", {
        description: "Administrators have been automatically notified and will review your issue shortly",
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        locationType: "",
        location: "",
        description: "",
      });
      setPhotoFiles([]);
      setDocumentFiles([]);
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error("Failed to submit issue", {
        description: "Please try again or contact support if the problem persists",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Report an Issue</h1>
          <p className="text-sm text-muted-foreground">
            Submit infrastructure or equipment issues for prompt resolution
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Reporting Guidelines</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide clear and detailed information about the issue</li>
              <li>Include photos or documents if possible (max 5 each)</li>
              <li>Select the location type and specific location</li>
              <li>Administrators will be automatically notified</li>
            </ul>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Please fill in all required fields marked with *</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type *</Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={(value) => setFormData({ ...formData, locationType: value, location: "" })}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="restroom">Restroom</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.locationType && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location Details *</Label>
                  {(formData.locationType === "classroom" || formData.locationType === "laboratory") ? (
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                      required
                      disabled={loadingLocations}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingLocations ? "Loading..." : `Select ${formData.locationType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.length === 0 && !loadingLocations && (
                          <SelectItem value="none" disabled>No {formData.locationType}s available</SelectItem>
                        )}
                        {locations.map((loc) => (
                          <SelectItem key={loc._id} value={loc._id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="location"
                      placeholder={`Enter ${formData.locationType} location details`}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="h-11"
                    />
                  )}
                </div>
              )}



              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the issue, including any relevant context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Add Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={photoFiles.length >= 5}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload Photos</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG (max 5 photos)
                      </p>
                    </label>
                  </div>

                  {photoFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {photoFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Add Files (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocumentChange}
                      disabled={documentFiles.length >= 5}
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload Files</p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, TXT (max 5 files)
                      </p>
                    </label>
                  </div>

                  {documentFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {documentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Issue
                    </span>
                  )}
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportIssue;
