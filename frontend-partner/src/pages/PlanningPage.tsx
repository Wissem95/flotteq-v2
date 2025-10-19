import { useState } from 'react';
import { Calendar, Clock, Settings } from 'lucide-react';
import AvailabilityEditor from '../components/planning/AvailabilityEditor';
import UnavailabilityManager from '../components/planning/UnavailabilityManager';
import ServiceSettings from '../components/planning/ServiceSettings';

type TabType = 'schedule' | 'unavailability' | 'services';

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  const tabs = [
    { id: 'schedule' as TabType, label: 'Horaires d\'ouverture', icon: Clock },
    { id: 'unavailability' as TabType, label: 'Jours fermés', icon: Calendar },
    { id: 'services' as TabType, label: 'Services', icon: Settings },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Planning</h1>
        <p className="text-gray-600">
          Gérez vos horaires d'ouverture, jours fermés et services
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-flotteq-blue text-flotteq-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'schedule' && <AvailabilityEditor />}
        {activeTab === 'unavailability' && <UnavailabilityManager />}
        {activeTab === 'services' && <ServiceSettings />}
      </div>
    </div>
  );
}
