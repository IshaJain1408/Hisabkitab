import { Alert } from "react-native";

export function handleError(context: string, error: unknown, userMessage = "An error occurred") {
  console.error(`${context} - error:`, error);
  Alert.alert(context, userMessage);
}
