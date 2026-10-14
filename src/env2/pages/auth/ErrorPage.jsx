import { useSearchParams } from "react-router-dom";
import ErrorScreen from "../../components/ErrorScreen.jsx";
import { resolveErrorType } from "../../utils/errorStates.js";

export default function ErrorPage() {
  const [params] = useSearchParams();
  return <ErrorScreen type={resolveErrorType(params.get("type"))} />;
}
