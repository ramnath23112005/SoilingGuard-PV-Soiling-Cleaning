import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, apiRequestWithMeta } from '../api';
import type { Exercise, PageMeta, ProgramExerciseRef, WorkoutProgram } from '../types';

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes', 'cardio', 'full_body'];
const EQUIPMENT = ['barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight', 'bands', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['strength', 'hypertrophy', 'fat_loss', 'endurance', 'mobility', 'full_body'];

interface ProgramForm {
  name: string;
  description: string;
  difficulty: string;
  durationMinutes: number;
  weeklyFrequency: number;
  estimatedCalories: number;
  targetMuscleGroups: string;
  equipment: string;
  categories: string;
  coverImage: string;
  exercises: Array<{ exerciseId: string; sets: number; reps: number; restSeconds: number }>;
}

const emptyForm: ProgramForm = {
  name: '',
  description: '',
  difficulty: 'beginner',
  durationMinutes: 45,
  weeklyFrequency: 3,
  estimatedCalories: 320,
  targetMuscleGroups: '',
  equipment: '',
  categories: 'full_body',
  coverImage: '',
  exercises: [],
};

function toPayload(f: ProgramForm) {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    difficulty: f.difficulty,
    durationMinutes: Number(f.durationMinutes) || 45,
    weeklyFrequency: Number(f.weeklyFrequency) || 3,
    estimatedCalories: Number(f.estimatedCalories) || 300,
    targetMuscleGroups: f.targetMuscleGroups
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    equipment: f.equipment
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    categories: f.categories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    coverImage: f.coverImage.trim() || undefined,
    exercises: f.exercises.map((e, i) => ({
      exerciseId: e.exerciseId,
      order: i + 1,
      sets: Number(e.sets) || 3,
      reps: Number(e.reps) || 10,
      restSeconds: Number(e.restSeconds) || 60,
    })),
  };
}

export function Programs() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<WorkoutProgram | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [formError, setFormError] = useState('');

  const listQ = useQuery({
    queryKey: ['admin', 'programs', page, search],
    queryFn: () =>
      apiRequestWithMeta<WorkoutProgram[]>('/admin/programs', {
        query: { page, limit: 12, search: search || undefined, sort: 'name' },
      }),
    placeholderData: (prev) => prev,
  });

  const exercisesQ = useQuery({
    queryKey: ['admin', 'exercise-picker'],
    queryFn: () => apiRequestWithMeta<Exercise[]>('/admin/exercises', { query: { limit: 100, sort: 'name' } }),
  });

  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of exercisesQ.data?.data ?? []) map.set(ex._id, ex);
    return map;
  }, [exercisesQ.data]);

  const createMut = useMutation({
    mutationFn: (payload: ReturnType<typeof toPayload>) => apiRequest('/admin/programs', { method: 'POST', body: payload }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'programs'] });
      setCreating(false);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof toPayload> }) =>
      apiRequest(`/admin/programs/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'programs'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/programs/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'programs'] }),
  });

  const meta = listQ.data?.meta as PageMeta | undefined;
  const items = listQ.data?.data ?? [];

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (p: WorkoutProgram) => {
    setEditing(p);
    setCreating(false);
    setFormError('');
    setForm({
      name: p.name,
      description: p.description,
      difficulty: p.difficulty,
      durationMinutes: p.durationMinutes,
      weeklyFrequency: p.weeklyFrequency,
      estimatedCalories: p.estimatedCalories,
      targetMuscleGroups: (p.targetMuscleGroups ?? []).join(', '),
      equipment: (p.equipment ?? []).join(', '),
      categories: (p.categories ?? []).join(', '),
      coverImage: p.coverImage ?? '',
      exercises: (p.exercises ?? []).map((e) => ({
        exerciseId: typeof e.exerciseId === 'object' ? e.exerciseId._id : e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
      })),
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (form.exercises.length === 0) {
      setFormError('Add at least one exercise.');
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

  const confirmDelete = (p: WorkoutProgram) => {
    if (!window.confirm(`Delete “${p.name}”?`)) return;
    deleteMut.mutate(p._id);
  };

  const addExerciseRow = () => {
    const first = exercisesQ.data?.data?.[0];
    setForm((f) => ({
      ...f,
      exercises: [
        ...f.exercises,
        { exerciseId: first?._id ?? '', sets: 3, reps: 10, restSeconds: 60 },
      ],
    }));
  };

  const updateExerciseRow = (index: number, patch: Partial<ProgramForm['exercises'][number]>) => {
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  };

  const removeExerciseRow = (index: number) => {
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <h1 className="page-title">Programs</h1>
      <p className="page-sub">Build multi-week plans that users can start from the mobile app.</p>

      <div className="toolbar">
        <input className="input" placeholder="Search programs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="spacer" />
        <button type="button" className="btn" onClick={openCreate}>
          + New program
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {listQ.isLoading ? (
          <div className="card">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card empty">
            <h3>No programs yet</h3>
            <p>Create your first training plan.</p>
          </div>
        ) : (
          items.map((p) => (
            <div key={p._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
                <span className={`badge ${p.difficulty === 'beginner' ? 'success' : p.difficulty === 'advanced' ? 'error' : 'warning'}`}>
                  {p.difficulty}
                </span>
              </div>
              <p style={{ color: 'var(--muted)', marginTop: 8, minHeight: 40, fontSize: 13 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, color: 'var(--muted)', fontSize: 12 }}>
                <span>{p.durationMinutes} min</span>
                <span>{p.exercises?.length ?? 0} exercises</span>
                <span>{p.weeklyFrequency}×/wk</span>
                <span>~{p.estimatedCalories} kcal</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {(p.targetMuscleGroups ?? []).slice(0, 4).map((m) => (
                  <span key={m} className="badge accent">
                    {m}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="button" className="btn secondary sm" onClick={() => openEdit(p)}>
                  Edit
                </button>
                <button type="button" className="btn danger sm" onClick={() => confirmDelete(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {meta ? (
        <div className="pager">
          <span>
            Page {meta.page} of {meta.totalPages || 1} · {meta.total} programs
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

      {(creating || editing) && (
        <div className="modal-backdrop" onClick={() => (creating ? setCreating(false) : setEditing(null))}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h2>{editing ? `Edit ${editing.name}` : 'New program'}</h2>
            {formError ? <div className="error-text">{formError}</div> : null}
            <div className="field">
              <label>Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Difficulty</label>
                <select className="select" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                  {LEVELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Duration (minutes)</label>
                <input
                  className="input"
                  type="number"
                  min={10}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Weekly frequency</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={7}
                  value={form.weeklyFrequency}
                  onChange={(e) => setForm((f) => ({ ...f, weeklyFrequency: Number(e.target.value) }))}
                />
              </div>
              <div className="field">
                <label>Estimated calories</label>
                <input
                  className="input"
                  type="number"
                  min={50}
                  value={form.estimatedCalories}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCalories: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Target muscles (comma-separated)</label>
                <input
                  className="input"
                  value={form.targetMuscleGroups}
                  onChange={(e) => setForm((f) => ({ ...f, targetMuscleGroups: e.target.value }))}
                  placeholder="chest, triceps"
                />
              </div>
              <div className="field">
                <label>Equipment (comma-separated)</label>
                <input
                  className="input"
                  value={form.equipment}
                  onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
                  placeholder="barbell, cable"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Categories (comma-separated)</label>
                <input
                  className="input"
                  value={form.categories}
                  onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))}
                  placeholder="strength, hypertrophy"
                />
              </div>
              <div className="field">
                <label>Cover image URL</label>
                <input className="input" value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} />
              </div>
            </div>

            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Exercises
                <button type="button" className="btn secondary sm" onClick={addExerciseRow} disabled={exercisesQ.isLoading}>
                  + Add exercise
                </button>
              </label>
              {form.exercises.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No exercises added yet.</p>
              ) : (
                form.exercises.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 70px 70px 80px 36px',
                      gap: 8,
                      marginBottom: 8,
                      alignItems: 'center',
                    }}
                  >
                    <select
                      className="select"
                      value={row.exerciseId}
                      onChange={(e) => updateExerciseRow(i, { exerciseId: e.target.value })}
                    >
                      <option value="">Select exercise…</option>
                      {(exercisesQ.data?.data ?? []).map((ex) => (
                        <option key={ex._id} value={ex._id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      title="Sets"
                      value={row.sets}
                      onChange={(e) => updateExerciseRow(i, { sets: Number(e.target.value) })}
                    />
                    <input
                      className="input"
                      type="number"
                      min={1}
                      title="Reps"
                      value={row.reps}
                      onChange={(e) => updateExerciseRow(i, { reps: Number(e.target.value) })}
                    />
                    <input
                      className="input"
                      type="number"
                      min={10}
                      title="Rest seconds"
                      value={row.restSeconds}
                      onChange={(e) => updateExerciseRow(i, { restSeconds: Number(e.target.value) })}
                    />
                    <button type="button" className="btn danger sm" onClick={() => removeExerciseRow(i)} aria-label="Remove exercise">
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => (editing ? setEditing(null) : setCreating(false))}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create program'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
