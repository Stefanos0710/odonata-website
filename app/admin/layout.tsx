import { SessionClock } from "./session-clock";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SessionClock />
    </>
  );
}
