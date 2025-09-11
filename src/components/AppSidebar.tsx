import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Users, GraduationCap, FileSpreadsheet, ChevronRight } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: BarChart3,
  description: "Overview & Analytics"
}, {
  title: "Student Directory",
  url: "/students",
  icon: Users,
  description: "Browse Students"
}, {
  title: "Academic Performance",
  url: "/academics",
  icon: GraduationCap,
  description: "Academic Records"
}, {
  title: "Reports",
  url: "/reports",
  icon: FileSpreadsheet,
  description: "Export & Reports"
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };
  const getNavClassName = (path: string) => {
    const baseClasses = "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 w-full overflow-hidden";
    const activeClasses = "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/20 shadow-lg";
    const inactiveClasses = "text-muted-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20 hover:text-accent-foreground hover:shadow-md hover:border hover:border-accent/30";
    
    return isActive(path) ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };
  return <Sidebar className="border-r border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-md shadow-xl">
      <SidebarContent className="pt-6 px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4 opacity-70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-background/50 shadow-sm">
                        <item.icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                      </div>
                      {state === "expanded" && <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          <span className="text-xs opacity-75 truncate">{item.description}</span>
                        </div>}
                      {state === "expanded" && isActive(item.url) && (
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}