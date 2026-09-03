"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignUp, useUser } from "@clerk/nextjs";
import { PhoneCodeSwitcher } from "@/components/ui/phone-code-switcher";
import { api } from "@/lib/api";
import { Loader2, ArrowRight, ShieldCheck, PhoneCall, Check, UserRound } from "lucide-react";
import Link from "next/link";
import axios from "axios"

const STEPS = ["phone", "verify", "details"] as const;
type Step = (typeof STEPS)[number];

export default function SignUpPageContent() {

  const {user} = useUser();
  const router = useRouter();
  const {signUp,fetchStatus } = useSignUp();
  const isClerkLoaded = fetchStatus === "idle";


  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [backendUserId, setBackendUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoSubmitRef = useRef(false);
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (step !== "verify") return;
    requestAnimationFrame(() => {
      const firstEmpty = code.findIndex((digit) => !digit);
      inputRefs.current[firstEmpty === -1 ? code.length - 1 : firstEmpty]?.focus();
    });
  }, [step]);

  // const registerBackendUser = async (sessionId: string | null | undefined) => {
  //   if (!signUp || !signUp.createdUserId || !sessionId) {
  //     throw new Error("Your account session could not be established. Please try again.");
  //   }

  //   const rawPhone = phoneNumber.replace(/\s/g, "");
  //   const localPhone = rawPhone.replace(/^0+/, "");
  //   const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${localPhone}`;
  //   const result = await api.registerUser({
  //     phoneNumber: formattedPhone,
  //     createdUserId: signUp.createdUserId,
  //     createdSessionId: sessionId,
  //   });

  //   if (!result.success) {
  //     throw new Error(result.message || result.error || "Could not create your account");
  //   }

  //   return result.user?.id || null;
  // };

    const registerBackendUser = async (
      clerkUserId: string | null | undefined,
      sessionId: string | null | undefined
    ) => {
      if (!sessionId || !clerkUserId) {
        throw new Error(
          "Your account session could not be established. Please try again."
        );
      }

      const rawPhone = phoneNumber.replace(/\s/g, "");
      const localPhone = rawPhone.replace(/^0+/, "");

      const formattedPhone = rawPhone.startsWith("+")
        ? rawPhone
        : `${countryCode}${localPhone}`;

      // const result = await axios.post(`${API_BASE_URL}/registerUser`,{
      //   phoneNumber: formattedPhone,
      //   createdUserId: clerkUserId,
      //   createdSessionId: sessionId,
      // });

        const result = await api.registerUser({
            phoneNumber: formattedPhone,
            createdUserId: clerkUserId,
            createdSessionId: sessionId,
          });

      console.log("Backend registration result:", result);
      // console.log("Backend registration result:", result.data);

      if (!result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not create your account"
        );
      }

      return result.user?.id || null;
    };

    const updateBackendUserDetails = async (
      userId: string,
      data: Record<string, string>
    ) => {
      const result = await api.updateProfile(userId, data);

      if (!result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not update your details"
        );
      }
    };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  // const handleSendOTP = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!isLoaded || !phoneNumber.trim()) return;
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     const fullPhone = phoneNumber.replace(/\s/g, "");
  //     const localPhone = fullPhone.replace(/^0+/, "");
  //     const formattedPhone = fullPhone.startsWith("+") ? fullPhone : `${countryCode}${localPhone}`;
  //     await signUp.create({ phoneNumber: formattedPhone });
  //     await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
  //     setStep("verify");
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "Failed to send code");
  //   }
  //   setIsLoading(false);
  // };

    const handleSendOTP = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isClerkLoaded || !signUp || !phoneNumber.trim()) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const rawPhone = phoneNumber.replace(/\s/g, "");
        const localPhone = rawPhone.replace(/^0+/, "");

        const formattedPhone = rawPhone.startsWith("+")
          ? rawPhone
          : `${countryCode}${localPhone}`;

        console.log("Creating Clerk signup:", formattedPhone);

        const result = await signUp.create({
          phoneNumber: formattedPhone,
        });

        if (result.error) {
          throw result.error;
        }

        console.log("Signup created successfully");

        const verification =
          await signUp.verifications.sendPhoneCode();

        if (verification.error) {
          throw verification.error;
        }

        console.log("OTP sent successfully");

        setStep("verify");

        setCode(["", "", "", "", "", ""]);
        autoSubmitRef.current = false;
      } catch (err: unknown) {
        console.error("SEND OTP ERROR:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to send verification code");
        }
      } finally {
        setIsLoading(false);
      }
    };

  // const handleVerifyCode = async (e: React.FormEvent, submittedCode?: string) => {
  //   e.preventDefault();
  //   const fullCode = submittedCode ?? code.join("");
  //   if (!isLoaded || fullCode.length < 6) return;
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     const result = await signUp.attemptPhoneNumberVerification({ code: fullCode });
  //     if (result.status === "complete") {
  //       const backendUserId = await registerBackendUser(result.createdSessionId);
  //       await setActive({ session: result.createdSessionId });
  //       await persistBackendUserId(backendUserId);
  //       router.push("/dashboard");
  //     } else if (result.status === "missing_requirements") {
  //       setStep("details");
  //     }
  //   } catch (err: unknown) {
  //     autoSubmitRef.current = false;
  //     setError(err instanceof Error ? err.message : "Invalid code");
  //   }
  //   setIsLoading(false);
  // };
    const handleVerifyCode = async (
        e: React.FormEvent,
        submittedCode?: string
      ) => {
        e.preventDefault();

        const fullCode = submittedCode ?? code.join("");

        if (
          !isClerkLoaded ||
          !signUp ||
          fullCode.length !== 6 ||
          isLoading
        ) {
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          console.log("Verifying phone code...");

          const verification =
            await signUp.verifications.verifyPhoneCode({
              code: fullCode,
            });

          if (verification.error) {
            throw verification.error;
          }

          console.log("Phone verification successful");

        /*
          * Clerk user and session should now exist,
          * created server-side during verification.
        */
        const clerkUserId = signUp.createdUserId;

        console.log("Clerk user ID:", clerkUserId);

        if (!clerkUserId) {
          throw new Error(
            "Clerk user could not be retrieved."
          );
        }

        const sessionId = signUp.createdSessionId;

        console.log("Clerk session ID:", sessionId);

        if (!sessionId) {
          throw new Error(
            "Clerk session could not be established."
          );
        }

        /*
        * Create the corresponding user in your
        * SousuBox backend.
        */
        const backendUserId = await registerBackendUser(
          clerkUserId,
          sessionId
        );

        setBackendUserId(backendUserId);

        console.log(backendUserId)


    


          /*
          * Finalize the signup.
          */
          const finalized = await signUp.finalize();

          if (finalized.error) {
            throw finalized.error;
          }

          setStep("details");
        } catch (err: unknown) {
          console.error("VERIFY OTP ERROR:", err);

          autoSubmitRef.current = false;

          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Invalid verification code");
          }
        } finally {
          setIsLoading(false);
        }
      };



  // const handleCompleteProfile = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!isLoaded) return;
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     await signUp.update({ firstName: firstName.trim(), lastName: lastName.trim() });
  //     if (signUp.status !== "complete") {
  //       throw new Error("Please complete the remaining signup requirements.");
  //     }
  //     const backendUserId = await registerBackendUser(signUp.createdSessionId);
  //     await setActive({ session: signUp.createdSessionId });
  //     await persistBackendUserId(backendUserId);
  //     router.push("/dashboard");
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "Failed to complete profile");
  //   }
  //   setIsLoading(false);
  // };
  const handleCompleteProfile = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (
    !isClerkLoaded ||
    !signUp ||
    !firstName.trim() ||
    !lastName.trim() ||
    !username.trim() ||
    !email.trim() ||
    !dateOfBirth ||
    !backendUserId
  ) {
    return;
  }

  setIsLoading(true);
  setError("");

  try {

    /*
     * Persist the rest of the profile to the backend.
     */
    await updateBackendUserDetails(backendUserId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      dateOfBirth: new Date(dateOfBirth + "T00:00:00Z").toISOString(),
    });

    console.log("Updating Clerk profile...");

    /*
     * unsafeMetadata is copied onto the created user once
     * finalize() completes below - no active session is
     * required at this point, unlike clerk.user.update().
     */
    const result = await user?.update({
      // firstName: firstName.trim(),
      // lastName: lastName.trim(),
      unsafeMetadata: {
        userId: backendUserId,
      },
    });

    if (result.error ) {
      throw result.error;
    }

    console.log("Profile details updated");


    /*
     * Navigate to application.
     */
    router.push("/dashboard");
  } catch (err: unknown) {
    console.error(
      "COMPLETE PROFILE ERROR:",
      err
    );

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(
        "Failed to complete your profile"
      );
    }
  } finally {
    setIsLoading(false);
  }
};

  const stepIndex = STEPS.indexOf(step);

  const stepIcons: Record<Step, React.ReactNode> = {
    phone: <PhoneCall className="w-5 h-5 text-amber-700" strokeWidth={2} />,
    verify: <ShieldCheck className="w-5 h-5 text-amber-700" strokeWidth={2} />,
    details: <UserRound className="w-5 h-5 text-amber-700" strokeWidth={2} />,
  };

  // const handleCodeChange = (index: number, value: string) => {
  //   if (!/^\d*$/.test(value)) return;
  //   const newCode = [...code];
  //   const digits = value.slice(0, code.length - index);
  //   digits.split("").forEach((digit, offset) => {
  //     newCode[index + offset] = digit;
  //   });
  //   setCode(newCode);
  //   setError("");
  //   if (digits) {
  //     const nextEmpty = newCode.findIndex((digit, i) => i > index && !digit);
  //     inputRefs.current[nextEmpty === -1 ? Math.min(index + digits.length, 5) : nextEmpty]?.focus();
  //   }
  //   if (newCode.every(Boolean) && !autoSubmitRef.current) {
  //     autoSubmitRef.current = true;
  //     setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent, newCode.join("")), 0);
  //   }
  // };

  const handleCodeChange = (
      index: number,
      value: string
    ) => {
      if (!/^\d*$/.test(value)) {
        return;
      }

      const newCode = [...code];

      const digits = value.slice(
        0,
        code.length - index
      );

      digits.split("").forEach((digit, offset) => {
        if (index + offset < code.length) {
          newCode[index + offset] = digit;
        }
      });

      setCode(newCode);
      setError("");

      if (digits) {
        const nextEmpty = newCode.findIndex(
          (digit, i) =>
            i > index && !digit
        );

        const focusIndex =
          nextEmpty === -1
            ? Math.min(
                index + digits.length,
                code.length - 1
              )
            : nextEmpty;

        inputRefs.current[
          focusIndex
        ]?.focus();
      }

      /*
      * Automatically verify once all six digits
      * have been entered.
      */
      if (
        newCode.every(Boolean) &&
        newCode.join("").length === 6 &&
        !autoSubmitRef.current &&
        !isLoading
      ) {
        autoSubmitRef.current = true;

        const verificationCode =
          newCode.join("");

        setTimeout(() => {
          handleVerifyCode(
            {
              preventDefault: () => {},
            } as React.FormEvent,
            verificationCode
          );
        }, 0);
      }
    };

  // const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
  //   if (e.key === "Backspace" && !code[index] && index > 0) {
  //     inputRefs.current[index - 1]?.focus();
  //   }
  //   if (e.key === "Enter" && code.join("").length === 6 && !isLoading) {
  //     handleVerifyCode(e as unknown as React.FormEvent);
  //   }
  // };

    const handleCodeKeyDown = (
        index: number,
        e: React.KeyboardEvent
      ) => {
        if (
          e.key === "Backspace" &&
          !code[index] &&
          index > 0
        ) {
          inputRefs.current[
            index - 1
          ]?.focus();
        }

        if (
          e.key === "Enter" &&
          code.join("").length === 6 &&
          !isLoading
        ) {
          handleVerifyCode(
            e as unknown as React.FormEvent
          );
        }
      };


  // const handleCodePaste = (e: React.ClipboardEvent) => {
  //   e.preventDefault();
  //   const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  //   if (!pasted) return;
  //   const newCode = [...code];
  //   for (let i = 0; i < 6; i++) {
  //     newCode[i] = pasted[i] || "";
  //   }
  //   setCode(newCode);
  //   setError("");
  //   const nextEmpty = newCode.findIndex((d) => !d);
  //   const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
  //   inputRefs.current[focusIndex]?.focus();
  //   if (newCode.every((d) => d) && newCode.join("").length === 6) {
  //     setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent, newCode.join("")), 0);
  //   }
  // };

  const handleCodePaste = (
      e: React.ClipboardEvent
    ) => {
      e.preventDefault();

      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

      if (!pasted) {
        return;
      }

      const newCode = [
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }

      setCode(newCode);
      setError("");

      const nextEmpty = newCode.findIndex(
        (digit) => !digit
      );

      const focusIndex =
        nextEmpty === -1
          ? 5
          : nextEmpty;

      inputRefs.current[
        focusIndex
      ]?.focus();

      /*
      * Auto-submit when the pasted code
      * contains all six digits.
      */
      if (
        pasted.length === 6 &&
        !autoSubmitRef.current &&
        !isLoading
      ) {
        autoSubmitRef.current = true;

        setTimeout(() => {
          handleVerifyCode(
            {
              preventDefault: () => {},
            } as React.FormEvent,
            pasted
          );
        }, 0);
      }
    };

  return (
    <div className="min-h-screen bg-[#FBF6EF] flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </div>
          <span className="font-bold text-lg text-emerald-950 tracking-tight">SusuChain</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  i < stepIndex
                    ? "bg-emerald-700 text-white"
                    : i === stepIndex
                    ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200"
                    : "bg-emerald-950/5 text-emerald-950/30"
                }`}
              >
                {i < stepIndex ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-0.5 rounded-full ${i < stepIndex ? "bg-emerald-700" : "bg-emerald-950/10"}`} />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_2px_8px_rgba(20,60,40,0.06),0_16px_40px_rgba(20,60,40,0.08)] border border-emerald-950/[0.04]">
            {/* Header */}
            <div className="mb-8">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                {stepIcons[step]}
              </div>
              <h1 className="text-[26px] leading-tight font-bold text-emerald-950 tracking-tight">
                {step === "phone" && "Create your account"}
                {step === "verify" && "Check your phone"}
                {step === "details" && "Almost there"}
              </h1>
              <p className="text-[15px] text-emerald-950/55 mt-2 leading-relaxed">
                {step === "phone" && "Start saving together with your phone number."}
                {step === "verify" && `We sent a 6-digit code to ${phoneNumber}`}
                {step === "details" && "Tell us a little about yourself."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" && (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendOTP}
                  className="space-y-5"
                >
                  <div className="flex gap-2">
                    <PhoneCodeSwitcher value={countryCode} onChange={setCountryCode} />
                    <input
                      type="tel"
                      placeholder="055 555 5555"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                      autoFocus
                      className="flex-1 h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                  </div>

                  <div id="clerk-captcha" />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={!phoneNumber.trim() || isLoading}
                    className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_14px_rgba(4,120,87,0.25)]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-[15px]">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </motion.form>
              )}

              {step === "verify" && (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-6"
                >
                  <div className="flex gap-2.5 justify-center">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        onPaste={handleCodePaste}
                        autoComplete="one-time-code"
                        className="w-12 h-14 text-center text-xl font-bold text-emerald-950 bg-[#FBF6EF] border-2 border-emerald-950/10 rounded-2xl focus:outline-none focus:border-emerald-700 transition-colors"
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={code.join("").length < 6 || isLoading}
                      className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_14px_rgba(4,120,87,0.25)]"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setCode(["", "", "", "", "", ""]);
                        setError("");
                      }}
                      className="w-full text-center text-sm font-medium text-emerald-950/50 hover:text-emerald-700 transition-colors py-1"
                    >
                      Use a different number
                    </button>
                  </div>
                </motion.form>
              )}

              {step === "details" && (
                <motion.form
                  key="details"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleCompleteProfile}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 rounded-2xl">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-emerald-800">{phoneNumber} verified</span>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoFocus
                      className="w-full h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-emerald-950/50 px-1">Date of birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors scheme-light"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !dateOfBirth || isLoading}
                    className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_14px_rgba(4,120,87,0.25)]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Get started"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-sm text-emerald-950/55 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
