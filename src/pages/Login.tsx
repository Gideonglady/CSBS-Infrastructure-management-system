import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, Building2, Users, GraduationCap, Wrench, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const demoAccounts = [
    {
      role: UserRole.ADMIN,
      email: "admin@university.edu",
      password: "admin123",
      name: "Administrator",
      icon: Users,
      description: "Full system access"
    },
    {
      role: UserRole.FACULTY,
      email: "faculty@university.edu",
      password: "faculty123",
      name: "Faculty Member",
      icon: GraduationCap,
      description: "Teaching staff access"
    },
    {
      role: UserRole.NON_TEACHING_STAFF,
      email: "staff@university.edu",
      password: "staff123",
      name: "Non-Teaching Staff",
      icon: Building2,
      description: "Administrative access"
    },
    {
      role: UserRole.CLASS_REP,
      email: "rep@university.edu",
      password: "rep123",
      name: "Class Representative",
      icon: UserCheck,
      description: "Student representative"
    },
    {
      role: UserRole.LAB_TECHNICIAN,
      email: "tech@university.edu",
      password: "tech123",
      name: "Lab Technician",
      icon: Wrench,
      description: "Laboratory management"
    }
  ];

  const handleDemoSelect = (value: string) => {
    const account = demoAccounts.find(acc => acc.role === value);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setSelectedDemo(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password });
      
      // Redirect based on user role
      if (email.includes('admin')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to DIMS
          </h2>
          <p className="text-gray-600">
            Digital Infrastructure Management System
          </p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Access your account to manage infrastructure
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Demo Account Selector */}
              <div className="space-y-2">
                <Label htmlFor="demo-account">Quick Demo Access</Label>
                <Select value={selectedDemo} onValueChange={handleDemoSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a demo account" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoAccounts.map((account) => {
                      const Icon = account.icon;
                      return (
                        <SelectItem key={account.role} value={account.role}>
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4" />
              <div>
                              <div className="font-medium">{account.name}</div>
                              <div className="text-xs text-gray-500">{account.description}</div>
              </div>
            </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or enter manually</span>
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                  <Button
                  type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                  Remember me
                  </Label>
              </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80"
                >
                Forgot password?
              </Link>
            </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                  </>
              ) : (
                  "Sign In"
              )}
            </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
              Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Create one here
              </Link>
            </p>
          </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* Demo Credentials Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-sm">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <div key={account.role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800">{account.name}:</span>
                    </div>
                    <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">
                      {account.email}
                    </code>
                  </div>
                );
              })}
        </div>
            <p className="text-xs text-blue-600 mt-3">
              All demo accounts use password: admin123 (for admin), faculty123 (for faculty), staff123 (for staff), rep123 (for class rep), tech123 (for lab tech)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;