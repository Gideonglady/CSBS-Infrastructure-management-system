import { Link } from "react-router-dom";
import { Building2, ArrowRight, BarChart3, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-16 h-16 text-primary" />
            <h1 className="text-5xl font-bold">DIMS</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 max-w-3xl">
            Digital Infrastructure Management System
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Transform your departmental infrastructure management with our unified platform. 
            Report issues, track progress, and maintain digital registers efficiently.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link to="/login">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-card shadow-card rounded-lg p-8 text-center transition-smooth hover:shadow-lg">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
            <p className="text-muted-foreground">
              Monitor all infrastructure issues in real-time with comprehensive dashboards and analytics.
            </p>
          </div>

          <div className="bg-card shadow-card rounded-lg p-8 text-center transition-smooth hover:shadow-lg">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Role-based Access</h3>
            <p className="text-muted-foreground">
              Secure, role-specific dashboards for admins, faculty, staff, and students.
            </p>
          </div>

          <div className="bg-card shadow-card rounded-lg p-8 text-center transition-smooth hover:shadow-lg">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quick Resolution</h3>
            <p className="text-muted-foreground">
              Streamlined workflow ensures faster response times and efficient issue resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
