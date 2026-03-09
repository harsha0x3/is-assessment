import { Controller, type UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { AppQuestionWithAnswer } from "../types";

interface Props {
  question: AppQuestionWithAnswer;
  form: UseFormReturn<any>;
  isEditing: boolean;
}

const AppQuestionItem = ({ question, form, isEditing }: Props) => {
  const fieldName = `answers.${question.id}`;

  return (
    <Card className="p-4 space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Q{question.sequence_number}
        </p>

        <p className="font-medium">{question.text}</p>
      </div>

      <Controller
        control={form.control}
        name={fieldName}
        defaultValue={
          question.answer?.answer_option_id
            ? String(question.answer.answer_option_id)
            : ""
        }
        render={({ field, fieldState }) => (
          <Field>
            <FieldContent>
              <RadioGroup
                id={field.value}
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-3"
                disabled={!isEditing}
              >
                {question.options.map((opt) => (
                  <Field
                    key={String(opt.id)}
                    orientation="horizontal"
                    className="items-start"
                  >
                    <RadioGroupItem value={String(opt.id)} />

                    <FieldLabel
                      className="font-normal cursor-pointer"
                      htmlFor={String(opt.id)}
                    >
                      <div className="flex flex-col">
                        <span>{opt.text}</span>

                        {opt.description && (
                          <FieldDescription className="text-xs">
                            {opt.description}
                          </FieldDescription>
                        )}
                      </div>
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>

              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </FieldContent>
          </Field>
        )}
      />
    </Card>
  );
};

export default AppQuestionItem;
