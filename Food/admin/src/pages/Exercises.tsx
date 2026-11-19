import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiRequestWithMeta } from '../api';
import type { Exercise, PageMeta } from '../types';

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes', 'cardio', 'full_body'];
const EQUIPMENT = ['barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight', 'bands', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

interface ExerciseForm {
  name: string;
  description: string;
  targetMuscle: string;
  secondaryMuscles: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  commonMistakes: string;
  safetyTips: string;
  defaultSets: number;
  defaultReps: number;
  caloriesPerMinute: number;
  imageUrls: string;
  videoUrl: string;
}

const emptyForm: ExerciseForm = {
  name: '',
  description: '',
  targetMuscle: 'chest',
  secondaryMuscles: '',
  equipment: 'barbell',
  difficulty: 'beginner',
  instructions: '',
  commonMistakes: '',
  safetyTips: '',
  defaultSets: 3,
  defaultReps: 10,
  caloriesPerMinute: 6,
  imageUrls: '',
  videoUrl: '',
};

function toPayload(f: ExerciseForm) {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    targetMuscle: f.targetMuscle,
    secondaryMuscles: f.secondaryMuscles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    equipment: f.equipment,
    difficulty: f.difficulty,
    instructions: f.instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    commonMistakes: f.commonMistakes
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    safetyTips: f.safetyTips
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    defaultSets: Number(f.defaultSets) || 3,
    defaultReps: Number(f.defaultReps) || 10,
    caloriesPerMinute: Number(f.caloriesPerMinute) || 5,
    imageUrls: f.imageUrls
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    videoUrl: f.videoUrl.trim() || undefined,
  };
}

export function Exercises() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ExerciseForm>(emptyForm);
  const [formError, setFormError] = useState('');

  const listQ = useQuery({
    queryKey: ['admin', 'exercises', page, search, muscle],
    queryFn: () =>
      apiRequestWithMeta<Exercise[]>('/admin/exercises', {
        query: { page, limit: 15, search: search || undefined, muscle: muscle || undefined, sort: 'name' },
      }),
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: (payload: ReturnType<typeof toPayload>) => apiRequest('/admin/exercises', { method: 'POST', body: payload }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'exercises'] });
      setCreating(false);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof toPayload> }) =>
      apiRequest(`/admin/exercises/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'exercises'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/exercises/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'exercises'] }),
  });

  const meta = listQ.data?.meta as PageMeta | undefined;
  const items = listQ.data?.data ?? [];

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setCreating(false);
    setFormError('');
    setForm({
      name: ex.name,
      description: ex.description,
      targetMuscle: ex.targetMuscle,
      secondaryMuscles: (ex.secondaryMuscles ?? []).join(', '),
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      instructions: (ex.instructions ?? []).join('\n'),
      commonMistakes: (ex.commonMistakes ?? []).join('\n'),
      safetyTips: (ex.safetyTips ?? []).join('\n'),
      defaultSets: ex.defaultSets,
      defaultReps: ex.defaultReps,
      caloriesPerMinute: ex.caloriesPerMinute,
      imageUrls: (ex.imageUrls ?? []).join(', '),
      videoUrl: ex.videoUrl ?? '',
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    try {
      const payload = toPayload(form);
      if (editing) await updateMut.mutateAsync({ id: editing._id, payload });
      else await createMut.mutateAsync(payload);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const confirmDelete = (ex: Exercise) => {
    if (!window.confirm(`Delete “${ex.name}”? This cannot be undone.`)) return;
    deleteMut.mutate(ex._id);
  };

  const set = <K extends keyof ExerciseForm>(key: K, value: ExerciseForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <h1 className="page-title">Exercises</h1>
      <p className="page-sub">Manage the exercise library used by all workout programs.</p>

      <div className="toolbar">
        <input className="input" placeholder="Search exercises…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" style={{ maxWidth: 160 }} value={muscle} onChange={(e) => setMuscle(e.target.value)} aria-label="Filter by muscle">
          <option value="">All muscles</option>
          {MUSCLES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="spacer" />
        <button type="button" className="btn" onClick={openCreate}>
          + New exercise
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Muscle</th>
                <th>Equipment</th>
                <th>Level</th>
                <th>Default</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listQ.isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">Loading…</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <h3>No exercises</h3>
                      <p>Create the first exercise for your library.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((ex) => (
                  <tr key={ex._id}>
                    <td style={{ fontWeight: 700 }}>{ex.name}</td>
                    <td>
                      <span className="badge accent">{ex.targetMuscle}</span>
                    </td>
                    <td style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{ex.equipment}</td>
                    <td style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{ex.difficulty}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {ex.defaultSets}×{ex.defaultReps}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button type="button" className="btn secondary sm" style={{ marginRight: 8 }} onClick={() => openEdit(ex)}>
                        Edit
                      </button>
                      <button type="button" className="btn danger sm" onClick={() => confirmDelete(ex)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta ? (
        <div className="pager">
          <span>
            Page {meta.page} of {meta.totalPages || 1} · {meta.total} exercises
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn secondary sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <button type="button" className="btn secondary sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      ) : null}

      {/* Create / edit modal */}
      {(creating || editing) && (
        <div className="modal-backdrop" onClick={() => (creating ? setCreating(false) : setEditing(null))}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h2>{editing ? `Edit ${editing.name}` : 'New exercise'}</h2>
            {formError ? <div className="error-text">{formError}</div> : null}
            <div className="field">
              <label>Name</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Target muscle</label>
                <select className="select" value={form.targetMuscle} onChange={(e) => set('targetMuscle', e.target.value)}>
                  {MUSCLES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Equipment</label>
                <select className="select" value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>
                  {EQUIPMENT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Difficulty</label>
                <select className="select" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
                  {LEVELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Secondary muscles (comma-separated)</label>
                <input className="input" value={form.secondaryMuscles} onChange={(e) => set('secondaryMuscles', e.target.value)} placeholder="triceps, shoulders" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Default sets</label>
                <input className="input" type="number" min={1} value={form.defaultSets} onChange={(e) => set('defaultSets', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Default reps</label>
                <input className="input" type="number" min={1} value={form.defaultReps} onChange={(e) => set('defaultReps', Number(e.target.value))} />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Calories / minute (est.)</label>
                <input className="input" type="number" min={1} step="0.1" value={form.caloriesPerMinute} onChange={(e) => set('caloriesPerMinute', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Video URL (optional)</label>
                <input className="input" value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="field">
              <label>Image URLs (comma-separated)</label>
              <input className="input" value={form.imageUrls} onChange={(e) => set('imageUrls', e.target.value)} placeholder="https://…, https://…" />
            </div>
            <div className="field">
              <label>Instructions (one step per line)</label>
              <textarea className="textarea" value={form.instructions} onChange={(e) => set('instructions', e.target.value)} />
            </div>
            <div className="field">
              <label>Common mistakes (one per line)</label>
              <textarea className="textarea" value={form.commonMistakes} onChange={(e) => set('commonMistakes', e.target.value)} />
            </div>
            <div className="field">
              <label>Safety tips (one per line)</label>
              <textarea className="textarea" value={form.safetyTips} onChange={(e) => set('safetyTips', e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => (editing ? setEditing(null) : setCreating(false))}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create exercise'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
