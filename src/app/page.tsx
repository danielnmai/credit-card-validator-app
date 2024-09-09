"use client";

import {
  Alert,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  TextInput,
} from "@mantine/core";
import { matches, useForm } from "@mantine/form";
import axios, { AxiosError } from "axios";
import {
  formatCreditCard,
  registerCursorTracker,
  type FormatCreditCardOptions,
} from "cleave-zen";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const cardOptions: FormatCreditCardOptions = { delimiter: " " };

type ResponseData = {
  data: {
    valid: boolean;
  };
};

const API = "http://localhost:8000/validate";

const Home = () => {
  const inputRef = useRef(null);
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [cardNumber, setCardNumber] = useState<string>("");

  const form = useForm({
    initialValues: {
      cardNumber: "",
    },
    validate: {
      cardNumber: matches(
        /\b(?:\d{4}[ -]?){3}(?=\d{4}\b)/,
        "Invalid card number"
      ),
    },
  });

  useEffect(() => {
    if (form.isTouched()) {
      setIsValid(undefined);
    }
  }, [form, isValid]);

  // Handle cursor backtracking after adding delimiter to input
  useEffect(() => {
    return registerCursorTracker({
      input: inputRef.current as unknown as HTMLInputElement,
      delimiter: " ",
    });
  }, []);

  const renderValidationResult = () => {
    if (isValid == undefined) return;

    if (isValid) {
      return (
        <Alert
          mt={10}
          title="Congrats!"
          color="green"
          withCloseButton
          onClose={() => setIsValid(undefined)}
        >
          Your card number is valid and good to be used.
        </Alert>
      );
    }

    return (
      <Alert
        mt={10}
        title="Bummer!"
        color="red"
        withCloseButton
        onClose={() => setIsValid(undefined)}
      >
        Your card number is not valid. Please try a different one.
      </Alert>
    );
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCreditCard(event.currentTarget.value, cardOptions));
    form.setFieldValue(
      "cardNumber",
      formatCreditCard(event.currentTarget.value, cardOptions)
    );
  };

  const handleSubmit = async () => {
    if (!cardNumber) return;

    const sanitizedNumber = cardNumber.replace(/\D/g, "");
    setIsLoading(true);

    try {
      const { data }: ResponseData = await axios.post(API, {
        cardNumber: sanitizedNumber,
      });

      if (data.valid) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        form.setErrors({
          cardNumber: "Failed to validate card number. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  return (
    <Container>
      <Flex m={10} justify="center">
        <Paper radius="md" p="xl" withBorder w={400}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              ref={inputRef}
              required
              withAsterisk
              label="Credit Card Number"
              placeholder="1111 1111 1111 1111"
              value={cardNumber}
              {...form.getInputProps("cardNumber")}
              onChange={handleOnChange}
              error={form.errors.cardNumber}
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={isLoading}>
                Check
              </Button>
            </Group>
            {renderValidationResult()}
          </form>
        </Paper>
      </Flex>
    </Container>
  );
};

export default Home;
