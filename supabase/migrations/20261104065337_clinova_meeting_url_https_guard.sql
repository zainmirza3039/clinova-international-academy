alter table public.course_live_sessions
  drop constraint if exists course_live_sessions_meeting_url_https_check,
  add constraint course_live_sessions_meeting_url_https_check
    check (meeting_url is null or meeting_url ~ '^https://');
