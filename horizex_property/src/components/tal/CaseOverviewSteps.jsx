import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { talCaseService } from '../../mock/mockServices';

// The exact 8 steps requested by the client in order
export const TAL_OVERVIEW_STEPS = [
  { 
    id: 'submit_application', 
    stepNumber: 1,
    label: 'submit application',
    title: 'Submit Application',
    description: 'Prepare and formally submit the TAL legal case application with the tribunal registry.'
  },
  { 
    id: 'deliver_application', 
    stepNumber: 2,
    label: 'deliver application',
    title: 'Deliver Application',
    description: 'Officially serve or deliver the submitted application to the tenant.'
  },
  { 
    id: 'upload_pod_1', 
    stepNumber: 3,
    label: 'upload proof of delivery',
    title: 'Upload Proof of Delivery',
    description: 'Upload signed delivery receipt, registered mail stub, or bailiff certificate.'
  },
  { 
    id: 'upload_rn', 
    stepNumber: 4,
    label: 'upload rn',
    title: 'Upload RN',
    description: 'Upload the Rôle Numérique (RN) notice of hearing issued by the TAL.'
  },
  { 
    id: 'deliver_rn', 
    stepNumber: 5,
    label: 'deliver rn',
    title: 'Deliver RN',
    description: 'Deliver the RN hearing notice package to the tenant within the required deadline.'
  },
  { 
    id: 'upload_pod_2', 
    stepNumber: 6,
    label: 'upload proof of delivery',
    title: 'Upload Proof of Delivery',
    description: 'Upload second proof of delivery confirming the RN was served to the tenant.'
  },
  { 
    id: 'upload_non_availabilities', 
    stepNumber: 7,
    label: 'upload non-availabilities',
    title: 'Upload Non-Availabilities',
    description: 'File counsel and party non-availability calendar with the tribunal coordinator.'
  },
  { 
    id: 'prepare_for_hearing', 
    stepNumber: 8,
    label: 'prepare for hearing',
    title: 'Prepare for Hearing',
    description: 'Assemble all evidentiary documents, rent roll statements, witness lists, and legal arguments.'
  }
];

export const CaseOverviewSteps = ({ 
  selectedCaseId = null, 
  onCaseChange = null,
  availableCases = [],
  title = "TAL Case Overview Steps to Follow"
}) => {
  // Case selection state
  const [activeCaseId, setActiveCaseId] = useState(selectedCaseId || (availableCases[0]?.id || 1));
  const [completedSteps, setCompletedSteps] = useState({});
  const [completionTimestamps, setCompletionTimestamps] = useState({});

  // Sync activeCaseId if parent passes new selectedCaseId
  useEffect(() => {
    if (selectedCaseId) {
      setActiveCaseId(selectedCaseId);
    } else if (availableCases.length > 0 && !activeCaseId) {
      setActiveCaseId(availableCases[0].id);
    }
  }, [selectedCaseId, availableCases]);

  // Load steps completion state from localStorage for active case
  useEffect(() => {
    if (!activeCaseId) return;
    const storageKey = `tal_overview_steps_case_${activeCaseId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedSteps(parsed.completed || {});
        setCompletionTimestamps(parsed.timestamps || {});
      } else {
        // Initial defaults: if case status is further along, mark initial step done
        const defaultCompleted = { submit_application: true };
        const defaultTimestamps = { submit_application: new Date().toLocaleDateString('en-CA') };
        setCompletedSteps(defaultCompleted);
        setCompletionTimestamps(defaultTimestamps);
        localStorage.setItem(storageKey, JSON.stringify({
          completed: defaultCompleted,
          timestamps: defaultTimestamps
        }));
      }
    } catch (e) {
      console.error('Error loading TAL case steps', e);
    }
  }, [activeCaseId]);

  // Toggle step done/undone
  const handleToggleStep = (stepId) => {
    if (!activeCaseId) return;
    const storageKey = `tal_overview_steps_case_${activeCaseId}`;
    
    const isCurrentlyDone = !!completedSteps[stepId];
    const newCompleted = { ...completedSteps, [stepId]: !isCurrentlyDone };
    const newTimestamps = { ...completionTimestamps };

    if (!isCurrentlyDone) {
      newTimestamps[stepId] = new Date().toLocaleDateString('en-CA');
    } else {
      delete newTimestamps[stepId];
    }

    setCompletedSteps(newCompleted);
    setCompletionTimestamps(newTimestamps);

    localStorage.setItem(storageKey, JSON.stringify({
      completed: newCompleted,
      timestamps: newTimestamps
    }));

    // If case object has timeline, optionally add a timeline log
    try {
      const stepConfig = TAL_OVERVIEW_STEPS.find(s => s.id === stepId);
      if (stepConfig && !isCurrentlyDone) {
        talCaseService.update(activeCaseId, {
          internalNotes: `Step completed: ${stepConfig.label}`
        });
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const handleResetSteps = () => {
    if (!window.confirm('Reset all steps for this TAL Case?')) return;
    const storageKey = `tal_overview_steps_case_${activeCaseId}`;
    setCompletedSteps({});
    setCompletionTimestamps({});
    localStorage.removeItem(storageKey);
  };

  // Progress calculations
  const totalSteps = TAL_OVERVIEW_STEPS.length;
  const completedCount = TAL_OVERVIEW_STEPS.filter(s => !!completedSteps[s.id]).length;
  const percentComplete = Math.round((completedCount / totalSteps) * 100);

  // Active case data
  const currentCase = availableCases.find(c => c.id === parseInt(activeCaseId)) || {
    caseNumber: `TAL-CASE-${activeCaseId}`,
    tenantName: 'Tenant Case File',
    propertyName: 'Property'
  };

  return (
    <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckSquare size={16} />
            </span>
            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Follow the mandatory 8-step TAL workflow sequence. Mark each checkbox as tasks are completed.
          </p>
        </div>

        {/* Case selector (if multiple cases provided and handler allowed) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {availableCases.length > 0 && (
            <div className="flex-1 sm:flex-initial">
              <select
                value={activeCaseId}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setActiveCaseId(id);
                  if (onCaseChange) onCaseChange(id);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {availableCases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.tenantName} ({c.propertyName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleResetSteps}
            title="Reset steps"
            className="text-[10px] font-bold h-8 px-2.5 text-slate-400 hover:text-slate-600"
          >
            <RotateCcw size={12} className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress Bar & Milestone Indicator */}
      <div className="my-5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 tracking-tight">
              TAL Progression: {completedCount} of {totalSteps} Steps Done
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              percentComplete === 100 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}>
              {percentComplete}% Done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Active Case: <span className="font-bold text-slate-700">{currentCase.caseNumber}</span> &bull; {currentCase.tenantName}
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-64">
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                percentComplete === 100 
                  ? 'bg-emerald-500' 
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1 uppercase">
            <span>Start</span>
            <span>Hearing Ready</span>
          </div>
        </div>
      </div>

      {/* 8 Steps List with Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TAL_OVERVIEW_STEPS.map((step, idx) => {
          const isDone = !!completedSteps[step.id];
          const completedDate = completionTimestamps[step.id];

          return (
            <div
              key={`${step.id}-${idx}`}
              onClick={() => handleToggleStep(step.id)}
              className={`group flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isDone 
                  ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              {/* Checkbox Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStep(step.id);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isDone 
                    ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200' 
                    : 'border-2 border-slate-300 group-hover:border-indigo-500 text-transparent bg-white'
                }`}
                aria-label={`Mark ${step.label} as done`}
              >
                {isDone ? (
                  <CheckSquare size={14} className="stroke-[2.5]" />
                ) : (
                  <Square size={14} className="text-slate-300 group-hover:text-indigo-400" />
                )}
              </button>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                      isDone 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      Step {step.stepNumber}
                    </span>
                    <span className={`text-xs font-bold tracking-tight capitalize ${
                      isDone ? 'text-slate-800 line-through decoration-emerald-500/60 font-semibold' : 'text-slate-800 font-black'
                    }`}>
                      {step.label}
                    </span>
                  </div>

                  {/* Done / Pending Badge */}
                  {isDone ? (
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Done {completedDate && `• ${completedDate}`}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      Pending
                    </span>
                  )}
                </div>

                <p className={`text-[11px] mt-1 leading-snug transition-colors ${
                  isDone ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Helper Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-indigo-500" />
          Click any step or checkbox to mark task as done. Changes save automatically.
        </span>
        <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
          TAL Case Steps Workflow v1.0
        </span>
      </div>
    </Card>
  );
};

export default CaseOverviewSteps;
