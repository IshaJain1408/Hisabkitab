import { showErrorPopup } from "../components/popup/errorPopup/ErrorPopup";

export function handleError(context: string, error: unknown, userMessage = "An error occurred") {
  console.error(`${context} - error:`, error);
   showErrorPopup({
    title: context,
    message: userMessage,
  });
}
