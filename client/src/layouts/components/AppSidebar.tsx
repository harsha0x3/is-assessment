// src\layouts\components\AppSidebar.tsx
import React, { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  BarChart2,
  ChevronRight,
  Laptop,
  LayoutGridIcon,
  Moon,
  PieChart,
  Sun,
  Users2Icon,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";
import { ISLogo } from "@/components/ui/ISLogo";
import { SidebarFooter } from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import {
  useLogoutMutation,
  useGetMeQuery,
} from "@/features/auth/store/authApiSlice";
import UserDetailsDialog from "@/features/user_management/components/UserDetailsDialog";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/themeContext/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Theme } from "@/context/themeContext/types";

type SidebarData = {
  title: string;
  path: string;
  isActive: boolean;
  icon?: LucideIcon;
  roles: string[];
  children?: SidebarData[];
};

const sidebarItems: SidebarData[] = [
  {
    title: "OverAll Dashboard",
    isActive: false,
    path: "/dashboard/primary",
    icon: PieChart,
    roles: ["admin", "moderator", "user", "manager"],
  },
  {
    title: "Priority Dashboard",
    isActive: false,
    path: "/dashboard/secondary",
    icon: BarChart2,
    roles: ["admin", "moderator", "user", "manager"],
  },
  // {
  //   title: "Dashboard",
  //   path: "/dashboard/primary",
  //   isActive: false,
  // icon: PieChart,
  //   roles: ["admin", "moderator", "user", "manager"],
  //   children: [
  //     {
  //       title: "Primary",
  //       isActive: false,
  //       path: "/dashboard/primary",
  //       roles: ["admin", "moderator", "user", "manager"],
  //     },
  //     {
  //       title: "Secondary",
  //       isActive: false,
  //       path: "/dashboard/secondary",
  //       roles: ["admin", "moderator", "user", "manager"],
  //     },
  //   ],
  // },
  {
    title: "Apps",
    path: "/applications",
    isActive: false,
    icon: LayoutGridIcon,
    roles: ["admin", "moderator", "user", "manager"],
  },
  {
    title: "User Management",
    path: "/users/all",
    isActive: false,
    icon: Users2Icon,
    roles: ["admin"],
  },
];

const AppSidebar: React.FC = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUserInfo = useSelector(selectAuth);
  const [logout] = useLogoutMutation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);

  const { data: meData } = useGetMeQuery(undefined, {
    skip: !openUserDialog,
  });

  const isItemActive = (path?: string) =>
    path ? location.pathname.startsWith(path) : false;

  const isAnyChildActive = (children?: SidebarData[]) =>
    children?.some((child) => isItemActive(child.path));

  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-row items-center gap-2 px-2">
        <ISLogo className="h-8 w-8 shrink-0" />

        <span className="font-bold text-lg whitespace-nowrap group-data-[collapsible=icon]:hidden">
          IS Assessments
        </span>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-3">
        <SidebarMenu className="gap-2">
          {sidebarItems.map((item) => {
            if (!item.roles.includes(currentUserInfo.role)) return null;

            // 🔽 DASHBOARD WITH CHILDREN
            if (item.children) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem key={item.title}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isAnyChildActive(item.children)}
                        tooltip={item.title}
                        onClick={() => navigate(item.path)}
                      >
                        {item.icon && (
                          <item.icon
                            className={`${isAnyChildActive(item.children) ? "text-ring" : ""}`}
                          />
                        )}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="">
                      <SidebarMenuSub className="gap-2 pt-2">
                        {item.children.map((child) => {
                          if (!child.roles.includes(currentUserInfo.role))
                            return null;

                          return (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                isActive={isItemActive(child.path)}
                                onClick={() => navigate(child.path!)}
                                className="text-sm cursor-default"
                              >
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // 🔹 NORMAL ITEMS
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isItemActive(item.path)}
                  onClick={() => navigate(item.path!)}
                  tooltip={item.title}
                >
                  {item.icon && (
                    <item.icon
                      className={`${isItemActive(item.path) ? "text-ring" : ""}`}
                    />
                  )}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-2">
        <DropdownMenu open={openProfile} onOpenChange={setOpenProfile}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"ghost"}
              className="flex items-center gap-2 w-full rounded-md p-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {currentUserInfo.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                {currentUserInfo.full_name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" className="">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center gap-2 px-0 rounded text-sm"
                onClick={() => {
                  setOpenProfile(false);
                  setOpenUserDialog(true);
                }}
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                variant={"destructive"}
                className="flex items-center gap-2 px-0 rounded text-sm"
                onClick={async () => {
                  setOpenProfile(false);
                  try {
                    await logout().unwrap();
                  } catch (error) {
                    const errMsg =
                      getApiErrorMessage(error) ?? "Error logging out";
                    toast.error(errMsg);
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>

              <DropdownMenuLabel className="flex flex-col items-start gap-2 hover:none">
                <span className="text-xs font-medium text-muted-foreground">
                  Theme
                </span>
                <div className="flex justify-between items-center w-full">
                  {["light", "dark", "system"].map((t) => {
                    const isActive = theme === t;

                    const Icon =
                      t === "light" ? Sun : t === "dark" ? Moon : Laptop;

                    return (
                      <Button
                        key={t}
                        onClick={() => setTheme(t as Theme)}
                        variant={isActive ? "default" : "ghost"}
                      >
                        <Icon className="w-4 h-4" />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    );
                  })}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dialog */}
        {meData?.data && (
          <UserDetailsDialog
            user={meData?.data ?? null}
            open={openUserDialog}
            onOpenChange={setOpenUserDialog}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
