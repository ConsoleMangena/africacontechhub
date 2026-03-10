import { toast } from 'sonner';

export const handleServerError = (error: any) => {
  console.error("Server Error:", error);
  if (error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else if (error.message) {
      toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred. Please try again.");
  }
};
