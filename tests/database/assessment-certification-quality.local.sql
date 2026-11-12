-- Local-only tests for assessment, professional certification and quality foundations.
\set ON_ERROR_STOP on

insert into auth.users(id) values ('00000000-0000-0000-0000-0000000000d4');
insert into public.content_items(id,kind)
values ('50000000-0000-0000-0000-000000000001','cpd_course');
insert into public.course_enrollments(id,student_id)
values ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1');

insert into clinova_private.assessment_definitions(
 content_item_id,version_number,assessment_type,title,total_marks,pass_mark,definition_status,approved_by,approved_at
) values (
 '50000000-0000-0000-0000-000000000001',1,'summative','Synthetic assessment',10,7,'approved',
 '00000000-0000-0000-0000-0000000000c3',now()
);

insert into clinova_private.assessment_items(
 assessment_definition_id,item_code,item_type,stem,max_marks,answer_key,sequence_number
)
select id,'Q1','single_choice','Synthetic question stem',10,'{"correct_option":"A"}'::jsonb,1
from clinova_private.assessment_definitions
where title='Synthetic assessment';

insert into clinova_private.assessment_options(assessment_item_id,option_code,option_text,is_correct,sequence_number)
select id,'A','Correct synthetic option',true,1
from clinova_private.assessment_items where item_code='Q1';

insert into clinova_private.assessment_attempts(
 assessment_definition_id,enrollment_id,learner_id,attempt_number,attempt_status,submitted_at
)
select d.id,'60000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-0000000000a1',1,'submitted',now()
from clinova_private.assessment_definitions d where d.title='Synthetic assessment';

insert into clinova_private.assessment_responses(attempt_id,assessment_item_id,response_payload)
select a.id,i.id,'{"selected_option":"A"}'::jsonb
from clinova_private.assessment_attempts a
cross join clinova_private.assessment_items i
where a.attempt_number=1 and i.item_code='Q1';

insert into clinova_private.assessment_marks(
 attempt_id,assessment_item_id,marker_id,awarded_marks,feedback
)
select a.id,i.id,'00000000-0000-0000-0000-0000000000a2',10,'Synthetic full marks'
from clinova_private.assessment_attempts a
cross join clinova_private.assessment_items i
where a.attempt_number=1 and i.item_code='Q1';

insert into clinova_private.assessment_results(
 attempt_id,total_awarded,total_available,passed,result_status
)
select id,10,10,true,'pending_moderation'
from clinova_private.assessment_attempts where attempt_number=1;

insert into clinova_private.assessment_moderation(
 assessment_result_id,moderator_id,moderation_outcome,rationale
)
select id,'00000000-0000-0000-0000-0000000000c3','approved',
 'Synthetic independent moderation review.'
from clinova_private.assessment_results;

insert into clinova_private.completion_decisions(
 enrollment_id,decision_number,decision,decided_by,rationale
) values (
 '60000000-0000-0000-0000-000000000001',1,'complete',
 '00000000-0000-0000-0000-0000000000c3',
 'Synthetic CPD completion decision.'
);

insert into clinova_private.assessment_events(attempt_id,event_type,reason)
select id,'submitted','Synthetic local assessment submission'
from clinova_private.assessment_attempts where attempt_number=1;

-- Professional competency certification is a separate credential domain.
insert into clinova_private.certification_schemes(scheme_code,title,professional_domain)
values ('LOCAL-COMP','Synthetic Competency Scheme','Allied Health');

insert into clinova_private.certification_scheme_versions(
 scheme_id,version_number,version_status,assessment_method
)
select id,1,'draft','Portfolio and observed competency'
from clinova_private.certification_schemes where scheme_code='LOCAL-COMP';

insert into clinova_private.certification_scheme_units(
 scheme_version_id,unit_code,title,sequence_number
)
select id,'UNIT-1','Synthetic Clinical Competency',1
from clinova_private.certification_scheme_versions;

insert into clinova_private.certification_criteria(
 scheme_unit_id,criterion_code,criterion_text
)
select id,'CRIT-1','Demonstrates safe clinical reasoning'
from clinova_private.certification_scheme_units;

insert into clinova_private.certification_applications(
 application_reference,scheme_version_id,candidate_user_id,application_status,submitted_at
)
select 'LOCAL-CERT-APP-1',v.id,'00000000-0000-0000-0000-0000000000a1','submitted',now()
from clinova_private.certification_scheme_versions v;

insert into clinova_private.certification_evidence(
 certification_application_id,criterion_id,evidence_type,storage_object_key,
 evidence_description,uploaded_by
)
select a.id,c.id,'portfolio','local-test/candidate-a/evidence-1',
 'Synthetic evidence object reference','00000000-0000-0000-0000-0000000000a1'
from clinova_private.certification_applications a
cross join clinova_private.certification_criteria c
where a.application_reference='LOCAL-CERT-APP-1';

insert into clinova_private.eligibility_reviews(
 certification_application_id,reviewer_id,outcome,rationale
)
select id,'00000000-0000-0000-0000-0000000000a2','eligible',
 'Synthetic eligibility review.'
from clinova_private.certification_applications;

insert into clinova_private.certification_assessor_assignments(
 certification_application_id,assessor_id,assigned_by
)
select id,'00000000-0000-0000-0000-0000000000a2',
 '00000000-0000-0000-0000-0000000000c3'
from clinova_private.certification_applications;

insert into clinova_private.competency_assessments(
 assessor_assignment_id,scheme_unit_id,outcome,rationale
)
select a.id,u.id,'competent','Synthetic competency assessment outcome.'
from clinova_private.certification_assessor_assignments a
cross join clinova_private.certification_scheme_units u;

insert into clinova_private.competency_observations(
 competency_assessment_id,criterion_id,observation,outcome
)
select a.id,c.id,'Synthetic direct observation','met'
from clinova_private.competency_assessments a
cross join clinova_private.certification_criteria c;

insert into clinova_private.impartiality_reviews(
 certification_application_id,reviewer_id,conflict_declared,outcome
)
select id,'00000000-0000-0000-0000-0000000000c3',false,'clear'
from clinova_private.certification_applications;

insert into clinova_private.certification_decisions(
 certification_application_id,decision_number,decision_maker_id,outcome,rationale
)
select id,1,'00000000-0000-0000-0000-0000000000d4','certify',
 'Synthetic independent certification decision.'
from clinova_private.certification_applications;

insert into clinova_private.professional_credentials(
 certification_application_id,certification_decision_id,credential_number
)
select a.id,d.id,'LOCAL-PRO-CREDENTIAL-001'
from clinova_private.certification_applications a
join clinova_private.certification_decisions d on d.certification_application_id=a.id;

insert into clinova_private.certification_events(
 certification_application_id,event_type,reason
)
select id,'credential_issued','Synthetic professional competency credential issued'
from clinova_private.certification_applications;

insert into clinova_private.certification_appeals(
 certification_application_id,appealed_decision_id,appellant_user_id,grounds
)
select a.id,d.id,a.candidate_user_id,'Synthetic grounds for appeal test.'
from clinova_private.certification_applications a
join clinova_private.certification_decisions d on d.certification_application_id=a.id;

-- Quality management and audit evidence.
insert into clinova_private.controlled_documents(document_code,title,document_type)
values ('LOCAL-SOP-001','Synthetic Quality SOP','procedure');

insert into clinova_private.controlled_document_versions(
 document_id,version_number,storage_object_key,content_sha256
)
select id,1,'local-test/quality/sop-v1','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
from clinova_private.controlled_documents where document_code='LOCAL-SOP-001';

insert into clinova_private.internal_audits(audit_reference,audit_scope,lead_auditor_id)
values ('LOCAL-AUDIT-001','Synthetic process audit','00000000-0000-0000-0000-0000000000c3');

insert into clinova_private.audit_findings(
 audit_id,finding_reference,severity,finding,evidence_refs
)
select id,'LOCAL-FINDING-001','minor','Synthetic audit finding','[]'::jsonb
from clinova_private.internal_audits where audit_reference='LOCAL-AUDIT-001';

insert into clinova_private.corrective_actions(
 finding_id,action_owner_id,root_cause,action_plan
)
select id,'00000000-0000-0000-0000-0000000000a2',
 'Synthetic root cause','Synthetic corrective action plan'
from clinova_private.audit_findings where finding_reference='LOCAL-FINDING-001';

insert into clinova_private.quality_events(entity_type,entity_id,event_type,rationale)
select 'audit_finding',id,'finding_opened','Synthetic audit finding event'
from clinova_private.audit_findings where finding_reference='LOCAL-FINDING-001';

insert into clinova_private.complaints_and_appeals(
 case_reference,case_type,submitted_by,subject,description
) values (
 'LOCAL-COMPLAINT-001','complaint','00000000-0000-0000-0000-0000000000a1',
 'Synthetic complaint','Synthetic complaint description for local testing.'
);

insert into clinova_private.complaint_case_events(case_id,event_type,rationale)
select id,'received','Synthetic case receipt event'
from clinova_private.complaints_and_appeals where case_reference='LOCAL-COMPLAINT-001';

insert into clinova_private.quality_risks(
 risk_reference,risk_title,risk_description,likelihood,impact
) values ('LOCAL-RISK-001','Synthetic operational risk','Synthetic risk description',2,3);

insert into clinova_private.staff_competencies(
 staff_user_id,competency_code,assessed_by,assessed_at,competency_status
) values (
 '00000000-0000-0000-0000-0000000000a2','LOCAL-STAFF-COMP',
 '00000000-0000-0000-0000-0000000000c3',now(),'competent'
);

insert into clinova_private.operational_report_snapshots(
 report_code,reporting_period_start,reporting_period_end,data_snapshot
) values ('LOCAL-OPS',date '2026-01-01',date '2026-01-31','{"applications":1,"credentials":1}'::jsonb);

-- Immutability and private-access checks.
do $body$
begin
 begin
   update clinova_private.assessment_responses set response_payload='{}'::jsonb;
   raise exception 'assessment response update unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 begin
   delete from clinova_private.certification_evidence;
   raise exception 'certification evidence delete unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 begin
   update clinova_private.quality_events set rationale='tampered';
   raise exception 'quality event update unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 if has_table_privilege('authenticated','clinova_private.assessment_items','SELECT') then
   raise exception 'authenticated unexpectedly has access to private answer key items';
 end if;
 if has_table_privilege('anon','clinova_private.professional_credentials','SELECT') then
   raise exception 'anon unexpectedly has direct professional credential access';
 end if;
end $body$;

\echo 'PASS: CPD assessment, separate competency certification, quality evidence and private ACL foundations'
