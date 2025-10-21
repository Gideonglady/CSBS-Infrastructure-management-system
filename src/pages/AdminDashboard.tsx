import { BarChart3, AlertCircle, CheckCircle2, Clock, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Issues",
      value: "248",
      change: "+12.5%",
      trend: "up",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      title: "Pending Issues",
      value: "42",
      change: "-8.2%",
      trend: "down",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Resolved Issues",
      value: "189",
      change: "+18.3%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Active Users",
      value: "156",
      change: "+5.4%",
      trend: "up",
      icon: Users,
      color: "text-secondary",
    },
  ];

  const recentIssues = [
    {
      id: "DIMS-2025-0042",
      title: "Projector not working in Room 301",
      status: "pending",
      priority: "high",
      reporter: "Dr. Sarah Smith",
      time: "10 minutes ago",
    },
    {
      id: "DIMS-2025-0041",
      title: "Air conditioning issue in Lab 2",
      status: "in-progress",
      priority: "medium",
      reporter: "John Doe",
      time: "1 hour ago",
    },
    {
      id: "DIMS-2025-0040",
      title: "Broken chairs in Classroom 205",
      status: "completed",
      priority: "low",
      reporter: "Emily Johnson",
      time: "2 hours ago",
    },
    {
      id: "DIMS-2025-0039",
      title: "Network connectivity problem",
      status: "in-progress",
      priority: "critical",
      reporter: "Prof. Michael Brown",
      time: "3 hours ago",
    },
    {
      id: "DIMS-2025-0038",
      title: "Whiteboard markers needed",
      status: "completed",
      priority: "low",
      reporter: "Class Rep - CSE",
      time: "5 hours ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      "in-progress": "default",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("-", " ")}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-destructive text-destructive-foreground",
      high: "bg-warning text-warning-foreground",
      medium: "bg-accent text-accent-foreground",
      low: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">View Reports</Button>
            <Button>New Issue</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card transition-smooth hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Issue Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <BarChart3 className="w-16 h-16 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Equipment", count: 82, color: "bg-primary" },
                  { category: "Infrastructure", count: 64, color: "bg-secondary" },
                  { category: "Cleanliness", count: 48, color: "bg-accent" },
                  { category: "Safety", count: 32, color: "bg-warning" },
                  { category: "Other", count: 22, color: "bg-muted" },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.count / 248) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues Table */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Issues</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Issue ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Reporter</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues.map((issue) => (
                    <tr key={issue.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{issue.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{issue.title}</span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(issue.status)}</td>
                      <td className="py-3 px-4">{getPriorityBadge(issue.priority)}</td>
                      <td className="py-3 px-4 text-sm">{issue.reporter}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{issue.time}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
