import React from "react";
import type { CategorySummaryItem } from "../types";
import CategoryDonut from "./CategoryDonut";

interface Props {
  departmentName: string;
  categories: CategorySummaryItem[];
}
const DepartmentCategoryChart: React.FC<Props> = ({
  categories,
  departmentName,
}) => {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {categories.map((cat) => (
        <CategoryDonut
          key={cat.category}
          category={cat.category}
          departmentName={departmentName}
          total={cat.total}
          statuses={cat.statuses}
        />
      ))}
    </div>
  );
};

export default DepartmentCategoryChart;
