import React from "react";
import { useGetAppCompletionSummaryQuery } from "../../store/dashboardApiSlice"; // Adjust your import
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

const AppCompletionChart: React.FC = () => {
  // Fetch data from your API
  const { data, isLoading, error } = useGetAppCompletionSummaryQuery();

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
  const orderedBuckets = ["0-30 days", "31-60 days", "61-90 days", "90+ days"];

  const sortedData = [...(data || [])].sort(
    (a, b) =>
      orderedBuckets.indexOf(a.bucket) - orderedBuckets.indexOf(b.bucket),
  );

  return (
    <Card className="max-w-200 min-w-100 h-150 w-130">
      <CardHeader>
        <CardTitle className="text-center">
          Application Completion Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis dataKey="bucket" tickMargin={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" radius={5}>
              <LabelList
                dataKey="count"
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

export default AppCompletionChart;
