# Agent architecture

Every capability reads and writes the shared entities, not separate chat histories.

`ICP → Account Research → Qualification → Outreach → Meeting Prep → Meeting Analysis → Solution Mapping → Deal Strategy → Follow-up → Activity → Improvement`

Each agent returns a small record: `{entity_type, entity_id, facts[], inferences[], unknowns[], evidence_ids[], recommended_actions[]}`. An agent may not upgrade an inference to a fact without a URL-backed evidence record. Phase 1 implements ICP, research, qualification, and next action; all other agents are backlog consumers of the same account/opportunity records.

