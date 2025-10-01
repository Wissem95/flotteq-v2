import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface FleetStatusCardProps {
  title: string;
  description: string;
  value: number;
  subtitle?: string;
  progress?: number;
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
}

const FleetStatusCard: React.FC<FleetStatusCardProps> = ({
  title,
  description,
  value,
  subtitle,
  progress,
  icon: Icon,
  iconColor = "text-flotteq-blue",
  isLoading = false,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Icon className={`mr-2 ${iconColor}`} size={20} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-3xl font-bold">-</div>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {subtitle && (
              <div className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </div>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="h-2 mt-2" />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FleetStatusCard;