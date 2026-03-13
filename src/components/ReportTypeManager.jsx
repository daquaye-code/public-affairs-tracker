import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addReportType, updateReportType, deleteReportType } from '../lib/supabase';
import ConfirmDialog from './ConfirmDialog';

export default function ReportTypeManager({ reportTypes, onReload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) {
      toast.error('Report type name is required.');
      return;
    }
    setBusy(true);
    try {
      await addReportType(newName.trim());
      setNewName('');
      setShowAdd(false);
      await onReload();
      toast.success('Report type added.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id) {
    if (!editName.trim()) {
      toast.error('Name is required.');
      return;
    }
    setBusy(true);
    try {
      await updateReportType(id, editName.trim());
      setEditId(null);
      await onReload();
      toast.success('Report type renamed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteReportType(deleteTarget);
      setDeleteTarget(null);
      await onReload();
      toast.success('Report type deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-gray-900">
          Report Types ({reportTypes.length})
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="flex gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <input
            className="input flex-1"
            placeholder="Report type name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={busy}
            className="btn-primary text-xs px-3 py-2"
          >
            <Save size={14} />
          </button>
          <button
            onClick={() => {
              setShowAdd(false);
              setNewName('');
            }}
            className="btn-secondary text-xs px-3 py-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {reportTypes.map((rt) =>
          editId === rt.id ? (
            <div
              key={rt.id}
              className="flex gap-2 p-3 rounded-xl bg-brand-50/50 border border-brand-100"
            >
              <input
                className="input flex-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(rt.id)}
              />
              <button
                onClick={() => handleUpdate(rt.id)}
                disabled={busy}
                className="btn-primary text-xs px-3 py-2"
              >
                <Save size={14} />
              </button>
              <button
                onClick={() => setEditId(null)}
                className="btn-secondary text-xs px-3 py-2"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              key={rt.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">
                {rt.name}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditId(rt.id);
                    setEditName(rt.name);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(rt.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
        {reportTypes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No report types yet. Click Add to create one.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Report Type"
        message="This will remove the report type and all associated submission data. It will also disappear from the dashboard. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
