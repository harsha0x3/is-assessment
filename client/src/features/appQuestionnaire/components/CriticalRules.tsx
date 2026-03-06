import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CriticalityRules = () => {
  return (
    <Card>
      <CardHeader className="text-lg font-semibold">
        Severity Evaluation Rules
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div>
          <Badge variant="destructive">Level 4 - Crown Jewel</Badge>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Question 5 = Yes</li>
            <li>Question 1 = Yes AND (Question 2 OR Question 3 = Yes)</li>
            <li>Question 4 = Yes AND (Question 2 OR Question 3 = Yes)</li>
          </ul>
        </div>

        <div>
          <Badge variant="secondary">Level 3 - High</Badge>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Question 2 OR Question 3 OR Question 6 = Yes</li>
          </ul>
        </div>

        <div>
          <Badge>Level 2 - Medium</Badge>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>(Question 1 AND Question 4 = Yes)</li>
            <li>Question 7 = Yes</li>
          </ul>
        </div>

        <div>
          <Badge variant="outline">Level 1 - Low</Badge>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>No rule matched</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CriticalityRules;
