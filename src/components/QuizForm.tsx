import {
  QuestionComplexity,
  type QuestionCreateObject,
  QuestionType,
  type QuestionUpdateObject,
  type QuestionVariant,
} from "@/types/question";
import type { Quiz, QuizCreateObject, QuizUpdateObject } from "@/types/quiz";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormGetValues,
  type FieldErrors,
} from "react-hook-form";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { getTotalScore } from "@/utils/questions";
import FormHelperText from "@mui/material/FormHelperText";

type RemoveQuestionFn =
  | ((question: QuestionCreateObject) => void)
  | ((question: QuestionUpdateObject) => void);

interface QuizFormProps {
  quiz?: Quiz;
  onSubmit:
    | ((formData: QuizCreateObject) => void)
    | ((formData: QuizUpdateObject) => void);
  onRemoveQuestion?: RemoveQuestionFn;
}

export function QuizForm(props: QuizFormProps) {
  const {
    control,
    register,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizCreateObject>({
    defaultValues: props.quiz,
  });

  const questionsErrorType = errors.questions?.root?.type;
  const isUpdate = Boolean(props.quiz);

  const questionFieldsArray = useFieldArray<QuizCreateObject>({
    control: control,
    name: "questions",
    rules: {
      validate: {
        questionsMinimum: (value, formValues) => {
          const minimumQuestions = formValues.questionsCount;
          return !(minimumQuestions > value.length);
        },
        scoreMinimum: (value, formValues) => {
          const totalScore = getTotalScore(value as QuestionCreateObject[]);
          return totalScore >= formValues.minimumScore;
        },
      },
    },
    // shouldUnregister: true,
  });

  const appendQuestion = () =>
    questionFieldsArray.append({
      questionType: QuestionType.SingleVariant,
      complexity: QuestionComplexity.Low,
      questionData: {
        question: "",
        variants: [],
      },
    });
  const removeQuestion = (i: number) => () => {
    const question = getValues().questions[i];
    if (!question) return;

    questionFieldsArray.remove(i);
    props.onRemoveQuestion?.(question);
  };

  const onSubmit = handleSubmit(props.onSubmit);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={4}
      component={"form"}
      onSubmit={onSubmit}
      noValidate
    >
      <Box
        display={"flex"}
        flexWrap={"wrap"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="h2">
          {isUpdate ? "Update" : "Create new"} quiz
        </Typography>
        <Button type="submit" variant="contained" size="large">
          {isUpdate ? "Update" : "Create"}
        </Button>
      </Box>
      {questionsErrorType && (
        <FormHelperText error>
          {questionsErrorType === "scoreMinimum"
            ? "Overral score is less than minimal score"
            : questionsErrorType === "variantsMinimum"
            ? "All questions must have at least 2 variants"
            : questionsErrorType === "answersMinimum"
            ? "All questions must have at least 1 answer"
            : "Questions count and minimum questions count don't match"}
        </FormHelperText>
      )}
      <Box
        display={"flex"}
        gap={4}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
      >
        <Box sx={{ flexBasis: { md: "48%", xs: "100%" } }}>
          <TextField
            variant="filled"
            label="Quiz name"
            sx={{ mb: 2 }}
            required
            fullWidth
            error={Boolean(errors.name)}
            {...register("name", { required: true })}
          />
          <TextField
            placeholder="Description"
            multiline
            rows={6}
            fullWidth
            {...register(`description`)}
          />
        </Box>
        <Box sx={{ flexBasis: { md: "48%", xs: "100%" } }}>
          <TextField
            type="number"
            variant="outlined"
            label="Time in minutes"
            required
            fullWidth
            error={Boolean(errors.time)}
            {...register("time", {
              required: true,
              min: 1,
              valueAsNumber: true,
            })}
          />
          <TextField
            type="number"
            variant="outlined"
            label="Questions count"
            required
            sx={{ my: 2 }}
            fullWidth
            error={Boolean(errors.questionsCount)}
            {...register("questionsCount", {
              required: true,
              min: 1,
              valueAsNumber: true,
            })}
          />
          <TextField
            type="number"
            variant="outlined"
            label="Minimum score"
            required
            fullWidth
            error={Boolean(errors.minimumScore)}
            {...register("minimumScore", {
              required: true,
              min: 1,
              valueAsNumber: true,
            })}
          />
          <TextField
            type="number"
            variant="outlined"
            label="Attempts"
            fullWidth
            sx={{ mt: 2 }}
            error={Boolean(errors.attempts)}
            {...register("attempts", {
              min: 1,
              valueAsNumber: true,
            })}
          />
        </Box>
      </Box>
      <Box display={"flex"} flexDirection={"column"} gap={4}>
        {questionFieldsArray.fields.map((field, index) => {
          return (
            <FormField
              index={index}
              control={control}
              errors={errors}
              onRemove={removeQuestion(index)}
              register={register}
              getValues={getValues}
              setValue={setValue}
              key={field.id}
            />
          );
        })}
        <Button variant="outlined" onClick={appendQuestion}>
          Add question
        </Button>
      </Box>
    </Box>
  );
}

const FormField = ({
  index,
  control,
  errors,
  onRemove,
  register,
  getValues,
  setValue,
}: {
  index: number;
  control: Control<QuizCreateObject, unknown>;
  errors: FieldErrors<QuizCreateObject>;
  onRemove: () => void;
  register: UseFormRegister<QuizCreateObject>;
  getValues: UseFormGetValues<QuizCreateObject>;
  setValue: UseFormSetValue<QuizCreateObject>;
}) => {
  const variantsFieldsArray = useFieldArray<QuizCreateObject>({
    control,
    name: `questions.${index}.questionData.variants`,
    rules: {
      validate: {
        variantsMinimum: (value) => {
          const variants = value as QuestionVariant[];
          return variants.length >= 2;
        },
        answersMinimum: (value) => {
          const variants = value as QuestionVariant[];
          return variants.some((v) => v.isCorrect);
        },
      },
    },
  });
  const questionType = useWatch({
    control,
    name: `questions.${index}.questionType`,
  });

  const errorType =
    errors.questions?.[index]?.questionData?.variants?.root?.type;

  const appendVariant = () => {
    variantsFieldsArray.append([{ variant: "", isCorrect: false }]);
  };

  const removeVariant = (i: number) => () => {
    const question = getValues().questions[index];
    const variants = question?.questionData.variants ?? [];

    if (variants.length <= 2) return;

    variantsFieldsArray.remove(i);
  };

  return (
    <Card sx={{ p: 2 }}>
      {errorType && (
        <FormHelperText error>
          {errorType === "variantsMinimum"
            ? "Question must have at least 2 variants"
            : "Question must have at least 1 answer"}
        </FormHelperText>
      )}
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography gutterBottom variant="h5" component="div">
          Question {index + 1}
        </Typography>
        <IconButton aria-label="delete" size="medium" onClick={onRemove}>
          <DeleteIcon fontSize="medium" />
        </IconButton>
      </Box>
      <CardContent sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box flexGrow={1} display={"flex"} flexDirection={"column"} gap={2}>
          <TextField
            type={"text"}
            variant="filled"
            label={"Question"}
            fullWidth
            error={Boolean(errors.questions?.[index]?.questionData?.question)}
            required
            {...register(`questions.${index}.questionData.question`, {
              required: true,
            })}
          />
          <TextField
            placeholder="Description"
            multiline
            rows={4}
            fullWidth
            {...register(`questions.${index}.questionData.description`)}
          />
          <FormControl fullWidth>
            <InputLabel id={`complexity-label-${index}`}>Complexity</InputLabel>
            <Controller
              control={control}
              name={`questions.${index}.complexity`}
              render={({ field: { value } }) => {
                return (
                  <Select
                    labelId={`complexity-label-${index}`}
                    label="Complexity"
                    required
                    fullWidth
                    value={value}
                    inputProps={register(`questions.${index}.complexity`, {
                      required: true,
                    })}
                  >
                    <MenuItem value={QuestionComplexity.Low}>Low</MenuItem>
                    <MenuItem value={QuestionComplexity.Medium}>
                      Medium
                    </MenuItem>
                    <MenuItem value={QuestionComplexity.High}>High</MenuItem>
                  </Select>
                );
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id={`qtype-label-${index}`}>
              Question answer type
            </InputLabel>
            <Controller
              control={control}
              name={`questions.${index}.questionType`}
              render={({ field: { value } }) => {
                return (
                  <Select
                    labelId={`qtype-label-${index}`}
                    label="Question answer type"
                    value={value}
                    required
                    fullWidth
                    inputProps={register(`questions.${index}.questionType`, {
                      required: true,
                      onChange() {
                        const question = getValues().questions[index];
                        const variants = question?.questionData.variants ?? [];
                        setValue(
                          `questions.${index}.questionData.variants`,
                          variants.map((v) => ({ ...v, isCorrect: false }))
                        );
                      },
                    })}
                  >
                    <MenuItem value={QuestionType.SingleVariant}>
                      Single variant
                    </MenuItem>
                    <MenuItem value={QuestionType.MultipleVariants}>
                      Multiple variants
                    </MenuItem>
                  </Select>
                );
              }}
            />
          </FormControl>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flexGrow={2} display={"flex"} flexDirection={"column"} gap={2}>
          {variantsFieldsArray.fields.map((field, i) => (
            <Box display={"flex"} gap={2} key={field.id}>
              <TextField
                variant="outlined"
                label={`Variant ${i + 1}`}
                required
                fullWidth
                error={Boolean(
                  errors.questions?.[index]?.questionData?.variants?.[i]
                )}
                {...register(
                  `questions.${index}.questionData.variants.${i}.variant`,
                  {
                    required: true,
                  }
                )}
              />
              <Controller
                control={control}
                name={`questions.${index}.questionData.variants`}
                render={({ field: { onBlur, value, ref, onChange } }) => {
                  const isChecked = value[i]?.isCorrect;

                  return questionType === QuestionType.SingleVariant ? (
                    <Radio
                      onBlur={onBlur}
                      onChange={() => {
                        onChange(
                          getValues().questions[
                            index
                          ]?.questionData.variants.map((v, vi) => ({
                            ...v,
                            isCorrect: i === vi,
                          }))
                        );
                      }}
                      checked={isChecked}
                      inputRef={ref}
                      name="radio-buttons"
                    />
                  ) : (
                    <Checkbox
                      onBlur={onBlur}
                      onChange={(e, checked) => {
                        onChange(
                          getValues().questions[
                            index
                          ]?.questionData.variants.map((v, vi) => ({
                            ...v,
                            isCorrect: i === vi ? checked : v.isCorrect,
                          }))
                        );
                      }}
                      checked={isChecked}
                      inputRef={ref}
                    />
                  );
                }}
              />
              <IconButton
                aria-label="delete"
                size="small"
                onClick={removeVariant(i)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button onClick={appendVariant} variant="contained">
            Add variant
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
