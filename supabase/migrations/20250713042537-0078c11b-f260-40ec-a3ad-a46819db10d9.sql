-- إضافة unique constraint للتحكم في عملية upsert
ALTER TABLE weekly_plans 
ADD CONSTRAINT weekly_plans_unique_subject_grade_week 
UNIQUE (subject, grade, week_number);