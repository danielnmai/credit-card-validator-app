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
import { useState } from "react";

type ResponseData = {
  data: {
    valid: boolean;
  };
};

type FormType = {
  cardNumber: string;
};

const API = "http://localhost:8000/validate";

const Home = () => {
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>();

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

  const renderValidationResult = () => {
    if (isValid == undefined) return;

    if (isValid) {
      return (
        <Alert mt={10} title="Congrats!" color="green" withCloseButton>
          Your card number is valid and good to be used.
        </Alert>
      );
    }

    return (
      <Alert mt={10} title="Bummer" color="red" withCloseButton>
        Your card number is not valid. Please try a different one.
      </Alert>
    );
  };

  const handleSubmit = async ({ cardNumber }: FormType) => {
    const sanitizedNumber = cardNumber.replace(/\D/g, "");
    setIsLoading(true);

    try {
      const { data }: ResponseData = await axios.post(API, {
        cardNumber: sanitizedNumber,
      });

      if (data.valid) {
        setIsValid(true);
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
              required
              withAsterisk
              label="Credit Card Number"
              placeholder="4242..."
              value={form.values.cardNumber}
              onChange={(event) =>
                form.setFieldValue("cardNumber", event.currentTarget.value)
              }
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
