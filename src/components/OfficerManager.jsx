import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addOfficer, updateOfficer, deleteOfficer } from '../lib/supabase';
import ConfirmDialog from './ConfirmDialog';

export default function OfficerManager({ officers, onReload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newOffice, setNewOffice] = useState('');
  const [editName, setEditName] = useState('');
  const [editOffice, setEditOffice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!newName.trim() || !newOffice.trim()) {
      toast.error('Both name and unit are required.');
      return;
    }
    setBusy(true);
    try {
      await addOfficer(newName.trim(), newOffice.trim());
      setNewName('');
      setNewOffice('');
      setShowAdd(false);
      await onReload();
      toast.success('Officer added.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id) {
    if (!editName.trim() || !editOffice.trim()) {
      toast.error('Both fields are required.');
      return;
    }
    setBusy(true);
    try {
      await updateOfficer(id, editName.trim(), editOffice.trim());
      setEditId(null);
      await onReload();
      toast.success('Officer updated.');
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
      await deleteOfficer(deleteTarget);
      setDeleteTarget(null);
      await onReload();
      toast.success('Officer deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(officer) {
    setEditId(officer.id);
    setEditName(officer.full_name);
    setEditOffice(officer.area_office);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-gray-900">
          Officers ({officers.length})
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
        <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <input
            className="input flex-1"
            placeholder="Full name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="input flex-1"
            placeholder="Unit"
            value={newOffice}
            onChange={(e) => setNewOffice(e.target.value)}
          />
          <div className="flex gap-2">
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
                setNewOffice('');
              }}
              className="btn-secondary text-xs px-3 py-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {officers.map((o) =>
          editId === o.id ? (
            <div
              key={o.id}
              className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl bg-brand-50/50 border border-brand-100"
            >
              <input
                className="input flex-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                className="input flex-1"
                value={editOffice}
                onChange={(e) => setEditOffice(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(o.id)}
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
            </div>
          ) : (
            <div
              key={o.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
            >
              <div>
                <span className="font-medium text-gray-900 text-sm">
                  {o.full_name}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {o.area_office}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(o)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(o.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
        {officers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No officers yet. Click Add to create one.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Officer"
        message="This will permanently remove the officer and all their submission records. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
