-- Remove as perguntas antigas da prova final do curso ICMS3.0
-- (b8e6a6f7-5019-425f-8f27-d5477b78588a), antes de importar o novo banco
-- de 30 perguntas via /admin/final-exam/bulk-import.
--
-- Execute no Supabase SQL Editor do projeto.

begin;

-- Confira antes de apagar: deve listar as perguntas atuais desse curso.
select id, question_number, question_text->>'en' as question_en
from final_exam_questions
where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a'
order by question_number;

-- Descomente a linha abaixo e rode novamente para apagar de fato.
-- delete from final_exam_questions
-- where course_id = 'b8e6a6f7-5019-425f-8f27-d5477b78588a';

commit;
