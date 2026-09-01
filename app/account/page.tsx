import { ArrowLeft, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AccountPage(){
  const user=await getChatGPTUser();
  return <main className="account-page">
    <section className="account-card">
      <a className="account-back" href="/"><ArrowLeft size={16}/> Back to MoveBeat</a>
      <div className="account-mark"><ShieldCheck size={30}/></div>
      {user?<>
        <small className="account-kicker">ACCOUNT CONNECTED</small>
        <h1>Welcome, {user.displayName}</h1>
        <p>You are securely signed in. Your MoveBeat account is ready for future saved workouts, settings and playlists.</p>
        <div className="account-user"><UserRound size={20}/><span><b>{user.displayName}</b><small>{user.email}</small></span></div>
        <a className="account-primary" href="/">Open MoveBeat</a>
        <a className="account-secondary" href={chatGPTSignOutPath("/account")}>Sign out</a>
      </>:<>
        <small className="account-kicker">SECURE LOGIN</small>
        <h1>Welcome to MoveBeat</h1>
        <p>Sign in securely to access your account. Your password is handled by the trusted sign-in provider and is never stored inside MoveBeat.</p>
        <a className="account-primary" href={chatGPTSignInPath("/account")} target="_top"><LockKeyhole size={18}/> Continue securely</a>
        <div className="account-safety"><ShieldCheck size={18}/><span><b>Private and protected</b><small>No password is saved in this app.</small></span></div>
      </>}
    </section>
  </main>
}
