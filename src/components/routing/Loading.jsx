const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

export default Loading;
