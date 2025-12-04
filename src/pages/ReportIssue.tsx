import { useState } from "react";
import { Upload, X, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const ReportIssue = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    priority: "",
    description: "",
    suggestedSolution: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Import the issueAPI
      const { issueAPI } = await import('@/services/api');

      // Parse location to get details
      const locationParts = formData.location.split('-');
      const locationType = locationParts[0] === 'room' ? 'classroom' : locationParts[0] === 'lab' ? 'laboratory' : 'other';
      const locationId = formData.location;
      const locationName = formData.location; // You might want to map this to actual names

      // Create issue via API
      const response: any = await issueAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: {
          locationType,
          id: locationId,
          name: locationName,
          building: 'Main Building', // Default value
          floor: '1', // Default value
        },
        urgency: undefined,
        estimatedImpact: undefined,
        attachments: [],
        images: [],
        notifyAdmin: true,
        allowPublicView: false,
      });

      // Check if the response indicates success
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to create issue');
      }

      toast.success("Issue reported successfully!", {
        description: "Administrators have been notified and will review your issue shortly",
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        location: "",
        priority: "",
        description: "",
        suggestedSolution: "",
      });
      setFiles([]);
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
              <li>Include photos or documents if possible (max 5 files)</li>
              <li>Select appropriate priority level based on urgency</li>
              <li>You'll receive a confirmation email with your issue ID</li>
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
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room-301">Classroom - Room 301</SelectItem>
                      <SelectItem value="room-305">Classroom - Room 305</SelectItem>
                      <SelectItem value="lab-1">Computer Lab 1</SelectItem>
                      <SelectItem value="lab-2">Computer Lab 2</SelectItem>
                      <SelectItem value="lab-physics">Physics Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-muted" />
                        Low - Can wait a few days
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        Medium - Should be addressed soon
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning" />
                        High - Needs attention within 24 hours
                      </span>
                    </SelectItem>
                    <SelectItem value="critical">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        Critical - Immediate action required
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="suggestedSolution">Suggested Solution (Optional)</Label>
                <Textarea
                  id="suggestedSolution"
                  placeholder="If you have any suggestions for resolving this issue, please share them here..."
                  value={formData.suggestedSolution}
                  onChange={(e) => setFormData({ ...formData, suggestedSolution: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={files.length >= 5}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload files</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, PDF, DOC (max 5 files, 10MB each)
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive/80 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
