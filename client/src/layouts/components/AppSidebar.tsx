// src\layouts\components\AppSidebar.tsx
import React, { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
import { ISLogo } from "@/components/ui/ISLogo";
import { SidebarFooter } from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import {
  useLogoutMutation,
  useGetMeQuery,
} from "@/features/auth/store/authApiSlice";
import UserDetailsDialog from "@/features/user_management/components/UserDetailsDialog";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { toast } from "sonner";

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
    roles: ["admin"],
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
  const [logout] = useLogoutMutation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);

  const { data: meData } = useGetMeQuery(undefined, {
    skip: !openUserDialog,
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-row items-center gap-2 px-2">
        <ISLogo className="h-8 w-8 shrink-0" />

        <span className="font-bold text-lg whitespace-nowrap group-data-[collapsible=icon]:hidden">
          IS Assessments
        </span>
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
      <SidebarFooter className="px-2 pb-2">
        <Popover open={openProfile} onOpenChange={setOpenProfile}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-md p-2 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {currentUserInfo.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                {currentUserInfo.full_name}
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent side="right" align="end" className="w-40">
            <div className="flex flex-col gap-1">
              <button
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm"
                onClick={() => {
                  setOpenProfile(false);
                  setOpenUserDialog(true);
                }}
              >
                <User className="h-4 w-4" />
                Profile
              </button>

              <button
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-sm text-destructive"
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
              </button>
            </div>
          </PopoverContent>
        </Popover>

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
