'use client';

import { motion } from 'motion/react';
import { FileText, UserPlus, Settings, Download, Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'document' | 'user' | 'settings' | 'download';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'document':
      return FileText;
    case 'user':
      return UserPlus;
    case 'settings':
      return Settings;
    case 'download':
      return Download;
    default:
      return Clock;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'document':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'user':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'settings':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'download':
      return 'bg-brand-gold/20 text-brand-gold border-brand-gold/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Latest actions</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="relative flex gap-4 pb-4 border-l-2 border-gray-200 dark:border-gray-700 ml-3 pl-6 last:border-0"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${colorClass}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          by {activity.user}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
