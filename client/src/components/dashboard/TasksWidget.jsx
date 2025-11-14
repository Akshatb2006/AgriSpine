import React from 'react';
import { Star, Calendar, FileText, ChevronRight } from 'lucide-react';

const TasksWidget = () => {
  const tasks = [
    {
      id: 1,
      title: 'Review Field 3 Rate Fertilizer plan',
      type: 'planning',
      icon: FileText,
      dueDate: 'Tomorrow'
    },
    {
      id: 2,
      title: 'Schedule drone scan for Field 1',
      type: 'monitoring',
      icon: Calendar,
      dueDate: '2 days'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          Upcoming Tasks
          <Star className="ml-2 w-4 h-4 text-gray-400" />
        </h2>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div 
              key={task.id} 
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Icon size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Due: {task.dueDate}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksWidget;