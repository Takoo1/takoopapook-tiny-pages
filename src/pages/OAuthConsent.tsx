import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Supabase auth.oauth is beta; type it locally so TS is happy.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        // Trigger the app's auth dialog by opening login with next param;
        // this app uses a modal — redirect to home with a hint.
        window.location.href = "/?next=" + encodeURIComponent(next);
        return;
      }
      if (!oauth) return setError("OAuth 2.1 authorization server is not enabled on this Supabase project.");
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Could not load this authorization request</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </main>
    );
  if (!details)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );

  const clientName = details.client?.name ?? "an app";
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-6 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Connect {clientName}</h1>
          <p className="text-sm text-muted-foreground">
            This lets <span className="font-medium">{clientName}</span> access your lottery account —
            view your tickets, Fortune Coin balance, and browse live games as you.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Deny
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Approving…" : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
