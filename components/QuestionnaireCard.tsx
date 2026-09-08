"use client";

import { useRef, useState } from "react";
import {
  formatQuestionnaireAnswer,
  isMultiQuestion,
  optionsOf,
  questionId,
  type Questionnaire,
  type QuestionnaireQuestion,
} from "@/lib/api";

type Props = {
  questionnaire: Questionnaire;
  onAnswer: (text: string) => void;
};

const AUTRE_RE = /autre|other/iu;

export default function QuestionnaireCard({ questionnaire, onAnswer }: Props) {
  const questions = questionnaire.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [autoLock, setAutoLock] = useState(false);
  const submittedRef = useRef(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const id = current ? questionId(current) : "";
  const selected = id ? (answers[id] ?? []) : [];

  const answered = (q: QuestionnaireQuestion) =>
    (answers[questionId(q)]?.length ?? 0) > 0 ||
    (custom[questionId(q)]?.trim?.() ?? "") !== "";

  const allAnswered = questions.every(answered);
  const multi = current ? isMultiQuestion(current) : false;

  const hasCustomInput = (q: QuestionnaireQuestion) =>
    q.allow_custom_text === true ||
    optionsOf(q).length === 0 ||
    optionsOf(q).some((o) => AUTRE_RE.test(o.value) || AUTRE_RE.test(o.label));
  const showCustomInput = current ? hasCustomInput(current) : false;

  const compileAndSend = () => {
    if (submittedRef.current || !allAnswered) return;
    const entries = questions.flatMap((q) => {
      const opts = optionsOf(q);
      const chosen = answers[questionId(q)] ?? [];
      const labels = chosen.map((c) => {
        const opt = opts.find((o) => o.value === c);
        return opt ? opt.label : c;
      });
      const txt = (custom[questionId(q)] ?? "").trim();
      const value = txt ? (labels.length ? [...labels, txt].join(", ") : txt) : labels.join(", ");
      return value ? [{ question: q.question, value }] : [];
    });
    if (entries.length === 0) return;
    submittedRef.current = true;
    setSubmitted(true);
    onAnswer(formatQuestionnaireAnswer(entries));
  };

  const select = (q: QuestionnaireQuestion, value: string) => {
    if (submittedRef.current) return;
    const qid = questionId(q);
    if (multi) {
      setAnswers((prev) => {
        const cur = prev[qid] ?? [];
        const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
        return { ...prev, [qid]: next };
      });
      return;
    }
    setCustom((prev) => ({ ...prev, [qid]: "" }));
    setAnswers((prev) => ({ ...prev, [qid]: [value] }));
    // Auto-advance for single choice without a custom field; custom questions
    // wait for the user (they may want to type instead), then use "Suivant ›".
    if (hasCustomInput(q) || autoLock) return;
    setAutoLock(true);
    window.setTimeout(() => {
      setAutoLock(false);
      if (isLast) {
        if (questions.every((qq) => (answers[questionId(qq)]?.length ?? 0) > 0)) {
          compileAndSend();
        }
      } else {
        setIndex((i) => i + 1);
      }
    }, 220);
  };

  const changeCustom = (q: QuestionnaireQuestion, text: string) => {
    const qid = questionId(q);
    if (!multi) {
      // Typing an "other" answer replaces any chosen option for this question.
      setAnswers((prev) => ({ ...prev, [qid]: [] }));
    }
    setCustom((prev) => ({ ...prev, [qid]: text }));
  };

  const goBack = () => {
    if (autoLock) return;
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    if (!current || !answered(current) || autoLock) return;
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  return (
    <div className="qs">
      {questionnaire.introduction && (
        <p className="qs-intro">{questionnaire.introduction}</p>
      )}

      {current && (
        <div className="qs-panel">
          <div className="qs-progress">Question {index + 1} / {questions.length}</div>
          <p className="qs-question">{current.question}</p>

          {showCustomInput && (
            <input
              className="qs-custom"
              type="text"
              dir="auto"
              value={custom[id] ?? ""}
              disabled={submitted}
              placeholder={current.placeholder ?? "Écrire une autre réponse…"}
              onChange={(e) => changeCustom(current, e.target.value)}
            />
          )}

          <div className="qs-choices">
            {optionsOf(current).map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`qs-choice${selected.includes(opt.value) ? " selected" : ""}`}
                disabled={submitted}
                onClick={() => select(current, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="qs-nav">
            {index > 0 && (
              <button type="button" className="qs-prev" onClick={goBack}>
                ‹ Précédent
              </button>
            )}
            {!isLast && (multi || showCustomInput) && (
              <button type="button" className="qs-send" disabled={!answered(current)} onClick={goNext}>
                Suivant ›
              </button>
            )}
            {isLast && allAnswered && (
              <button type="button" className="qs-send" disabled={submitted} onClick={compileAndSend}>
                Envoyer les réponses
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}