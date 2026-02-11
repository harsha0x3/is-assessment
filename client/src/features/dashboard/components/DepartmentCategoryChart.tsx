import React from "react";
import type { CategorySummaryItem } from "../types";
import CategoryDonut from "./CategoyDonut";

interface Props {
  categories: CategorySummaryItem[];
}
const DepartmentCategoryChart: React.FC<Props> = ({ categories }) => {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {categories.map((cat) => (
        <CategoryDonut
          key={cat.category}
          category={cat.category}
          total={cat.total}
          statuses={cat.statuses}
        />
      ))}
    </div>
  );
};

export default DepartmentCategoryChart;
