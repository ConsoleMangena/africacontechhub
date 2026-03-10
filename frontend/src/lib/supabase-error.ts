import { AuthError } from "@supabase/supabase-js";

/**
 * Maps Supabase auth error codes/messages to user-friendly messages.
 */
export function getSupabaseAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Email not confirmed":
        return "Please verify your email address before signing in. Check your inbox for a confirmation link.";
      case "User already registered":
        return "An account with this email already exists. Please sign in instead.";
      case "Signup requires a valid password":
        return "Please provide a valid password.";
      case "User not found":
        return "No account found with this email address.";
      case "Email rate limit exceeded":
        return "Too many attempts. Please wait a few minutes before trying again.";
      case "For security purposes, you can only request this once every 60 seconds":
        return "Please wait 60 seconds before requesting another email.";
      default:
        // Check for partial matches
        if (error.message.includes("rate limit")) {
          return "Too many requests. Please try again later.";
        }
        if (error.message.includes("password")) {
          return "Invalid password. Please check your password and try again.";
        }
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
