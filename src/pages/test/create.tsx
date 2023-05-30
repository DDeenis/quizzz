import { QuestionComplexity, QuestionType } from "@/types/question";
import type { TestCreateObject } from "@/types/test";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
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
import { useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { getTotalScore } from "@/utils/questions";
import FormHelperText from "@mui/material/FormHelperText";

export default function CreateTest() {
  const { push } = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });
  const {
    control,
    register,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCreateObject>();
  const questionsErrorType = errors.questions?.root?.type;

  const questionFieldsArray = useFieldArray<TestCreateObject>({
    control: control,
    name: "questions",
    rules: {
      validate: {
        questionsMinimum: (value, formValues) => {
          const minimumQuestions = formValues.questionsCount;
          return !(minimumQuestions > value.length);
        },
        scoreMinimum: (value, formValues) => {
          const totalScore = getTotalScore(value);
          return totalScore >= formValues.minimumScore;
        },
        variantsMinimum: (value) => {
          return value.every((q) => q.questionData.variants.length >= 2);
        },
        answersMinimum: (value) => {
          return value.every((q) => q.answerData.length > 0);
        },
      },
    },
  });

  const appendQuestion = () =>
    questionFieldsArray.append({
      questionType: QuestionType.SingleVariant,
      complexity: QuestionComplexity.Low,
      questionData: { question: "", variants: [] },
      answerData: [],
    });

  const onSubmit = handleSubmit(console.log);

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
        <Typography variant="h2">Create new test</Typography>
        <Button type="submit" variant="contained" size="large">
          Create
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
            label="Test name"
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
            {...register("time", { required: true, min: 1 })}
          />
          <TextField
            type="number"
            variant="outlined"
            label="Questions count"
            required
            sx={{ my: 2 }}
            fullWidth
            error={Boolean(errors.questionsCount)}
            {...register("questionsCount", { required: true, min: 1 })}
          />
          <TextField
            type="number"
            variant="outlined"
            label="Minimum score"
            required
            fullWidth
            error={Boolean(errors.minimumScore)}
            {...register("minimumScore", { required: true, min: 1 })}
          />
        </Box>
      </Box>
      <Box display={"flex"} flexDirection={"column"} gap={4}>
        {questionFieldsArray.fields.map((field, index) => (
          <FormField
            index={index}
            control={control}
            errors={errors}
            register={register}
            getValues={getValues}
            setValue={setValue}
            key={field.id}
          />
        ))}
        <Button variant="outlined" onClick={appendQuestion}>
          Add question
        </Button>
      </Box>
    </Box>
  );
}

type UseArrayHackType = {
  variants: {
    value: string;
  }[];
};

const FormField = ({
  index,
  control,
  errors,
  register,
  getValues,
  setValue,
}: {
  index: number;
  control: Control<TestCreateObject, any>;
  errors: FieldErrors<TestCreateObject>;
  register: UseFormRegister<TestCreateObject>;
  getValues: UseFormGetValues<TestCreateObject>;
  setValue: UseFormSetValue<TestCreateObject>;
}) => {
  const variantsForm = useForm<UseArrayHackType>({
    defaultValues: {
      variants: [{ value: "" }, { value: "" }],
    },
  });
  const variantsFieldsArray = useFieldArray<UseArrayHackType>({
    control: variantsForm.control,
    name: "variants",
  });
  const questionType = useWatch({
    control,
    name: `questions.${index}.questionType`,
  });

  const appendVariant = () => variantsFieldsArray.append([{ value: "" }]);
  const getVariant = (i: number) =>
    getValues().questions[index]?.questionData.variants[i] ?? "";

  const removeVariant = (i: number) => () => {
    const question = getValues().questions[index];
    const variants = question?.questionData.variants ?? [];
    const variant = variants[i] ?? "";
    const answerData = question?.answerData ?? [];

    if (variants.length <= 2) return;

    setValue(
      `questions.${index}.answerData`,
      answerData.filter((v) => v !== variant)
    );
    setValue(
      `questions.${index}.questionData.variants`,
      variants.filter((v) => v !== variant)
    );
    variantsFieldsArray.remove(i);
  };

  useEffect(() => {
    setValue(`questions.${index}.answerData`, []);
  }, [questionType]);

  return (
    <Card sx={{ p: 2 }}>
      <Typography gutterBottom variant="h5" component="div">
        Question {index + 1}
      </Typography>
      <CardContent sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box
          maxWidth={300}
          width={"100%"}
          display={"flex"}
          flexDirection={"column"}
          gap={2}
        >
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
            <Select
              labelId={`complexity-label-${index}`}
              label="Complexity"
              defaultValue={QuestionComplexity.Low}
              required
              fullWidth
              {...register(`questions.${index}.complexity`, { required: true })}
            >
              <MenuItem value={QuestionComplexity.Low}>Low</MenuItem>
              <MenuItem value={QuestionComplexity.Medium}>Medium</MenuItem>
              <MenuItem value={QuestionComplexity.High}>High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id={`qtype-label-${index}`}>
              Question answer type
            </InputLabel>
            <Select
              labelId={`qtype-label-${index}`}
              label="Question answer type"
              defaultValue={QuestionType.SingleVariant}
              required
              fullWidth
              {...register(`questions.${index}.questionType`, {
                required: true,
              })}
            >
              <MenuItem value={QuestionType.SingleVariant}>
                Single variant
              </MenuItem>
              <MenuItem value={QuestionType.MultipleVariants}>
                Multiple variants
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flexGrow={1} display={"flex"} flexDirection={"column"} gap={2}>
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
                {...register(`questions.${index}.questionData.variants.${i}`, {
                  required: true,
                  shouldUnregister: true,
                })}
              />
              <Controller
                control={control}
                name={`questions.${index}.answerData`}
                render={({ field: { onBlur, value, ref } }) => {
                  const variant = getVariant(i);
                  const val = value.includes(variant);

                  return questionType === QuestionType.SingleVariant ? (
                    <Radio
                      onBlur={onBlur}
                      onChange={(e, checked) => {
                        const variant = getVariant(i);
                        setValue(
                          `questions.${index}.answerData`,
                          checked
                            ? [variant]
                            : value.filter((v) => v !== variant)
                        );
                      }}
                      checked={val}
                      inputRef={ref}
                      name="radio-buttons"
                    />
                  ) : (
                    <Checkbox
                      onBlur={onBlur}
                      onChange={(e, checked) => {
                        const variant = getVariant(i);
                        setValue(
                          `questions.${index}.answerData`,
                          checked
                            ? [...value, variant]
                            : value.filter((v) => v !== variant)
                        );
                      }}
                      checked={val}
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
