// components/timeline-panel.tsx
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phase } from "../../../../lib/types";

interface TimelinePanelProps {
  phases: Phase[];
}

export function TimelinePanel({ phases }: TimelinePanelProps) {
  return (
    <Card className="dark:bg-[#09090B]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Linha do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline vertical line */}
          {phases.length > 1 && (
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-blue-200 dark:bg-blue-900"></div>
          )}
          
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-start relative">
                <div className={`flex-shrink-0 z-10 w-8 h-8 rounded-full 
                  ${index === phases.length - 1 
                    ? "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900" 
                    : "bg-blue-400"}
                  text-white flex items-center justify-center mr-4`}
                >
                  {index + 1}
                </div>
                <div className="flex-grow pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{phase.name}</h3>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(phase.date).toLocaleDateString('pt-PT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}