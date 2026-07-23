export function useToast() {
  return {
    toast: (options: { title: string; description: string }) => {
      console.log(options);
    },
  };
}
