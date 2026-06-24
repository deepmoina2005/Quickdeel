const styles = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Sold: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  SOLD: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Open: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  OPEN: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Flagged: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Banned: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Resolved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  REVIEWED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  DISMISSED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function StatusBadge({ status }) {
  const label = status === 'APPROVED' ? 'Published' : status;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Inactive}`}>{label}</span>;
}
