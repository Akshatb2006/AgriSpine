import React from 'react';
import { Star, AlertTriangle, Cloud, ChevronRight } from 'lucide-react';

const AlertsWidget = () => {
  const alerts = [
    {
      id: 1,
      type: 'urgent',
      icon: AlertTriangle,
      title: 'URGENT: Field 3',
      description: 'Early Field 3 signs of aphid infestation detected',
      field: 'Field 3',
      time: '2 hours ago'
    }
  ];

  const insights = [
    {
      id: 1,
      type: 'warning',
      icon: Cloud,
      title: 'WARNING: Pest/Disease',
      description: 'Moderate water stress detected',
      field: 'Field 1',
      recommendation: 'Consider irrigation.'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Apply Variable-Rate Fertilizer to Field 2',
      dueDate: 'Today'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-time Alerts & Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            Real-time Alerts & Insights
            <Star className="ml-2 w-4 h-4 text-gray-400" />
          </h2>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-500 text-white p-2 rounded-lg">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900 dark:text-red-100">
                      {alert.title}
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-500 text-white p-2 rounded-lg">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                      {insight.title}
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      {insight.field}: {insight.description}
                    </p>
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            Upcoming Tasks
            <Star className="ml-2 w-4 h-4 text-gray-400" />
          </h2>
        </div>

        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: {task.dueDate}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsWidget;