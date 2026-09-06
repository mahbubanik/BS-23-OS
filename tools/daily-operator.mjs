/* Daily Sales Operating Assistant.
   Three modes:
   - plan: Morning schedule and priority builder
   - capture: Natural language activity note -> structured activity record
   - eod: End-of-day report and carry-forward generator
   Zero-LLM default. */

export function buildMorningPlan({ meetings = [], tasks = [], overdueFollowUps = [], opportunities = [] } = {}) {
  const priorities = [];

  // Urgent: overdue follow-ups
  for (const f of overdueFollowUps) {
    priorities.push({
      tier: 'P0 - OVERDUE',
      item: `Follow up ${f.company || f.account}: ${f.action || 'Check in on pending decision'}`,
      reason: f.reason || 'Follow-up date passed'
    });
  }

  // High: today's meetings and prep
  for (const m of meetings) {
    priorities.push({
      tier: 'P1 - MEETING',
      item: `Prepare and attend meeting: ${m.subject || m.name} at ${m.time || m.starts_at || 'scheduled time'}`,
      reason: 'Live prospect interaction'
    });
  }

  // Medium: tasks due today
  for (const t of tasks) {
    priorities.push({
      tier: 'P2 - TASK',
      item: t.name || t.title,
      reason: `Due today (Priority: ${t.priority || 'Normal'})`
    });
  }

  // Prospecting/deals if room
  if (priorities.length < 5) {
    priorities.push({
      tier: 'P3 - PIPELINE',
      item: 'Research 3-5 ICP accounts or progress active stage discovery',
      reason: 'Consistent pipeline generation cadence'
    });
  }

  return {
    agent_id: 'daily_operator',
    entity_type: 'daily_plan',
    date: new Date().toISOString().split('T')[0],
    priorities,
    totalCount: priorities.length
  };
}

export function parseActivityNote(noteText) {
  if (!noteText || typeof noteText !== 'string') {
    throw new Error('Activity note text is required.');
  }

  const durationMatch = noteText.match(/(\d+)\s*(?:min|minute|mins|m|hour|hr|hours)\b/i);
  let duration = null;
  if (durationMatch) {
    const val = parseInt(durationMatch[1], 10);
    if (/hour|hr/i.test(durationMatch[0])) {
      duration = val * 60;
    } else {
      duration = val;
    }
  }

  // Detect activity type
  let type = 'Meeting';
  const lower = noteText.toLowerCase();
  if (lower.startsWith('call') || lower.includes('called') || lower.includes('phone')) {
    type = 'Call';
  } else if (lower.startsWith('email') || lower.includes('emailed') || lower.includes('sent email')) {
    type = 'Email';
  } else if (lower.includes('linkedin') || lower.includes('inmail')) {
    type = 'LinkedIn';
  } else if (lower.includes('demo')) {
    type = 'Demo';
  }

  return {
    agent_id: 'daily_operator',
    entity_type: 'activity_record',
    type,
    rawNote: noteText,
    durationMinutes: duration,
    timestamp: new Date().toISOString(),
    readyForSync: true
  };
}

export function buildEndOfDaySummary({ completedActivities = [], pendingTasks = [], wins = [] } = {}) {
  return {
    agent_id: 'daily_operator',
    entity_type: 'eod_summary',
    date: new Date().toISOString().split('T')[0],
    stats: {
      activitiesCount: completedActivities.length,
      pendingCount: pendingTasks.length,
      winsCount: wins.length
    },
    keyDevelopments: wins.length ? wins : ['Maintained active deal momentum and customer engagement.'],
    unfinishedTasks: pendingTasks.map(t => t.name || t),
    tomorrowPriorities: pendingTasks.slice(0, 3).map((t, idx) => `${idx + 1}. Complete: ${t.name || t}`)
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const mode = process.argv[2] || 'plan';
  if (mode === 'capture') {
    const text = process.argv.slice(3).join(' ');
    console.log(JSON.stringify(parseActivityNote(text), null, 2));
  } else if (mode === 'eod') {
    console.log(JSON.stringify(buildEndOfDaySummary(), null, 2));
  } else {
    console.log(JSON.stringify(buildMorningPlan(), null, 2));
  }
}
