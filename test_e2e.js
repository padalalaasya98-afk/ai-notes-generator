const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log('=====================================================');
  console.log(' STARTING END-TO-END TEST SUITE FOR AI NOTES GENERATOR');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // 1. Health check
  const health = await fetchJson('/health');
  assert(health.status === 200 && health.data.status === 'ok', '1. Server Health Check (/api/health)');

  // 2. Register User 1
  const testUser1 = {
    name: 'Ada Lovelace',
    email: `ada.${Date.now()}@oxford.edu`,
    password: 'SecurePassword123!'
  };
  const reg1 = await fetchJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser1)
  });
  assert(reg1.status === 201 && reg1.data.token && reg1.data.user.email === testUser1.email, '2. User 1 Registration & JWT Issue');
  const token1 = reg1.data.token;

  // 3. Register duplicate email should fail (409)
  const regDup = await fetchJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser1)
  });
  assert(regDup.status === 409, '3. Duplicate Email Rejection (409 Conflict)');

  // 4. Login User 1
  const loginRes = await fetchJson('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser1.email, password: testUser1.password })
  });
  assert(loginRes.status === 200 && loginRes.data.token, '4. User 1 Login & Session Restoration');

  // 5. Verify /auth/me
  const meRes = await fetchJson('/auth/me', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(meRes.status === 200 && meRes.data.user.name === 'Ada Lovelace', '5. Protected /api/auth/me Profile Check');

  // 6. Register User 2 (for User Isolation testing)
  const testUser2 = {
    name: 'Charles Babbage',
    email: `charles.${Date.now()}@cambridge.edu`,
    password: 'SecurePassword456!'
  };
  const reg2 = await fetchJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser2)
  });
  const token2 = reg2.data.token;
  assert(reg2.status === 201 && token2, '6. User 2 Registration');

  // 7. Create Source Material for User 1
  const lectureSample = `Operating Systems: Process Synchronization and Race Conditions.
A race condition occurs when concurrent threads access shared state without synchronization.
The critical section problem requires three guarantees:
1. Mutual Exclusion: At most one process executes in the critical section at a time.
2. Progress: Remainder section processes do not delay others from entering.
3. Bounded Waiting: Starvation is prevented by setting a bound on waiting processes.
Semaphores provide atomic wait() (P) and signal() (V) operations.
Dijkstra's Banker's Algorithm provides deadlock avoidance by maintaining safe state sequences.`;

  const srcRes = await fetchJson('/sources/text', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'text',
      content: lectureSample,
      filename: 'OS_Synchronization.txt'
    })
  });
  assert(srcRes.status === 201 && srcRes.data.source.id, '7. Source Material Text Upload & Stored in PostgreSQL');
  const sourceId = srcRes.data.source.id;

  // 8. AI Note Generation with Gemini
  console.log('\n[INFO] Calling Gemini AI to generate complete study material (Summary, Topics, Definitions, Flashcards, Quiz)...');
  const genRes = await fetchJson('/notes/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sourceType: 'text',
      content: lectureSample,
      subject: 'Computer Science',
      topic: 'Process Synchronization & Semaphores',
      category: 'Computer Science',
      educationLevel: 'Undergraduate',
      noteLength: 'medium',
      outputStyle: 'exam-focused',
      sourceMaterialId: sourceId
    })
  });

  assert(genRes.status === 201 && genRes.data.note, '8. Gemini AI Note Generation Succeeded');
  const note = genRes.data.note;
  const noteId = note?.id;

  // 9. Validate AI Output Structure & Schema
  assert(typeof note.title === 'string' && note.title.length > 0, '9a. Note has Title: ' + note.title);
  assert(typeof note.summary === 'string' && note.summary.length > 20, '9b. Note has Executive Summary');
  assert(Array.isArray(note.detailed_notes) && note.detailed_notes.length > 0, `9c. Note has ${note.detailed_notes?.length} Structured Topics`);
  assert(Array.isArray(note.key_points) && note.key_points.length > 0, `9d. Note has ${note.key_points?.length} Key Points`);
  assert(Array.isArray(note.definitions) && note.definitions.length > 0, `9e. Note has ${note.definitions?.length} Key Definitions`);
  assert(Array.isArray(note.important_questions) && note.important_questions.length > 0, `9f. Note has ${note.important_questions?.length} Exam Questions`);
  assert(Array.isArray(note.flashcards) && note.flashcards.length > 0, `9g. Note has ${note.flashcards?.length} Interactive Flashcards`);
  assert(Array.isArray(note.quiz_questions) && note.quiz_questions.length > 0, `9h. Note has ${note.quiz_questions?.length} Practice Quiz Questions`);

  // Verify quiz question schema: 4 options each, correct_answer in options
  if (note.quiz_questions && note.quiz_questions.length > 0) {
    const q1 = note.quiz_questions[0];
    assert(
      q1.options?.length === 4 && q1.options.includes(q1.correct_answer),
      `9i. Quiz Question 1 has 4 options and valid correct answer: "${q1.correct_answer}"`
    );
  }

  // 10. Fetch Note by ID (User 1)
  const getNoteRes = await fetchJson(`/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(getNoteRes.status === 200 && getNoteRes.data.note.id === noteId, '10. Fetch Single Note by ID');

  // 11. USER ISOLATION CHECK: User 2 must NOT be able to view User 1's note!
  const crossUserGet = await fetchJson(`/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert(crossUserGet.status === 404, '11. Row-Level Security: User 2 CANNOT access User 1 note (404 Denied)');

  // 12. USER ISOLATION CHECK: User 2 must NOT be able to delete User 1's note!
  const crossUserDel = await fetchJson(`/notes/${noteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert(crossUserDel.status === 404, '12. Row-Level Security: User 2 CANNOT delete User 1 note (404 Denied)');

  // 13. Update Note (User 1)
  const updateRes = await fetchJson(`/notes/${noteId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Operating Systems: Process Synchronization (Mastered)'
    })
  });
  assert(
    updateRes.status === 200 && updateRes.data.note.title.includes('(Mastered)'),
    '13. Update Note Title & Content'
  );

  // 14. Search & Filter Notes
  const searchRes = await fetchJson('/notes?search=Synchronization&category=Computer%20Science', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(searchRes.status === 200 && searchRes.data.notes.length >= 1, '14. Search & Category Filtering');

  // 15. Dashboard Stats
  const statsRes = await fetchJson('/notes/stats', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(
    statsRes.status === 200 &&
    statsRes.data.stats.totalNotes >= 1 &&
    statsRes.data.stats.totalFlashcards >= 1,
    '15. Dashboard Aggregation Metrics'
  );

  // 16. Delete Note (User 1)
  const delRes = await fetchJson(`/notes/${noteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(delRes.status === 200, '16. Delete Note Owned by User');

  // 17. Confirm note is gone
  const confirmGone = await fetchJson(`/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert(confirmGone.status === 404, '17. Confirm Note Deleted');

  console.log('\n=====================================================');
  console.log(` TEST RUN COMPLETED: ${passed} / ${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('=====================================================\n');

  if (passed === total) {
    console.log('All backend and AI criteria verified successfully!');
  } else {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
