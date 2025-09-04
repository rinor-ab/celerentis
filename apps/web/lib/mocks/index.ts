export async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./browser');
  
  // Start the worker
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}
