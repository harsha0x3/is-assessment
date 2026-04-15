import React, { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useGetDeptCompletionStatsQuery } from "../../store/dashboardApiSlice";
import DateRangeFilter from "@/features/_filters/DateRangeFilter";

const DeptCompletionChart: React.FC = () => {
  const [toDate, setToDate] = useState<string>();
  const [fromDate, setFromDate] = useState<string>();
  const { data, isLoading, error } = useGetDeptCompletionStatsQuery({
    to_date: toDate,
    from_date: fromDate,
  });
  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>Error loading data</CardContent>
      </Card>
    );
  }
  return (
    <Card className="h-120 w-3xl gap-1">
      <CardHeader className="flex w-full items-center justify-between">
        <div />
        <CardTitle className="text-center">
          Department Wise Completion Summary
        </CardTitle>
        <div>
          <DateRangeFilter
            from={fromDate}
            to={toDate}
            onChange={({ from, to }) => {
              setFromDate(from);
              setToDate(to);
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="w-full h-full flex">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 15 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis dataKey="department" tickMargin={10} angle={-20} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="completed_count" fill="#4f46e5" radius={5}>
              <LabelList
                dataKey="completed_count"
                position="top"
                style={{ fontSize: 14, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DeptCompletionChart;
