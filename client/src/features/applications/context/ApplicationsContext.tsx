import { createContext, useContext } from "react";
import useApplications from "../hooks/useApplications";

type ApplicationsContextType = ReturnType<typeof useApplications>;
const ApplicationsContext = createContext<ApplicationsContextType | null>(null);

export const ApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const applications = useApplications();

  return (
    <ApplicationsContext.Provider value={applications}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplicationsContext = () => {
  const context = useContext(ApplicationsContext);

  if (!context) {
    throw new Error(
      "useApplicationsContext must ne used within ApplicationsProvider",
    );
  }
  return context;
};
