-- Local-only tests for admissions, institution and finance schema foundations.
\set ON_ERROR_STOP on

insert into clinova_private.academic_programmes(
 programme_code,internal_title,academic_domain,created_by
) values ('LOCAL-PROG','Synthetic Local Programme','Allied Health','00000000-0000-0000-0000-0000000000a2');

insert into clinova_private.programme_versions(
 programme_id,version_number,version_status,created_by
)
select id,1,'draft','00000000-0000-0000-0000-0000000000a2'
from clinova_private.academic_programmes where programme_code='LOCAL-PROG';

insert into clinova_private.programme_intakes(
 intake_code,programme_version_id,intake_status
)
select 'LOCAL-INTAKE',id,'draft'
from clinova_private.programme_versions
where programme_id=(select id from clinova_private.academic_programmes where programme_code='LOCAL-PROG');

insert into clinova_private.applications(
 application_reference,applicant_user_id,intake_id,applicant_full_name,applicant_email,status
)
select 'LOCAL-APP-0001','00000000-0000-0000-0000-0000000000a1',id,
 'Synthetic Applicant','applicant@example.invalid','submitted'
from clinova_private.programme_intakes where intake_code='LOCAL-INTAKE';

insert into clinova_private.application_status_events(
 application_id,actor_user_id,from_status,to_status,reason
)
select id,'00000000-0000-0000-0000-0000000000a2','draft','submitted','Synthetic local submission'
from clinova_private.applications where application_reference='LOCAL-APP-0001';

insert into clinova_private.application_reviews(
 application_id,reviewer_id,review_type,decision,rationale
)
select id,'00000000-0000-0000-0000-0000000000a2','administrative','suitable',
 'Synthetic local review with sufficient rationale.'
from clinova_private.applications where application_reference='LOCAL-APP-0001';

insert into clinova_private.admission_decisions(
 application_id,decision_number,decision,decision_maker_id,rationale
)
select id,1,'conditional_offer','00000000-0000-0000-0000-0000000000a2',
 'Synthetic conditional decision for local schema validation.'
from clinova_private.applications where application_reference='LOCAL-APP-0001';

insert into clinova_private.institutions(
 institution_code,legal_name,display_name,country_code,status
) values ('LOCAL-INST','Synthetic Institution Ltd','Synthetic Institution','GB','due_diligence');

insert into clinova_private.partner_agreements(
 institution_id,agreement_code,version_number,agreement_status,scope_description
)
select id,'LOCAL-AGREEMENT',1,'draft','Synthetic local agreement scope'
from clinova_private.institutions where institution_code='LOCAL-INST';

insert into clinova_private.partner_cohorts(
 institution_id,agreement_id,intake_id,cohort_code
)
select i.id,a.id,pi.id,'LOCAL-COHORT'
from clinova_private.institutions i
join clinova_private.partner_agreements a on a.institution_id=i.id
cross join clinova_private.programme_intakes pi
where i.institution_code='LOCAL-INST' and a.agreement_code='LOCAL-AGREEMENT'
  and pi.intake_code='LOCAL-INTAKE';

insert into clinova_private.fee_schedules(
 schedule_code,currency,schedule_status
) values ('LOCAL-FEES','GBP','draft');

insert into clinova_private.fee_schedule_items(
 fee_schedule_id,item_code,description,unit_amount,tax_rate
)
select id,'LOCAL-COURSE','Synthetic course fee',50.00,0.10
from clinova_private.fee_schedules where schedule_code='LOCAL-FEES';

insert into clinova_private.invoices(
 invoice_number,payer_user_id,currency,subtotal,tax_total,total_amount,invoice_status,issued_at
) values (
 'LOCAL-INV-0001','00000000-0000-0000-0000-0000000000a1',
 'GBP',100.00,10.00,110.00,'issued',now()
);

insert into clinova_private.invoice_lines(
 invoice_id,fee_schedule_item_id,description,quantity,unit_amount,tax_rate,line_subtotal,line_tax
)
select i.id,f.id,'Synthetic course fee',2,50.00,0.10,100.00,10.00
from clinova_private.invoices i cross join clinova_private.fee_schedule_items f
where i.invoice_number='LOCAL-INV-0001' and f.item_code='LOCAL-COURSE';

insert into clinova_private.payment_transactions(
 provider,provider_transaction_reference,payer_user_id,amount,currency,transaction_status,verified_at
) values (
 'local-test','LOCAL-PAY-0001','00000000-0000-0000-0000-0000000000a1',
 110.00,'GBP','captured',now()
);

insert into clinova_private.payment_allocations(transaction_id,invoice_id,allocated_amount)
select p.id,i.id,110.00
from clinova_private.payment_transactions p cross join clinova_private.invoices i
where p.provider_transaction_reference='LOCAL-PAY-0001'
  and i.invoice_number='LOCAL-INV-0001';

insert into clinova_private.payment_webhook_events(
 provider,provider_event_id,event_type,signature_verified,idempotency_key
) values ('local-test','LOCAL-EVENT-1','payment.captured',true,'LOCAL-IDEMPOTENCY-1');

insert into clinova_private.payment_webhook_processing_events(
 webhook_event_id,processing_status,result_reference,reason
)
select id,'processed','LOCAL-PAY-0001','Synthetic verified local webhook processing'
from clinova_private.payment_webhook_events
where provider_event_id='LOCAL-EVENT-1';

insert into clinova_private.finance_events(invoice_id,event_type,reason)
select id,'payment_allocated','Synthetic local finance event'
from clinova_private.invoices where invoice_number='LOCAL-INV-0001';

-- Cross-institution agreement linkage must be rejected.
do $body$
declare other_institution uuid;
declare other_agreement uuid;
declare intake uuid;
begin
 insert into clinova_private.institutions(institution_code,legal_name,display_name,country_code)
 values ('LOCAL-INST-2','Synthetic Other Ltd','Synthetic Other','GB')
 returning id into other_institution;
 select id into other_agreement from clinova_private.partner_agreements
 where agreement_code='LOCAL-AGREEMENT';
 select id into intake from clinova_private.programme_intakes where intake_code='LOCAL-INTAKE';
 begin
   insert into clinova_private.partner_cohorts(institution_id,agreement_id,intake_id,cohort_code)
   values(other_institution,other_agreement,intake,'LOCAL-CROSS-TENANT-COHORT');
   raise exception 'cross-institution agreement was accepted';
 exception when foreign_key_violation then null;
 end;
end $body$;

-- Amount arithmetic must be internally consistent.
do $body$
declare invoice_id uuid;
declare fee_id uuid;
begin
 select id into invoice_id from clinova_private.invoices where invoice_number='LOCAL-INV-0001';
 select id into fee_id from clinova_private.fee_schedule_items where item_code='LOCAL-COURSE';
 begin
   insert into clinova_private.invoice_lines(
     invoice_id,fee_schedule_item_id,description,quantity,unit_amount,tax_rate,line_subtotal,line_tax
   ) values(invoice_id,fee_id,'Invalid arithmetic',2,50.00,0.10,99.00,9.90);
   raise exception 'invalid invoice line arithmetic was accepted';
 exception when check_violation then null;
 end;
end $body$;

-- Decision and finance evidence is immutable.
do $body$
begin
 begin
   update clinova_private.admission_decisions set rationale='tampered'
   where decision='conditional_offer';
   raise exception 'admission decision update unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 begin
   delete from clinova_private.finance_events where event_type='payment_allocated';
   raise exception 'finance event delete unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
 begin
   update clinova_private.payment_webhook_processing_events
   set reason='tampered';
   raise exception 'webhook processing event update unexpectedly succeeded';
 exception when sqlstate '55000' then null;
 end;
end $body$;

-- API roles have no direct access to the new domain relations.
do $body$
begin
 if has_table_privilege('anon','clinova_private.applications','SELECT') then
   raise exception 'anon unexpectedly has applications SELECT';
 end if;
 if has_table_privilege('authenticated','clinova_private.invoices','SELECT') then
   raise exception 'authenticated unexpectedly has invoices SELECT';
 end if;
 if has_table_privilege('authenticated','clinova_private.payment_transactions','INSERT') then
   raise exception 'authenticated unexpectedly has payment transaction INSERT';
 end if;
end $body$;

\echo 'PASS: admissions, partner tenancy, finance arithmetic, immutable evidence and private ACL boundaries'
