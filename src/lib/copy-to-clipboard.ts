import { toast } from "sonner";

/**
 * Copies text to the clipboard and shows a success toast.
 * @param value - Text to copy
 * @param label - Short label for the toast message
 */
export async function copyToClipboard(
  value: string,
  label = "Value",
): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Unable to copy ${label.toLowerCase()}`);
  }
}
