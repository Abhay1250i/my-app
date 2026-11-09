import assert from 'node:assert';

// Test 1: Daily Completion Formula and Color Tiers
function testDayPerformanceLogic() {
  console.log('Testing Day Performance Calculation...');

  function calculatePerf(completed, partial, skipped, scheduled) {
    const applicable = Math.max(0, scheduled - skipped);
    if (applicable === 0) return { rate: 0, tier: 'grey' };

    const effective = completed + partial * 0.5;
    const rate = Math.min(100, Math.round((effective / applicable) * 100));

    let tier = 'red';
    if (rate === 100) tier = 'dark-green';
    else if (rate >= 80) tier = 'light-green';
    else if (rate >= 50) tier = 'yellow';

    return { rate, tier };
  }

  // 100% -> dark-green
  const perf100 = calculatePerf(10, 0, 0, 10);
  assert.strictEqual(perf100.rate, 100);
  assert.strictEqual(perf100.tier, 'dark-green');

  // 90% -> light-green
  const perf90 = calculatePerf(9, 0, 0, 10);
  assert.strictEqual(perf90.rate, 90);
  assert.strictEqual(perf90.tier, 'light-green');

  // 80% -> light-green
  const perf80 = calculatePerf(8, 0, 0, 10);
  assert.strictEqual(perf80.rate, 80);
  assert.strictEqual(perf80.tier, 'light-green');

  // 60% -> yellow
  const perf60 = calculatePerf(6, 0, 0, 10);
  assert.strictEqual(perf60.rate, 60);
  assert.strictEqual(perf60.tier, 'yellow');

  // 40% -> red
  const perf40 = calculatePerf(4, 0, 0, 10);
  assert.strictEqual(perf40.rate, 40);
  assert.strictEqual(perf40.tier, 'red');

  // Skipped exclusion: 8 completed, 2 skipped out of 10 -> Applicable = 8 -> 8/8 = 100%
  const perfSkipped = calculatePerf(8, 0, 2, 10);
  assert.strictEqual(perfSkipped.rate, 100);
  assert.strictEqual(perfSkipped.tier, 'dark-green');

  // Partial credit (0.5 each): 7 completed + 2 partial = 8 / 10 -> 80% light-green
  const perfPartial = calculatePerf(7, 2, 0, 10);
  assert.strictEqual(perfPartial.rate, 80);
  assert.strictEqual(perfPartial.tier, 'light-green');

  // No applicable: all skipped
  const perfAllSkipped = calculatePerf(0, 0, 5, 5);
  assert.strictEqual(perfAllSkipped.rate, 0);
  assert.strictEqual(perfAllSkipped.tier, 'grey');

  console.log('✓ Day performance logic passed all cases!');
}

// Test 2: Streak calculation with skipped day preservation
function testStreakLogic() {
  console.log('Testing Streak Calculation...');

  // Day logs: status for consecutive days
  const history = [
    { day: 1, rate: 100, completed: 10, skipped: false },
    { day: 2, rate: 85, completed: 8, skipped: false },
    { day: 3, rate: 0, completed: 0, skipped: true }, // Skipped day -> MUST NOT break streak!
    { day: 4, rate: 90, completed: 9, skipped: false },
    { day: 5, rate: 100, completed: 10, skipped: false },
  ];

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    if (item.skipped) {
      // Preserve streak, continue walking back
      continue;
    }
    if (item.rate >= 50 || item.completed > 0) {
      streak++;
    } else {
      break;
    }
  }

  assert.strictEqual(streak, 4, 'Streak should be 4 with skipped day preserved');
  console.log('✓ Streak calculation with skipped day preservation passed!');
}

// Test 3: Recurring Task Next Date Advancement
function testRecurringTaskCalculation() {
  console.log('Testing Recurring Tasks Date Calculation...');

  function getNextDueDate(currentDateStr, recurrence) {
    const d = new Date(currentDateStr);
    if (recurrence === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (recurrence === 'weekly') {
      d.setDate(d.getDate() + 7);
    }
    return d.toISOString().split('T')[0];
  }

  const nextDaily = getNextDueDate('2026-10-24', 'daily');
  assert.strictEqual(nextDaily, '2026-10-25');

  const nextWeekly = getNextDueDate('2026-10-24', 'weekly');
  assert.strictEqual(nextWeekly, '2026-10-31');

  console.log('✓ Recurring task date calculation passed!');
}

function runAll() {
  console.log('--- RUNNING ONEPERCENT UNIT TESTS ---');
  testDayPerformanceLogic();
  testStreakLogic();
  testRecurringTaskCalculation();
  console.log('--- ALL UNIT TESTS PASSED SUCCESSFULLY! ---');
}

runAll();
