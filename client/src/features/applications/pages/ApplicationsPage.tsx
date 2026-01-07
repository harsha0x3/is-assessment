import { Input } from "@/components/ui/input";
import { PlusSquare, PlusSquareIcon, Search } from "lucide-react";
import React from "react";
import AppFilters from "../components/AppFilters";
import AppPagination from "../components/AppPagination";
import useApplications from "../hooks/useApplications";
import AppsTable from "../components/AppsTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ApplicationsPage: React.FC = () => {
  const { appSearchValue, updateSearchParams, appSearchBy } = useApplications();
  const navigate = useNavigate();

  return (
    <div className="h-full w-full space-y-2 overflow-hidden px-2">
      <div className="flex items-center justify-between h-12 px-1 rounded-md bg-accent text-accent-foreground">
        <h1>Applications</h1>
        {/* Search box */}
        <Button className="" onClick={() => navigate("/applications/new")}>
          New
          <PlusSquareIcon />
        </Button>
        <div className="relative max-w-100 min-w-70">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            type="text"
            name="email_or_username"
            value={appSearchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateSearchParams({ appSearch: e.target.value });
            }}
            placeholder={`Search app by ${appSearchBy}`}
            className="w-full pl-10 pr-3 py-2 border"
          />
        </div>
        <div className="flex gap-2">
          <AppFilters />
          <AppPagination />
        </div>
      </div>
      <div>
        <AppsTable />
      </div>
    </div>
  );
};

export default ApplicationsPage;
