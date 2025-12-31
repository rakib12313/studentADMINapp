import React, { useState } from "react";
import { Card, Button, Input, Badge } from "./components/UI";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Settings, 
  Search, 
  Plus, 
  Bell,
  MoreVertical 
} from "lucide-react";

// Mock Data
const STUDENTS = [
  { id: 1, name: "Alice Johnson", grade: "10th", gpa: "3.8", status: "Active", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", grade: "11th", gpa: "3.2", status: "Warning", email: "bob@example.com" },
  { id: 3, name: "Charlie Brown", grade: "9th", gpa: "3.9", status: "Active", email: "charlie@example.com" },
  { id: 4, name: "Diana Prince", grade: "12th", gpa: "4.0", status: "Active", email: "diana@example.com" },
  { id: 5, name: "Evan Wright", grade: "10th", gpa: "2.8", status: "Inactive", email: "evan@example.com" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = STUDENTS.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "260px", 
        backgroundColor: "var(--sidebar-bg)", 
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "2rem", paddingLeft: "0.5rem" }}>
          <div style={{ 
            width: "32px", 
            height: "32px", 
            background: "var(--primary-color)", 
            borderRadius: "8px",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "white"
          }}>
            <GraduationCap size={20} />
          </div>
          <span style={{ fontWeight: "700", fontSize: "1.25rem", letterSpacing: "-0.025em" }}>EduAdmin</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          <NavItem 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavItem 
            active={activeTab === "students"} 
            onClick={() => setActiveTab("students")} 
            icon={<Users size={20} />} 
            label="Students" 
          />
          <NavItem 
            active={activeTab === "courses"} 
            onClick={() => setActiveTab("courses")} 
            icon={<GraduationCap size={20} />} 
            label="Courses" 
          />
          <NavItem 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
            icon={<Settings size={20} />} 
            label="Settings" 
          />
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
              alt="Admin" 
              style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e2e8f0" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>Jane Admin</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>School Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ 
          height: "70px", 
          borderBottom: "1px solid var(--border-color)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "0 2rem",
          backgroundColor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)"
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button variant="ghost" icon={<Bell size={20} />} />
            <Button variant="primary" icon={<Plus size={18} />}>New Entry</Button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
          {activeTab === "students" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                <StatCard title="Total Students" value="1,234" trend="+5.2%" />
                <StatCard title="Average GPA" value="3.4" trend="+1.2%" />
                <StatCard title="Attendance Rate" value="94.5%" trend="-0.5%" trendNegative />
              </div>

              {/* Table Section */}
              <Card>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "1.5rem" 
                }}>
                  <div style={{ position: "relative", width: "300px" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <Input 
                      placeholder="Search students..." 
                      style={{ paddingLeft: "36px", width: "100%" }} 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>Name</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>Email</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>Grade</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>GPA</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>Status</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: "500", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} className="hover-row">
                          <td style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "0.75rem" }}>
                                {student.name.charAt(0)}
                              </div>
                              <span style={{ fontWeight: "500" }}>{student.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{student.email}</td>
                          <td style={{ padding: "1rem" }}>{student.grade}</td>
                          <td style={{ padding: "1rem", fontWeight: "600" }}>{student.gpa}</td>
                          <td style={{ padding: "1rem" }}>
                            <Badge status={student.status} />
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right" }}>
                            <Button variant="ghost" icon={<MoreVertical size={16} />} style={{ padding: "0.5rem" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                      No students found matching your search.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
              Content for {activeTab} coming soon...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Subcomponents for internal use
const NavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      width: "100%",
      textAlign: "left",
      color: active ? "var(--text-primary)" : "var(--text-secondary)",
      backgroundColor: active ? "var(--bg-color)" : "transparent",
      fontWeight: active ? "600" : "500",
      transition: "all 0.2s"
    }}
  >
    <span style={{ color: active ? "var(--primary-color)" : "inherit" }}>{icon}</span>
    {label}
  </button>
);

const StatCard = ({ title, value, trend, trendNegative }: any) => (
  <Card>
    <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "0.5rem" }}>{title}</h3>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <span style={{ fontSize: "1.875rem", fontWeight: "700" }}>{value}</span>
      <span style={{ 
        fontSize: "0.875rem", 
        color: trendNegative ? "var(--danger-color)" : "var(--success-color)",
        backgroundColor: trendNegative ? "#fef2f2" : "#f0fdf4",
        padding: "0.25rem 0.5rem",
        borderRadius: "99px",
        fontWeight: "500"
      }}>
        {trend}
      </span>
    </div>
  </Card>
);
