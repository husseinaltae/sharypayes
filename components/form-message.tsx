export function FormMessage({ message }: { message: { error?: string; success?: string } }) {
  if (!message) return null;

  return (
    <div
      className={`p-2 rounded ${
        message.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {message.error || message.success}
    </div>
  );
}
