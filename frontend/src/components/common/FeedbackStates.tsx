import React from 'react';
import { SearchX, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Results Found',
  description = 'We couldn\'t find any records matching your criteria. Try adjusting your filters or search terms.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-subtle my-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icon || <SearchX className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your network connection and try again.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-red-50/50 rounded-2xl border border-red-200 my-6 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ count?: number; type?: 'card' | 'row' | 'profile' }> = ({
  count = 3,
  type = 'card'
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {items.map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-200 rounded-full w-16" />
              <div className="h-6 bg-slate-200 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};
