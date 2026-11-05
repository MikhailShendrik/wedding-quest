create unique index if not exists quest_completion_once on quest_completions (quest_id, guest_id);
create unique index if not exists xp_quest_once on xp_ledger (guest_id, ref_id) where reason = 'quest';
