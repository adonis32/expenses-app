declare global {
  interface PlausibleEvents {
    [key: string]: never;
  }
}

export function logEvent<T extends keyof PlausibleEvents>(
  type: T,
  params?: PlausibleEvents[T]
) {
  window?.plausible?.(type, { props: params } as EventOptionsTuple<
    PlausibleEvents[T]
  >);
}
