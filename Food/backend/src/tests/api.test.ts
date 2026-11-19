import request from 'supertest';
import { createApp } from '../app';
import { Exercise } from '../models/Exercise';
import { WorkoutProgram } from '../models/WorkoutProgram';

const app = createApp();

async function registerUser() {
  const email = `athlete-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ fullName: 'Athlete', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' });
  return { token: res.body.data.accessToken as string, email };
}

async function seedExercise(overrides: Record<string, unknown> = {}) {
  return Exercise.create({
    name: `Bench Press ${Math.random().toString(36).slice(2, 7)}`,
    slug: `bench-${Math.random().toString(36).slice(2, 9)}`,
    description: 'A chest pressing movement performed with a barbell on a flat bench.',
    targetMuscle: 'chest',
    secondaryMuscles: ['triceps'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    instructions: ['Lie on bench', 'Press the bar'],
    defaultSets: 3,
    defaultReps: 8,
    isPublished: true,
    ...overrides,
  });
}

describe('Exercise catalog API', () => {
  it('lists exercises with pagination and filters', async () => {
    const { token } = await registerUser();
    await seedExercise({ name: 'Alpha Press', slug: 'alpha-press' });
    await seedExercise({ name: 'Beta Curl', slug: 'beta-curl', targetMuscle: 'biceps', equipment: 'dumbbells' });

    const all = await request(app).get('/api/exercises?limit=1').set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.meta.total).toBe(2);
    expect(all.body.data).toHaveLength(1);
    expect(all.body.meta.totalPages).toBe(2);

    const filtered = await request(app)
      .get('/api/exercises?muscle=biceps&equipment=dumbbells')
      .set('Authorization', `Bearer ${token}`);
    expect(filtered.body.meta.total).toBe(1);
    expect(filtered.body.data[0].name).toBe('Beta Curl');

    const searched = await request(app).get('/api/exercises?search=Alpha').set('Authorization', `Bearer ${token}`);
    expect(searched.body.meta.total).toBe(1);
  });

  it('returns exercise detail with related exercises', async () => {
    const ex = await seedExercise();
    await seedExercise({ name: 'Another Press', slug: 'another-press' });
    const res = await request(app).get(`/api/exercises/${ex._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(ex.name);
    expect(Array.isArray(res.body.data.related)).toBe(true);
  });

  it('404s for unknown exercise', async () => {
    const res = await request(app).get('/api/exercises/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('denies exercise creation to non-admin users', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Forbidden Move',
        description: 'Should not be creatable by regular users at all.',
        targetMuscle: 'chest',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        instructions: ['Do the thing'],
      });
    expect(res.status).toBe(403);
  });
});

describe('Workout program API', () => {
  it('creates and fetches a program with populated exercises', async () => {
    const ex = await seedExercise();
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Admin', email: `admin-${Date.now()}@test.com`, password: 'StrongPass1', confirmPassword: 'StrongPass1' });
    // promote via model to keep test focused on program API
    const { User } = await import('../models/User');
    await User.updateOne({ _id: adminRes.body.data.user.id }, { $set: { role: 'admin' } });
    const token = adminRes.body.data.accessToken as string;

    const create = await request(app)
      .post('/api/programs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Program',
        description: 'A program created during automated testing.',
        categories: ['full body'],
        difficulty: 'beginner',
        durationMinutes: 30,
        exercises: [{ exerciseId: String(ex._id), sets: 3, reps: 10, restSeconds: 45 }],
      });
    expect(create.status).toBe(201);
    const programId = create.body.data._id;

    const detail = await request(app).get(`/api/programs/${programId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.exercises[0].exerciseId.name).toBe(ex.name);
  });

  it('filters programs by difficulty and search', async () => {
    const { User } = await import('../models/User');
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Admin2', email: `admin2-${Date.now()}@test.com`, password: 'StrongPass1', confirmPassword: 'StrongPass1' });
    await User.updateOne({ _id: adminRes.body.data.user.id }, { $set: { role: 'admin' } });
    const token = adminRes.body.data.accessToken as string;
    const ex = await seedExercise();

    await request(app)
      .post('/api/programs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Advanced Split',
        description: 'Hard program for filter testing purposes only.',
        categories: ['strength training'],
        difficulty: 'advanced',
        durationMinutes: 60,
        exercises: [{ exerciseId: String(ex._id) }],
      })
      .expect(201);

    const res = await request(app).get('/api/programs?difficulty=advanced&search=Split');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].difficulty).toBe('advanced');
  });
});

describe('Active workout journey', () => {
  it('start → sets → complete → history → records', async () => {
    const { token } = await registerUser();
    const ex = await seedExercise({ name: 'Test Squat', slug: 'test-squat', targetMuscle: 'quadriceps', equipment: 'barbell' });

    const start = await request(app)
      .post('/api/workouts/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Leg Day', exercises: [{ exerciseId: String(ex._id), sets: 3, reps: 10, restSeconds: 60 }] });
    expect(start.status).toBe(201);
    const sid = start.body.data.session._id;
    expect(start.body.data.session.exercises).toHaveLength(1);
    expect(start.body.data.session.exercises[0].sets).toHaveLength(3);

    // resuming returns the same active session
    const resume = await request(app)
      .post('/api/workouts/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Again', exercises: [{ exerciseId: String(ex._id) }] });
    expect(resume.status).toBe(200);
    expect(resume.body.data.session._id).toBe(sid);

    // complete sets
    for (const n of [1, 2, 3]) {
      const res = await request(app)
        .patch(`/api/workouts/${sid}/sets/${ex._id}/${n}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ weightKg: 40 + n * 10, reps: 10, completed: true });
      expect(res.status).toBe(200);
      expect(res.body.data.set.completed).toBe(true);
    }

    // add an extra set
    const added = await request(app)
      .post(`/api/workouts/${sid}/sets`)
      .set('Authorization', `Bearer ${token}`)
      .send({ exerciseId: String(ex._id), weightKg: 80, reps: 5, completed: true });
    expect(added.status).toBe(201);
    expect(added.body.data.set.setNumber).toBe(4);

    // skip/notes on an exercise
    const noted = await request(app)
      .patch(`/api/workouts/${sid}/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'knees felt good' });
    expect(noted.body.data.exercises[0].notes).toBe('knees felt good');

    // cannot start a second workout while one is active
    const conflict = await request(app)
      .post('/api/workouts/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ exercises: [{ exerciseId: String(ex._id) }] });
    expect(conflict.status).toBe(200);
    expect(conflict.body.data.resumed).toBe(true);

    const done = await request(app)
      .post(`/api/workouts/${sid}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({ durationSeconds: 1800 });
    expect(done.status).toBe(200);
    expect(done.body.data.summary.totalSets).toBe(4);
    expect(done.body.data.summary.totalReps).toBe(35);
    // 50*10 + 60*10 + 70*10 + 80*5
    expect(done.body.data.summary.totalVolumeKg).toBe(2200);
    expect(done.body.data.personalRecords.length).toBeGreaterThan(0);

    const history = await request(app).get('/api/workouts/history').set('Authorization', `Bearer ${token}`);
    expect(history.body.meta.total).toBe(1);
    expect(history.body.data[0].title).toBe('Leg Day');

    const records = await request(app).get('/api/progress/records').set('Authorization', `Bearer ${token}`);
    expect(records.body.data.records.length).toBeGreaterThan(0);

    // another user cannot read this session
    const other = await registerUser();
    const forbidden = await request(app).get(`/api/workouts/${sid}`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404);
  });

  it('abandons an active workout', async () => {
    const { token } = await registerUser();
    const ex = await seedExercise();
    const start = await request(app)
      .post('/api/workouts/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ exercises: [{ exerciseId: String(ex._id) }] });
    const sid = start.body.data.session._id;
    const res = await request(app).post(`/api/workouts/${sid}/abandon`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('abandoned');
    const active = await request(app).get('/api/workouts/active').set('Authorization', `Bearer ${token}`);
    expect(active.body.data).toBeNull();
  });
});

describe('Progress, goals and profile', () => {
  it('runs onboarding and exposes overview with empty state for new users', async () => {
    const { token } = await registerUser();

    const onb = await request(app)
      .post('/api/profile/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 24,
        heightCm: 172,
        weightKg: 68,
        experienceLevel: 'beginner',
        goals: ['weight loss'],
        preferences: ['home workouts'],
        daysPerWeek: 3,
        sessionMinutes: 30,
        targetMuscleGroups: ['abs'],
      });
    expect(onb.status).toBe(200);
    expect(onb.body.data.onboardingCompleted).toBe(true);

    const ov = await request(app).get('/api/progress/overview').set('Authorization', `Bearer ${token}`);
    expect(ov.status).toBe(200);
    expect(ov.body.data.workouts.count).toBe(0);
    expect(ov.body.data.streak).toBe(0);
    expect(ov.body.data.body.bmi).toBeCloseTo(22.9, 0);
  });

  it('creates, updates and deletes goals', async () => {
    const { token } = await registerUser();
    const create = await request(app)
      .post('/api/profile/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '20 workouts', goalType: 'workoutsCount', targetValue: 20 });
    expect(create.status).toBe(201);
    const gid = create.body.data._id;

    const update = await request(app)
      .patch(`/api/profile/goals/${gid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentValue: 10 });
    expect(update.body.data.currentValue).toBe(10);

    const list = await request(app).get('/api/profile/goals').set('Authorization', `Bearer ${token}`);
    expect(list.body.data[0].progressPercent).toBe(50);

    const del = await request(app).delete(`/api/profile/goals/${gid}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
    const after = await request(app).get('/api/profile/goals').set('Authorization', `Bearer ${token}`);
    expect(after.body.data).toHaveLength(0);
  });

  it('records weight and returns history', async () => {
    const { token } = await registerUser();
    const post = await request(app)
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 72.4 });
    expect(post.status).toBe(201);
    expect(post.body.data.source).toBe('manual');

    const history = await request(app).get('/api/progress/weight?days=7').set('Authorization', `Bearer ${token}`);
    expect(history.body.data).toHaveLength(1);
  });

  it('scopes favorites to the current user', async () => {
    const { token } = await registerUser();
    const ex = await seedExercise();
    const fav = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemType: 'exercise', itemId: String(ex._id) });
    expect(fav.status).toBe(201);
    const list = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token}`);
    expect(list.body.data.exercises).toHaveLength(1);
  });
});
