"use client";
import React, { useState } from "react";
import { z } from "zod";
import clsx from "clsx";
import { signIn } from "@/server/auth/client";

const emailSchema = z.string().email();

function* retryTimeGenerator() {
  yield 30;
  yield 60;
  yield 60;
  while (true) {
    yield 90;
  }
}
const getRetryTimeInSeconds = retryTimeGenerator();

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [emailSent, setEmailSent] = useState(false);
  const [currentRetryTime, setCurrentRetryTime] = useState(0);

  function sendEmail() {
    return signIn
      .magicLink({ email, callbackURL: "/home" })
      .then(() => setEmailSent(true))
      .catch((err: Error) => {
        console.error(err);
        setError(
          err.message ?? "Something went wrong. Please, try again later."
        );
      });
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(undefined);
    setEmail(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      return setError("Email is invalid, please try again");
    }

    void sendEmail();
  }

  function handleRetry() {
    if (currentRetryTime !== 0) return;

    void sendEmail().then(() => {
      const next = getRetryTimeInSeconds.next();

      if (!next.done) {
        setCurrentRetryTime(next.value);
        let retryTimeValue = next.value;

        const intervalId = setInterval(() => {
          if (retryTimeValue <= 0) {
            return clearInterval(intervalId);
          }

          retryTimeValue -= 1;
          setCurrentRetryTime(retryTimeValue);
        }, 1000);
      }
    });
  }

  return (
    <main className="w-full h-screen flex">
      <div className="basis-full xl:basis-8/12 bg-sky-50 flex justify-center items-center">
        <div className="w-full max-w-[512px] flex flex-col gap-4 p-4 xl:p-0">
          {!emailSent ? (
            <>
              <h1 className="font-fancy text-3xl text-sky-950 text-center xl:text-5xl xl:leading-tight xl:text-left">
                Welcome, <br />
                Quizzing Champion
              </h1>
              <form
                className="px-6 py-5 xl:px-8 xl:py-7 flex flex-col justify-center gap-4 bg-sky-200 rounded-lg"
                onSubmit={handleSubmit}
                noValidate
              >
                <label className="text-sky-950" htmlFor="email">
                  Let’s start with your <span className="font-bold">email</span>
                </label>
                <div className="relative overflow-hidden rounded-md">
                  <input
                    id="email"
                    type="email"
                    placeholder="johndoe@quiz.app"
                    value={email}
                    onChange={handleEmailChange}
                    className={clsx(
                      "w-full border-2 rounded-md bg-sky-50 px-2.5 py-2 placeholder:text-slate-400 text-sky-900 focus:outline-sky-900",
                      {
                        "border-sky-600": error === undefined,
                        "border-red-700": error !== undefined,
                      }
                    )}
                  />
                  {email.length > 0 && (
                    <button
                      type="submit"
                      aria-label="Submit"
                      className="absolute right-[2px] top-[2px] bottom-[2px] px-2 rounded-r-md flex justify-center items-center text-sky-600 hover:bg-sky-100 transition-colors aspect-square"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M9 6l6 6l-6 6" />
                      </svg>
                    </button>
                  )}
                </div>
                {error && <span className="text-sm text-red-700">{error}</span>}
              </form>
              <SocialSignIn />
            </>
          ) : (
            <>
              <h1 className="font-fancy text-4.5xl leading-[3.75rem] text-sky-950 text-center xl:text-left">
                Check your inbox
              </h1>
              <div className="px-6 py-5 xl:px-8 xl:py-7 flex flex-col justify-center gap-4 bg-sky-200 rounded-lg">
                <p className="text-sky-950">
                  We sent you an email with a sign-in link.
                </p>
                <hr className="border-sky-600 border-dashed" />
                <div>
                  <p className="text-sky-700">
                    Didn’t receive it?{" "}
                    <button
                      role="button"
                      aria-label={
                        currentRetryTime > 0
                          ? `resend email - available in ${currentRetryTime} seconds`
                          : "resend email"
                      }
                      onClick={handleRetry}
                      className="inline font-bold text-sky-800"
                      disabled={currentRetryTime > 0}
                    >
                      Click here
                    </button>{" "}
                    to resend.
                  </p>
                  {currentRetryTime > 0 && (
                    <p className="text-sky-600 mt-2">
                      Email sent! You can retry after {currentRetryTime}{" "}
                      seconds.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        role="presentation"
        aria-label="topography pattern"
        className={`hidden xl:block basis-4/12 bg-teal-50`}
      >
        <div
          className="w-full h-full bg-sky-200"
          style={{ maskImage: "url('/topography.svg')" }}
        />
      </div>
    </main>
  );
}

function SocialSignIn() {
  return (
    <div className="bg-transparent rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-sm text-center text-sky-700">
        Alternatively, you can sign in through
      </h2>
      <div className="flex justify-center items-center gap-4">
        <button
          aria-label="Sign In with Google"
          className="p-1 rounded-full bg-sky-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-sky-600"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
          </svg>
        </button>
        <button
          aria-label="Sign In with Facebook"
          className="p-1 rounded-full bg-sky-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-sky-600"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 2a1 1 0 0 1 .993 .883l.007 .117v4a1 1 0 0 1 -.883 .993l-.117 .007h-3v1h3a1 1 0 0 1 .991 1.131l-.02 .112l-1 4a1 1 0 0 1 -.858 .75l-.113 .007h-2v6a1 1 0 0 1 -.883 .993l-.117 .007h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-6h-2a1 1 0 0 1 -.993 -.883l-.007 -.117v-4a1 1 0 0 1 .883 -.993l.117 -.007h2v-1a6 6 0 0 1 5.775 -5.996l.225 -.004h3z" />
          </svg>
        </button>
        <button
          aria-label="Sign In with Discord"
          className="p-1 rounded-full bg-sky-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-sky-600"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14.983 3l.123 .006c2.014 .214 3.527 .672 4.966 1.673a1 1 0 0 1 .371 .488c1.876 5.315 2.373 9.987 1.451 12.28c-1.003 2.005 -2.606 3.553 -4.394 3.553c-.732 0 -1.693 -.968 -2.328 -2.045a21.512 21.512 0 0 0 2.103 -.493a1 1 0 1 0 -.55 -1.924c-3.32 .95 -6.13 .95 -9.45 0a1 1 0 0 0 -.55 1.924c.717 .204 1.416 .37 2.103 .494c-.635 1.075 -1.596 2.044 -2.328 2.044c-1.788 0 -3.391 -1.548 -4.428 -3.629c-.888 -2.217 -.39 -6.89 1.485 -12.204a1 1 0 0 1 .371 -.488c1.439 -1.001 2.952 -1.459 4.966 -1.673a1 1 0 0 1 .935 .435l.063 .107l.651 1.285l.137 -.016a12.97 12.97 0 0 1 2.643 0l.134 .016l.65 -1.284a1 1 0 0 1 .754 -.54l.122 -.009zm-5.983 7a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15zm6 0a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
