"use client";
import { QuestionType } from "@/types/question";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "../ui/image-upload";
import { Switch } from "../ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import clsx from "clsx";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { memo, useCallback, useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Plus, Save, Trash, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

const ACCEPTED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"];

const formSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(4096).optional(),
  image: z
    .custom<File | undefined>()
    .refine((f) => (f ? f.size <= 10 * 1024 * 1024 : true))
    .refine((f) => (f ? ACCEPTED_MIME_TYPES.includes(f.type) : true))
    .optional(),
  timeInMinutes: z
    .number()
    .min(5)
    .max(60 * 6)
    .optional(),
  autoScore: z.boolean().default(false),
  minimumCorrectAnswers: z.number().min(1),
  attempts: z.number().min(1).optional(),
  questionsCount: z.number().min(1),
  questions: z.array(
    z.object({
      name: z.string().min(1).max(255).trim(),
      description: z.string().max(4096).optional(),
      image: z
        .custom<File | undefined>()
        .refine((f) => (f ? f.size <= 10 * 1024 * 1024 : true))
        .refine((f) => (f ? ACCEPTED_MIME_TYPES.includes(f.type) : true))
        .optional(),
      questionType: z
        .nativeEnum(QuestionType)
        .default(QuestionType.SingleVariant),
      answers: z.array(
        z.object({
          variant: z.string().min(1).max(255).trim(),
          isCorrect: z.boolean().default(false),
        })
      ),
    })
  ),
});

type FormType = z.infer<typeof formSchema>;

export default function TestForm() {
  const form = useForm<FormType>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      autoScore: false,
      minimumCorrectAnswers: 0,
      attempts: 1,
      questions: [
        {
          name: "",
          description: "",
          questionType: QuestionType.SingleVariant,
          answers: [
            { variant: "", isCorrect: false },
            { variant: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <Form {...form}>
        <GeneralTestForm form={form} />
        <Separator orientation="horizontal" />
        <QuestionsForms form={form} />
      </Form>
    </div>
  );
}

interface FormProps {
  form: UseFormReturn<FormType, unknown, undefined>;
}

function GeneralTestForm({ form }: FormProps) {
  const [minimumCorrectAnswersOption, setMinimumCorrectAnswersOption] =
    useState<string | undefined>("all");
  const autoScoreEnabled = useWatch({
    control: form.control,
    name: "autoScore",
  });

  return (
    <div className="p-3 space-y-5">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover image (optional)</FormLabel>
            <FormControl>
              <ImageUpload {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="autoScore"
        render={({ field }) => {
          const { value, onChange, ...rest } = field;
          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={value}
                    onCheckedChange={onChange}
                    {...rest}
                  />
                </FormControl>
                <FormLabel>Enable auto score</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Accordion
        type="multiple"
        defaultValue={["auto-score-settings"]}
        className="space-y-2"
      >
        <AccordionItem
          value="auto-score-settings"
          className={clsx(
            "border-none",
            !autoScoreEnabled ? "hidden" : "block"
          )}
        >
          <AccordionTrigger className="py-2 font-semibold">
            Auto score settings
          </AccordionTrigger>
          <AccordionContent className="mt-4">
            <FormField
              control={form.control}
              name="minimumCorrectAnswers"
              render={({ field }) => {
                const { onChange, ...rest } = field;

                function handleChange(...event: unknown[]) {
                  onChange(...event);
                  setMinimumCorrectAnswersOption(undefined);
                }

                return (
                  <FormItem>
                    <FormLabel>Minimum correct answers</FormLabel>
                    <ToggleGroup
                      value={minimumCorrectAnswersOption}
                      onValueChange={(v) => {
                        if (v) {
                          // TODO: set new minimumCorrectAnswers based on minimumCorrectAnswersOption
                          setMinimumCorrectAnswersOption(v);
                        }
                      }}
                      type="single"
                      className="justify-between"
                    >
                      <ToggleGroupItem
                        value="all"
                        className="min-h-9 h-max py-1 bg-gray-200 rounded-md border border-gray-200 data-[state=on]:bg-gray-300 data-[state=on]:border-gray-400"
                      >
                        All questions
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="50%"
                        className="min-h-9 h-max py-1 bg-gray-200 rounded-md border border-gray-200 data-[state=on]:bg-gray-300 data-[state=on]:border-gray-400"
                      >
                        50% of questions
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="70%"
                        className="min-h-9 h-max py-1 bg-gray-200 rounded-md border border-gray-200 data-[state=on]:bg-gray-300 data-[state=on]:border-gray-400"
                      >
                        70% of questions
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <FormControl>
                      <Input type="number" onChange={handleChange} {...rest} />
                    </FormControl>
                    <FormDescription>
                      Minimum amount of correct answers that student needs to
                      get to pass the test.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="additional-settings" className="border-none">
          <AccordionTrigger className="py-2 font-semibold">
            Additional settings
          </AccordionTrigger>
          <AccordionContent className="mt-4 space-y-5">
            <FormField
              control={form.control}
              name="attempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attempts</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    How many attempts to take the test student have.
                    <br />
                    One attempt by default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeInMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time limit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="No limit" {...field} />
                  </FormControl>
                  <FormDescription>
                    Test time limit in minutes. Leave blank to to remove time
                    limit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Questions count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="All questions"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If actual questions count is more than this number, a
                    student will get specified number of random questions from
                    the list of all questions. Leave blank to select all
                    questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button
        type="submit"
        className="w-full flex justify-center items-center gap-2"
      >
        <Save className="w-4 h-4" /> Save changes
      </Button>
    </div>
  );
}

const QuestionsForms = memo(({ form }: FormProps) => {
  const [animationParent] = useAutoAnimate();
  const questionsArray = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const appendEmptyQuestion = () => {
    questionsArray.append({
      name: "",
      description: "",
      questionType: QuestionType.SingleVariant,
      answers: [
        { variant: "", isCorrect: false },
        { variant: "", isCorrect: false },
      ],
    });
    setTimeout(() => {
      document
        .getElementById("question-form-buttons")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleRemoveQuestion = useCallback(
    (index: number) => {
      questionsArray.remove(index);
    },
    [questionsArray]
  );

  return (
    <div className="p-3 space-y-8" ref={animationParent}>
      {questionsArray.fields.map((q, i) => {
        return (
          <QuestionForm
            index={i}
            form={form}
            handleRemoveQuestion={handleRemoveQuestion}
            key={q.id}
          />
        );
      })}
      <div className="flex flex-col gap-3" id="question-form-buttons">
        <Button
          type="button"
          variant="secondary"
          className="flex justify-center items-center gap-2 w-full"
          onClick={appendEmptyQuestion}
        >
          <Plus className="w-4 h-4" /> Add new question
        </Button>
        <Button
          type="submit"
          className="flex justify-center items-center gap-2 w-full"
        >
          <Save className="w-4 h-4" /> Save changes
        </Button>
      </div>
    </div>
  );
});
QuestionsForms.displayName = "QuestionsForms";

interface QuestionFormProps extends FormProps {
  index: number;
  handleRemoveQuestion: (index: number) => void;
}

const QuestionForm = memo(
  ({ index: questionIndex, form, handleRemoveQuestion }: QuestionFormProps) => {
    const [answersRemoveMode, setAnswersRemoveMode] = useState(false);
    const questionType = useWatch({
      control: form.control,
      name: `questions.${questionIndex}.questionType`,
    });
    const answersArray = useFieldArray({
      control: form.control,
      name: `questions.${questionIndex}.answers`,
    });
    const selectedRadioItem =
      questionType === QuestionType.SingleVariant
        ? answersArray.fields.find((a) => a.isCorrect)?.id
        : undefined;

    const appendEmptyAnswer = () =>
      answersArray.append({ variant: "", isCorrect: false });
    const removeAnswer = (i: number) => answersArray.remove(i);

    const handleSelectRadioItem = (value: string) => {
      console.log("handleSelectRadioItem");

      const selectedItemIndex = answersArray.fields.findIndex(
        (a) => a.id === value
      );

      if (selectedItemIndex === -1) return;

      const newVariants = [
        ...form.getValues().questions[questionIndex]!.answers,
      ];

      for (let i = 0; i < newVariants.length; i++) {
        if (i === selectedItemIndex) continue;
        const v = newVariants[i];
        if (v) v.isCorrect = false;
      }

      const v = newVariants[selectedItemIndex];
      if (v) v.isCorrect = true;

      answersArray.replace(newVariants);
    };

    return (
      <div className="p-3 space-y-3 bg-white rounded-sm border border-gray-200">
        <div className="text-xs uppercase flex justify-between">
          <span className="text-gray-300">
            {questionType === QuestionType.SingleVariant
              ? "single answer"
              : "multiple answers"}{" "}
            question
          </span>
          <span className="text-gray-400">question №{questionIndex + 1}</span>
        </div>
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.image`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <FormControl>
                <ImageUpload {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.questionType`}
          render={({ field }) => {
            const { onChange, ...rest } = field;

            function handleChange(value?: string) {
              if (!value) return;

              onChange(value);

              const newVariants = [
                ...form.getValues().questions[questionIndex]!.answers,
              ];

              for (const v of newVariants) {
                v.isCorrect = false;
              }

              answersArray.replace(newVariants);
            }

            return (
              <FormItem>
                <FormLabel>Question type</FormLabel>
                <FormControl>
                  <ToggleGroup
                    onValueChange={handleChange}
                    type="single"
                    className="justify-start gap-3"
                    {...rest}
                  >
                    <ToggleGroupItem
                      value={QuestionType.SingleVariant}
                      className="min-h-9 h-max py-1 bg-gray-200 rounded-md border border-gray-200 data-[state=on]:bg-gray-300 data-[state=on]:border-gray-400 grow"
                    >
                      Single answer
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={QuestionType.MultipleVariants}
                      className="min-h-9 h-max py-1 bg-gray-200 rounded-md border border-gray-200 data-[state=on]:bg-gray-300 data-[state=on]:border-gray-400 grow"
                    >
                      Multiple answers
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="space-y-3 py-2">
          <p className="text-sm font-medium leading-none">Answers</p>
          <RadioGroup
            value={selectedRadioItem}
            onValueChange={handleSelectRadioItem}
          >
            {answersArray.fields.map((answer, i) => {
              return (
                <div className="flex items-center gap-2" key={answer.id}>
                  {!answersRemoveMode ? (
                    questionType === QuestionType.SingleVariant ? (
                      <RadioGroupItem value={answer.id} />
                    ) : (
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.answers.${i}.isCorrect`}
                        render={({ field }) => {
                          const { value, onChange, ...rest } = field;
                          return (
                            <FormItem>
                              <FormLabel className="sr-only">
                                Answer №{i + 1} isCorrect checkbox
                              </FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={value}
                                  onCheckedChange={onChange}
                                  {...rest}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    )
                  ) : (
                    <button
                      type="button"
                      aria-label="remove answer"
                      onClick={() => removeAnswer(i)}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.answers.${i}.variant`}
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormLabel className="sr-only">
                          Answer №{i + 1}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={`Answer №${i + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}
          </RadioGroup>
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-2 w-full"
            onClick={appendEmptyAnswer}
          >
            <Plus className="w-4 h-4" /> Add new answer
          </Button>

          <Label className="flex items-center gap-2">
            <Switch
              checked={answersRemoveMode}
              onCheckedChange={setAnswersRemoveMode}
            />
            <span>Remove answers mode</span>
          </Label>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="flex items-center gap-2 font-medium"
              onClick={() => handleRemoveQuestion(questionIndex)}
            >
              <Trash2 className="w-5 h-5" />
              Delete question
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
QuestionForm.displayName = "QuestionForm";
