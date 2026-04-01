import { VerticalsMultiSelect } from "@/features/verticals/components/VerticalsMultiSelect";
import { useEffect, useState } from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";

import { selectAuth } from "@/features/auth/store/authSlice";
import { useSelector } from "react-redux";

interface Props {
  orientation?: "horizontal" | "vertical";
}

const VerticalSearchFilter: React.FC<Props> = ({
  orientation = "vertical",
}) => {
  const { appVerticalIds, updateSearchParams } = useApplicationsContext();
  const currentUserInfo = useSelector(selectAuth);
  const [selectedVerticals, setSelectedVerticals] = useState<number[]>([]);

  const canCreateVertical = ["manager", "admin"].includes(
    currentUserInfo?.role ?? "",
  );
  useEffect(() => {
    if (!!appVerticalIds) {
      setSelectedVerticals(appVerticalIds.split(",").map((id) => Number(id)));
    }
  }, [appVerticalIds]);

  const onVerticalChange = (val: number[] | number | null) => {
    setSelectedVerticals(Array.isArray(val) ? val : val ? [val] : []);
    updateSearchParams({
      appVerticalIds: Array.isArray(val)
        ? val.join(",")
        : val
          ? String(val)
          : null,
    });
  };

  return (
    <VerticalsMultiSelect
      onChange={onVerticalChange}
      canCreate={canCreateVertical}
      isMultiSelect={false}
      value={selectedVerticals}
      label="Vertical"
      orientation={orientation}
    />
  );
};

export default VerticalSearchFilter;
