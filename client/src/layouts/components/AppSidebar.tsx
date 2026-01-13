// src\layouts\components\AppSidebar.tsx
import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  LayoutGridIcon,
  Users2Icon,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";
import Hint from "@/components/ui/hint";

type SidebarData = {
  title: string;
  path: string;
  isActive: boolean;
  icon?: LucideIcon;
  roles: string[];
};

const sidebarItems: SidebarData[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    isActive: false,
    icon: LayoutDashboardIcon,
    roles: ["admin", "moderator", "user"],
  },
  {
    title: "Apps",
    path: "/applications",
    isActive: false,
    icon: LayoutGridIcon,
    roles: ["admin", "moderator", "user"],
  },
  {
    title: "User Management",
    path: "/users/all",
    isActive: false,
    icon: Users2Icon,
    roles: ["admin", "moderator", "user"],
  },
];

const AppSidebar: React.FC = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isItemActive = (item: SidebarData) => {
    return location.pathname.includes(item.path);
  };

  const currentUserInfo = useSelector(selectAuth);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTrigger className="-ml-1" />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {sidebarItems.map((item) => {
            if (item.roles.includes(currentUserInfo.role)) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isItemActive(item)}
                    onClick={() => navigate(item.path)}
                    className="hover:cursor-pointer"
                  >
                    {item.icon && (
                      <Hint label={item.title} side="right">
                        <item.icon />
                      </Hint>
                    )}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
