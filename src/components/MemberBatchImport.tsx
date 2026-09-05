import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileUp, Loader2, Upload } from 'lucide-react';
import { api, MemberImportJobDto } from '../api/client';

interface MemberBatchImportProps {
  enabled: boolean;
  onCompleted: () => void | Promise<void>;
}

const terminalStatuses = new Set<MemberImportJobDto['status']>(['COMPLETED', 'FAILED']);

export const MemberBatchImport: React.FC<MemberBatchImportProps> = ({ enabled, onCompleted }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<MemberImportJobDto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = async () => setJobs(await api.getMemberImportJobs());

  useEffect(() => {
    if (!enabled) return;
    void loadJobs().catch(() => undefined);
  }, [enabled]);

  useEffect(() => {
    if (!jobs.some((job) => !terminalStatuses.has(job.status))) return;
    const interval = window.setInterval(() => {
      void loadJobs()
        .then((nextJobs) => {
          if (nextJobs.some((job) => job.status === 'COMPLETED')) void onCompleted();
        })
        .catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [jobs, onCompleted]);

  if (!enabled) return null;

  const upload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError('');
    try {
      const job = await api.startMemberImport(selectedFile);
      setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError: any) {
      setError(uploadError.message || 'Unable to start member import.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2"><FileUp className="h-5 w-5 text-cyan-300" /><h3 className="text-base font-semibold text-white">Bulk member import</h3></div>
          <p className="mt-1 text-sm text-slate-400">Queue a CSV for background import. The browser receives a job ID immediately; the file is streamed and committed in 5,000-member batches.</p>
          <p className="mt-2 font-mono text-xs text-slate-500">Required headers: external_user_id,email,tier</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Choose CSV</button>
          <button type="button" onClick={() => void upload()} disabled={!selectedFile || isUploading} className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Queue import
          </button>
        </div>
      </div>
      {selectedFile && <p className="mt-3 text-xs text-cyan-200">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
      {error && <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose-400"><AlertCircle className="h-4 w-4" />{error}</p>}
      {!!jobs.length && <div className="mt-5 overflow-x-auto rounded-md border border-slate-800"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-800 text-slate-500"><tr><th className="p-3">File</th><th className="p-3">Status</th><th className="p-3">Progress</th><th className="p-3">Imported</th><th className="p-3">Duplicates</th><th className="p-3">Failed</th></tr></thead><tbody>{jobs.map((job) => {
        const progress = job.totalRecords ? Math.round((job.processedRecords / job.totalRecords) * 100) : 0;
        return <tr key={job.id} className="border-b border-slate-800/70 last:border-0"><td className="p-3 text-slate-200"><div>{job.fileName}</div>{job.errorSummary && <div className="mt-1 max-w-sm whitespace-pre-wrap text-rose-400">{job.errorSummary}</div>}</td><td className={`p-3 font-medium ${job.status === 'COMPLETED' ? 'text-emerald-300' : job.status === 'FAILED' ? 'text-rose-300' : 'text-cyan-300'}`}>{job.status}</td><td className="p-3 text-slate-300">{job.status === 'COMPLETED' ? '100%' : `${progress}%`} <span className="text-slate-500">({job.processedRecords.toLocaleString()})</span></td><td className="p-3 text-slate-300">{job.importedRecords.toLocaleString()}</td><td className="p-3 text-slate-400">{job.duplicateRecords.toLocaleString()}</td><td className="p-3 text-slate-400">{job.failedRecords.toLocaleString()}</td></tr>;
      })}</tbody></table></div>}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />Duplicate external user IDs are skipped safely; every imported member receives redemption and recognition accounts.</div>
    </section>
  );
};
