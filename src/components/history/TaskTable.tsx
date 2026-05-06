'use client';

interface TaskRow {
  id: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  status: string;
  failCode: string | null;
  failMsg: string | null;
  createdAt: Date | number;
  completedAt: Date | number | null;
  costTime: number | null;
}

interface TaskTableProps {
  tasks: TaskRow[];
  onRowClick: (task: TaskRow) => void;
}

export function TaskTable({ tasks, onRowClick }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">No tasks found</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Prompt</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Parameters</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Date</th>
            <th className="text-left py-3 px-4 font-medium text-zinc-500">Time</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onRowClick(task)}
              className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer"
            >
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'fail' || task.status === 'download_failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4 max-w-xs truncate">{task.prompt}</td>
              <td className="py-3 px-4">
                {task.aspectRatio} / {task.resolution}
              </td>
              <td className="py-3 px-4">{new Date(task.createdAt).toLocaleDateString()}</td>
              <td className="py-3 px-4">
                {task.costTime ? `${(task.costTime / 1000).toFixed(1)}s` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
