import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { TuitionJob } from '../../types';
import { applicationsApi } from '../../api/applications';
import { CheckCircle2, Send, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApplyJobModalProps {
  job: TuitionJob | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [coverMessage, setCoverMessage] = useState(
    'I am an experienced tutor from BUET/DU and I am confident in helping the student achieve top grades in the selected subjects. Available for a free trial class.'
  );
  const [expectedSalary, setExpectedSalary] = useState(job ? job.salary : 8000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await applicationsApi.applyForJob(job.id, coverMessage, Number(expectedSalary));
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for Tuition Job (${job.job_id})`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Your application and verified tutor profile have been sent to the guardian. You can track status in your dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Job Overview Pill */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Job</p>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{job.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
              <span>📍 {job.area}, {job.city}</span>
              <span>📚 {job.class_level}</span>
              <span>💵 Offered: ৳{job.salary.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Expected Salary Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Your Expected Monthly Salary (৳ BDT)
            </label>
            <Input
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(Number(e.target.value))}
              placeholder="e.g. 8000"
              leftIcon={<DollarSign className="w-4 h-4" />}
              required
            />
          </div>

          {/* Cover Message */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cover Note / Why you are best suited
            </label>
            <textarea
              rows={4}
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Introduce your university background, previous tutoring achievements, and demo availability..."
              required
            />
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-brand-50/50 p-2.5 rounded-lg border border-brand-100">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Your verified academic certificates will be shared automatically with the guardian.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>

        </form>
      )}
    </Modal>
  );
};
