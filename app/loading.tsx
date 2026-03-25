import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-medium text-gray-500">Carregando...</p>
      </div>
    </div>
  );
}
