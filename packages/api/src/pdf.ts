// Force environment validation on import
import "./env";

// Separate export for PDF service to avoid bundling Playwright with main API
export { renderRecipePdf } from "./services/pdf";
