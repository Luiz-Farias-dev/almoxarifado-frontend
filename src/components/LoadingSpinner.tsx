const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center">
    <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-t-white" />
    <p className="ml-2 text-white-500">{message}</p>
  </div>
);

export default LoadingSpinner;
