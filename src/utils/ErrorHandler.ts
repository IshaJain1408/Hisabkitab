// utils/ErrorHandler.ts
import { Alert } from "react-native";

/**
 * Centralized error logging + user alert.
 * Keeps console output consistent and shows friendly message.
 */
export function handleError(context: string, error: unknown, userMessage = "An error occurred") {
  console.error(`${context} - error:`, error);
  Alert.alert(context, userMessage);
}
