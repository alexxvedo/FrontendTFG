export default function Background() {
  return (
    <div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-pink-900/10 to-blue-900/20 dark:from-purple-900/15 dark:via-pink-500/10 dark:to-blue-500/10  pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
      </div>
    </div>
  );
}
